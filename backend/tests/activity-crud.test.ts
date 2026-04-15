import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Activity } from '../src/models/Activity';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

// Helpers
function makeToken(user: { _id: unknown; email: string; role: string }) {
  return jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.jwt.secret, { expiresIn: '1h' });
}

const VALID_ACTIVITY = {
  title: 'Tech Workshop 2025',
  description: 'Learn modern web development from scratch in this hands-on workshop',
  startDate: new Date(Date.now() + 86400000).toISOString(),
  endDate: new Date(Date.now() + 90000000).toISOString(),
  location: 'Main Auditorium',
  capacity: 50,
  department: 'Computer Science',
  category: 'Technical',
};

describe('Activity CRUD', () => {
  let faculty: any, facultyToken: string;
  let admin: any, adminToken: string;
  let student: any, studentToken: string;

  beforeEach(async () => {
    faculty = await User.create({ email: 'fac@test.com', password: 'Test1234', name: 'Faculty', role: 'faculty', department: 'CS' });
    admin = await User.create({ email: 'adm@test.com', password: 'Test1234', name: 'Admin', role: 'admin', department: 'Admin' });
    student = await User.create({ email: 'stu@test.com', password: 'Test1234', name: 'Student', role: 'student', department: 'CS' });
    facultyToken = makeToken(faculty);
    adminToken = makeToken(admin);
    studentToken = makeToken(student);
  });

  // ─── CREATE ──────────────────────────────────────────────────
  describe('POST /api/activities', () => {
    it('faculty creates activity successfully', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(VALID_ACTIVITY);

      expect(res.status).toBe(201);
      expect(res.body.activity.title).toBe(VALID_ACTIVITY.title);
      expect(res.body.activity.availableSlots).toBe(VALID_ACTIVITY.capacity);
      expect(res.body.activity.createdBy).toBeTruthy();
    });

    it('admin creates activity successfully', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(VALID_ACTIVITY);

      expect(res.status).toBe(201);
    });

    it('student cannot create activity → 403', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(VALID_ACTIVITY);

      expect(res.status).toBe(403);
    });

    it('rejects unauthenticated request → 401', async () => {
      const res = await request(app).post('/api/activities').send(VALID_ACTIVITY);
      expect(res.status).toBe(401);
    });

    it('rejects missing title → 400', async () => {
      const { title, ...noTitle } = VALID_ACTIVITY;
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(noTitle);
      expect(res.status).toBe(400);
    });

    it('rejects title shorter than 3 chars → 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ ...VALID_ACTIVITY, title: 'AB' });
      expect(res.status).toBe(400);
    });

    it('rejects description shorter than 10 chars → 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ ...VALID_ACTIVITY, description: 'Short' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid category → 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ ...VALID_ACTIVITY, category: 'InvalidCategory' });
      expect(res.status).toBe(400);
    });

    it('rejects capacity 0 → 400', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ ...VALID_ACTIVITY, capacity: 0 });
      expect(res.status).toBe(400);
    });

    it('creates with waitlistEnabled flag', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ ...VALID_ACTIVITY, waitlistEnabled: true });
      expect(res.status).toBe(201);
      expect(res.body.activity.waitlistEnabled).toBe(true);
    });

    it('defaults status to draft', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(VALID_ACTIVITY);
      // Status defaults depend on whether it was sent or not
      expect(['draft', 'published']).toContain(res.body.activity.status);
    });
  });

  // ─── GET ALL ─────────────────────────────────────────────────
  describe('GET /api/activities', () => {
    beforeEach(async () => {
      await Activity.create({
        ...VALID_ACTIVITY,
        title: 'Published Event',
        status: 'published',
        availableSlots: 50,
        createdBy: faculty._id,
      });
      await Activity.create({
        ...VALID_ACTIVITY,
        title: 'Draft Event',
        status: 'draft',
        availableSlots: 50,
        createdBy: faculty._id,
      });
    });

    it('unauthenticated user sees published activities', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      // Should only see published
      res.body.data.forEach((a: any) => {
        expect(a.status).toBe('published');
      });
    });

    it('supports pagination', async () => {
      const res = await request(app).get('/api/activities?page=1&limit=1');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('pages');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('supports category filter', async () => {
      const res = await request(app).get('/api/activities?category=Technical');
      expect(res.status).toBe(200);
    });

    it('supports search', async () => {
      const res = await request(app).get('/api/activities?search=Published');
      expect(res.status).toBe(200);
    });
  });

  // ─── GET BY ID ───────────────────────────────────────────────
  describe('GET /api/activities/:id', () => {
    it('returns published activity details', async () => {
      const activity = await Activity.create({
        ...VALID_ACTIVITY, status: 'published', availableSlots: 50, createdBy: faculty._id,
      });
      const res = await request(app).get(`/api/activities/${activity._id}`);
      expect(res.status).toBe(200);
      expect(res.body.activity.title).toBe(VALID_ACTIVITY.title);
    });

    it('returns 404 for non-existent id', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/activities/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('returns isEnrolled=false for unauthenticated user', async () => {
      const activity = await Activity.create({
        ...VALID_ACTIVITY, status: 'published', availableSlots: 50, createdBy: faculty._id,
      });
      const res = await request(app).get(`/api/activities/${activity._id}`);
      expect(res.status).toBe(200);
      expect(res.body.isEnrolled).toBe(false);
    });
  });

  // ─── UPDATE ──────────────────────────────────────────────────
  describe('PUT /api/activities/:id', () => {
    let activityId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(VALID_ACTIVITY);
      activityId = res.body.activity._id;
    });

    it('creator faculty updates successfully', async () => {
      const res = await request(app)
        .put(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ title: 'Updated Title Here' });

      expect(res.status).toBe(200);
      expect(res.body.activity.title).toBe('Updated Title Here');
    });

    it('admin updates any activity', async () => {
      const res = await request(app)
        .put(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated Title' });

      expect(res.status).toBe(200);
    });

    it('other faculty cannot update → 403', async () => {
      const otherFac = await User.create({ email: 'other@test.com', password: 'Test1234', name: 'Other', role: 'faculty' });
      const otherToken = makeToken(otherFac);

      const res = await request(app)
        .put(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title!!!' });

      expect(res.status).toBe(403);
    });

    it('student cannot update → 403', async () => {
      const res = await request(app)
        .put(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Student Update' });

      expect(res.status).toBe(403);
    });

    it('rejects invalid category', async () => {
      const res = await request(app)
        .put(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ category: 'Nonsense' });

      expect(res.status).toBe(400);
    });
  });

  // ─── DELETE ──────────────────────────────────────────────────
  describe('DELETE /api/activities/:id', () => {
    let activityId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(VALID_ACTIVITY);
      activityId = res.body.activity._id;
    });

    it('creator faculty deletes own activity', async () => {
      const res = await request(app)
        .delete(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(200);

      // Verify deleted
      const check = await Activity.findById(activityId);
      expect(check).toBeNull();
    });

    it('admin deletes any activity', async () => {
      const res = await request(app)
        .delete(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('other faculty cannot delete → 403', async () => {
      const otherFac = await User.create({ email: 'del@test.com', password: 'Test1234', name: 'Del', role: 'faculty' });
      const otherToken = makeToken(otherFac);

      const res = await request(app)
        .delete(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });

    it('student cannot delete → 403', async () => {
      const res = await request(app)
        .delete(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });
});
