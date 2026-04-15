import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

// Helper: create user & JWT
async function createUserAndToken(overrides: Partial<Record<string, unknown>> = {}) {
  const defaults = {
    email: 'user@test.com',
    password: 'Test1234',
    name: 'Test User',
    role: 'student',
    department: 'Computer Science',
  };
  const data = { ...defaults, ...overrides };
  const user = await User.create(data);
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
  return { user, token };
}

describe('Auth Controller', () => {
  // ─── REGISTER ────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('registers a student successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'student@test.com',
        password: 'Test1234',
        name: 'Test Student',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS001',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe('student@test.com');
      expect(res.body.user.role).toBe('student');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('registers a faculty successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'faculty@test.com',
        password: 'Test1234',
        name: 'Faculty Member',
        role: 'faculty',
        department: 'Physics',
      });
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('faculty');
    });

    it('rejects duplicate email → 409', async () => {
      await User.create({ email: 'dup@test.com', password: 'Test1234', name: 'Dup User', role: 'student' });
      const res = await request(app).post('/api/auth/register').send({
        email: 'dup@test.com', password: 'Test1234', name: 'New User', role: 'student',
      });
      expect(res.status).toBe(409);
    });

    it('rejects weak password → 400', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'weak@test.com', password: 'weak', name: 'Weak Pw', role: 'student',
      });
      expect(res.status).toBe(400);
    });

    it('rejects missing required fields → 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'only@email.com' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid email format → 400', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'notanemail', password: 'Test1234', name: 'Bad Email', role: 'student',
      });
      expect(res.status).toBe(400);
    });

    it('rejects name shorter than 2 chars → 400', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'short@test.com', password: 'Test1234', name: 'X', role: 'student',
      });
      expect(res.status).toBe(400);
    });
  });

  // ─── LOGIN ───────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({ email: 'login@test.com', password: 'Test1234', name: 'Login User', role: 'student' });
    });

    it('succeeds with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'Test1234' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('fails with wrong password → 401', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'Wrong123' });
      expect(res.status).toBe(401);
    });

    it('fails with non-existent email → 401', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'nope@test.com', password: 'Test1234' });
      expect(res.status).toBe(401);
    });

    it('fails with empty body → 400', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  // ─── GET PROFILE ─────────────────────────────────────────────
  describe('GET /api/auth/profile', () => {
    it('returns profile with valid token', async () => {
      const { token } = await createUserAndToken({ email: 'profile@test.com', name: 'Profile User' });
      const res = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('profile@test.com');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('refreshTokens');
    });

    it('rejects without token → 401', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('rejects with invalid token → 401', async () => {
      const res = await request(app).get('/api/auth/profile').set('Authorization', 'Bearer garbage');
      expect(res.status).toBe(401);
    });

    it('rejects with expired token → 401', async () => {
      const { user } = await createUserAndToken({ email: 'expired@test.com' });
      const expired = jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.jwt.secret, { expiresIn: '0s' });
      const res = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${expired}`);
      expect(res.status).toBe(401);
    });
  });

  // ─── REFRESH TOKEN ───────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    it('returns new access token with valid refresh token', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        email: 'refresh@test.com', password: 'Test1234', name: 'Refresh User', role: 'student',
      });
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken: reg.body.refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('rejects invalid refresh token → 401', async () => {
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'invalid' });
      expect(res.status).toBe(401);
    });
  });

  // ─── LOGOUT ──────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('logs out successfully', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        email: 'logout@test.com', password: 'Test1234', name: 'Logout User', role: 'student',
      });
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${reg.body.accessToken}`)
        .send({ refreshToken: reg.body.refreshToken });
      expect(res.status).toBe(200);
    });

    it('rejects without auth → 401', async () => {
      const res = await request(app).post('/api/auth/logout').send({});
      expect(res.status).toBe(401);
    });
  });

  // ─── CHANGE PASSWORD ────────────────────────────────────────
  describe('POST /api/auth/change-password', () => {
    it('changes password and can login with new password', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        email: 'chpw@test.com', password: 'Test1234', name: 'ChPW User', role: 'student',
      });
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${reg.body.accessToken}`)
        .send({ currentPassword: 'Test1234', newPassword: 'NewPass1234' });
      expect(res.status).toBe(200);

      // Verify new password works
      const login = await request(app).post('/api/auth/login').send({ email: 'chpw@test.com', password: 'NewPass1234' });
      expect(login.status).toBe(200);
    });

    it('rejects wrong current password', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        email: 'chpw2@test.com', password: 'Test1234', name: 'ChPW2', role: 'student',
      });
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${reg.body.accessToken}`)
        .send({ currentPassword: 'WrongCurr1', newPassword: 'NewPass1234' });
      expect(res.status).toBe(401);
    });
  });

  // ─── UPDATE PROFILE ──────────────────────────────────────────
  describe('PATCH /api/auth/profile', () => {
    it('updates student name', async () => {
      const { token } = await createUserAndToken({ email: 'upd@test.com', name: 'Old Name', role: 'student' });
      const res = await request(app).patch('/api/auth/profile').set('Authorization', `Bearer ${token}`).send({ name: 'New Name' });
      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('New Name');
    });

    it('updates department', async () => {
      const { token } = await createUserAndToken({ email: 'dept@test.com', role: 'student' });
      const res = await request(app).patch('/api/auth/profile').set('Authorization', `Bearer ${token}`).send({ department: 'Physics' });
      expect(res.status).toBe(200);
      expect(res.body.user.department).toBe('Physics');
    });

    it('rejects name < 2 chars → 400', async () => {
      const { token } = await createUserAndToken({ email: 'short@test.com' });
      const res = await request(app).patch('/api/auth/profile').set('Authorization', `Bearer ${token}`).send({ name: 'A' });
      expect(res.status).toBe(400);
    });

    it('rejects without auth → 401', async () => {
      const res = await request(app).patch('/api/auth/profile').send({ name: 'Hack' });
      expect(res.status).toBe(401);
    });
  });

  // ─── FORGOT PASSWORD ────────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('returns 200 for existing user (creates reset token)', async () => {
      await User.create({ email: 'forgot@test.com', password: 'Test1234', name: 'Forgot', role: 'student' });
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'forgot@test.com' });
      expect(res.status).toBe(200);

      const user = await User.findOne({ email: 'forgot@test.com' }).select('+passwordResetToken +passwordResetExpires');
      expect(user!.passwordResetToken).toBeTruthy();
      expect(user!.passwordResetExpires).toBeTruthy();
    });

    it('returns 200 even for non-existent email (prevent enumeration)', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'ghost@test.com' });
      expect(res.status).toBe(200);
    });

    it('rejects invalid email format → 400', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'badfmt' });
      expect(res.status).toBe(400);
    });
  });

  // ─── AUTHORIZATION MIDDLEWARE ────────────────────────────────
  describe('Role-based access control', () => {
    it('denies student from faculty dashboard → 403', async () => {
      const { token } = await createUserAndToken({ email: 'stuA@test.com', role: 'student' });
      const res = await request(app).get('/api/dashboard/faculty').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('denies student from admin dashboard → 403', async () => {
      const { token } = await createUserAndToken({ email: 'stuB@test.com', role: 'student' });
      const res = await request(app).get('/api/dashboard/admin').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('denies faculty from admin dashboard → 403', async () => {
      const { token } = await createUserAndToken({ email: 'facA@test.com', role: 'faculty' });
      const res = await request(app).get('/api/dashboard/admin').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to access faculty dashboard → 200', async () => {
      const { token } = await createUserAndToken({ email: 'admFac@test.com', role: 'admin' });
      const res = await request(app).get('/api/dashboard/faculty').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
