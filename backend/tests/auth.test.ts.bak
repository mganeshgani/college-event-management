import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'student@test.com',
          password: 'Test1234',
          name: 'Test Student',
          role: 'student',
          department: 'Computer Science',
          rollNumber: 'CS001',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('student@test.com');
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        email: 'existing@test.com',
        password: 'Test1234',
        name: 'Existing User',
        role: 'student',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          password: 'Test1234',
          name: 'New User',
          role: 'student',
        });

      expect(response.status).toBe(409);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'weak',
          name: 'Test User',
          role: 'student',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'login@test.com',
        password: 'Test1234',
        name: 'Login User',
        role: 'student',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPass123',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get profile with valid token', async () => {
      const user = await User.create({
        email: 'profile@test.com',
        password: 'Test1234',
        name: 'Profile User',
        role: 'student',
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('profile@test.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
    });
  });
});
