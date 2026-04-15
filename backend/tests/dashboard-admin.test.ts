import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Activity } from '../src/models/Activity';
import { Participation } from '../src/models/Participation';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

function makeToken(user: { _id: unknown; email: string; role: string }) {
  return jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.jwt.secret, { expiresIn: '1h' });
}

describe('Dashboard Endpoints', () => {
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

  // ─── STUDENT DASHBOARD ──────────────────────────────────────
  describe('GET /api/dashboard/student', () => {
    it('returns student stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('enrolledActivities');
    });

    it('denies faculty → 403', async () => {
      const res = await request(app)
        .get('/api/dashboard/student')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── FACULTY DASHBOARD ──────────────────────────────────────
  describe('GET /api/dashboard/faculty', () => {
    it('returns faculty stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/faculty')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalActivities');
    });

    it('admin can access faculty dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard/faculty')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('denies student → 403', async () => {
      const res = await request(app)
        .get('/api/dashboard/faculty')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── ADMIN DASHBOARD ────────────────────────────────────────
  describe('GET /api/dashboard/admin', () => {
    it('returns admin stats with department and category breakdowns', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('totalUsers');
      expect(res.body.stats).toHaveProperty('totalActivities');
      expect(res.body).toHaveProperty('departmentStats');
      expect(res.body).toHaveProperty('categoryStats');
    });

    it('denies faculty → 403', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });

    it('denies student → 403', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── ADMIN: GET ALL USERS ───────────────────────────────────
  describe('GET /api/dashboard/admin/users', () => {
    it('returns paginated user list', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.users.length).toBeGreaterThanOrEqual(3);
    });

    it('filters by role', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.users.forEach((u: any) => expect(u.role).toBe('student'));
    });

    it('supports search by name', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/users?search=Faculty')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThanOrEqual(1);
    });

    it('denies non-admin → 403', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/users')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── ADMIN: GET ALL ACTIVITIES ──────────────────────────────
  describe('GET /api/dashboard/admin/activities', () => {
    beforeEach(async () => {
      await Activity.create({
        title: 'Admin Activity Test',
        description: 'Activity for admin listing testing',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 90000000),
        location: 'Hall A',
        capacity: 50,
        availableSlots: 50,
        department: 'CS',
        category: 'Technical',
        status: 'published',
        createdBy: faculty._id,
      });
    });

    it('returns activities with pagination', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('activities');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.activities.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by status', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/activities?status=published')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('denies non-admin → 403', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin/activities')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── ADMIN: UPDATE USER ROLE ────────────────────────────────
  describe('PATCH /api/dashboard/admin/users/:id/role', () => {
    it('admin promotes student to faculty', async () => {
      const res = await request(app)
        .patch(`/api/dashboard/admin/users/${student._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'faculty' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('faculty');

      // Verify in DB
      const updated = await User.findById(student._id);
      expect(updated!.role).toBe('faculty');
    });

    it('admin promotes student to admin', async () => {
      const res = await request(app)
        .patch(`/api/dashboard/admin/users/${student._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
    });

    it('admin cannot demote self', async () => {
      const res = await request(app)
        .patch(`/api/dashboard/admin/users/${admin._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'student' });

      expect(res.status).toBe(400);
    });

    it('rejects invalid role', async () => {
      const res = await request(app)
        .patch(`/api/dashboard/admin/users/${student._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'superuser' });

      expect(res.status).toBe(400);
    });

    it('non-admin cannot change roles → 403', async () => {
      const res = await request(app)
        .patch(`/api/dashboard/admin/users/${student._id}/role`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
    });

    it('clears refresh tokens on role change', async () => {
      // Give student a refresh token
      await User.findByIdAndUpdate(student._id, {
        $push: { refreshTokens: 'sometoken123' },
      });

      await request(app)
        .patch(`/api/dashboard/admin/users/${student._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'faculty' });

      const updated = await User.findById(student._id);
      expect(updated!.refreshTokens.length).toBe(0);
    });
  });

  // ─── BULK STATUS UPDATE ─────────────────────────────────────
  describe('PATCH /api/activities/bulk/status', () => {
    let act1Id: string, act2Id: string;

    beforeEach(async () => {
      const a1 = await Activity.create({
        title: 'Bulk Test 1',
        description: 'Activity for bulk status testing 1',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 90000000),
        location: 'Hall',
        capacity: 10,
        availableSlots: 10,
        department: 'CS',
        category: 'Technical',
        status: 'draft',
        createdBy: faculty._id,
      });
      const a2 = await Activity.create({
        title: 'Bulk Test 2',
        description: 'Activity for bulk status testing 2',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 90000000),
        location: 'Hall',
        capacity: 20,
        availableSlots: 20,
        department: 'CS',
        category: 'Workshop',
        status: 'draft',
        createdBy: faculty._id,
      });
      act1Id = a1._id.toString();
      act2Id = a2._id.toString();
    });

    it('admin updates multiple activities to published', async () => {
      const res = await request(app)
        .patch('/api/activities/bulk/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activityIds: [act1Id, act2Id], status: 'published' });

      expect(res.status).toBe(200);
      expect(res.body.modifiedCount).toBe(2);

      const a1 = await Activity.findById(act1Id);
      const a2 = await Activity.findById(act2Id);
      expect(a1!.status).toBe('published');
      expect(a2!.status).toBe('published');
    });

    it('admin updates to cancelled', async () => {
      const res = await request(app)
        .patch('/api/activities/bulk/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activityIds: [act1Id], status: 'cancelled' });

      expect(res.status).toBe(200);
      expect(res.body.modifiedCount).toBe(1);
    });

    it('rejects invalid status', async () => {
      const res = await request(app)
        .patch('/api/activities/bulk/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activityIds: [act1Id], status: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('rejects empty activityIds array', async () => {
      const res = await request(app)
        .patch('/api/activities/bulk/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activityIds: [], status: 'published' });

      expect(res.status).toBe(400);
    });

    it('rejects invalid ObjectIds', async () => {
      const res = await request(app)
        .patch('/api/activities/bulk/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activityIds: ['notanobjectid'], status: 'published' });

      expect(res.status).toBe(400);
    });

    it('non-admin cannot bulk update → 403', async () => {
      const res = await request(app)
        .patch('/api/activities/bulk/status')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ activityIds: [act1Id], status: 'published' });

      expect(res.status).toBe(403);
    });
  });

  // ─── CLONE ACTIVITY ─────────────────────────────────────────
  describe('POST /api/activities/:id/clone', () => {
    let activityId: string;

    beforeEach(async () => {
      const a = await Activity.create({
        title: 'Original Activity',
        description: 'This is the original activity to be cloned',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 90000000),
        location: 'Lab 101',
        capacity: 30,
        availableSlots: 25,
        department: 'Physics',
        category: 'Workshop',
        status: 'published',
        waitlistEnabled: true,
        createdBy: faculty._id,
      });
      activityId = a._id.toString();
    });

    it('faculty clones own activity', async () => {
      const res = await request(app)
        .post(`/api/activities/${activityId}/clone`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Copy of Original Activity');
      expect(res.body.status).toBe('draft');
      expect(res.body.availableSlots).toBe(30); // Reset to capacity
      expect(res.body.capacity).toBe(30);
      expect(res.body.department).toBe('Physics');
      expect(res.body.category).toBe('Workshop');
      expect(res.body._id).not.toBe(activityId);
    });

    it('admin clones any activity', async () => {
      const res = await request(app)
        .post(`/api/activities/${activityId}/clone`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.title).toContain('Copy of');
    });

    it('other faculty cannot clone → 403', async () => {
      const otherFac = await User.create({ email: 'other@test.com', password: 'Test1234', name: 'Other', role: 'faculty' });
      const otherToken = makeToken(otherFac);

      const res = await request(app)
        .post(`/api/activities/${activityId}/clone`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    it('student cannot clone → 403', async () => {
      const res = await request(app)
        .post(`/api/activities/${activityId}/clone`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent activity', async () => {
      const res = await request(app)
        .post('/api/activities/507f1f77bcf86cd799439011/clone')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── ANALYTICS ──────────────────────────────────────────────
  describe('GET /api/dashboard/analytics/:id', () => {
    let activityId: string;

    beforeEach(async () => {
      const a = await Activity.create({
        title: 'Analytics Activity',
        description: 'Activity for analytics testing purposes',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 90000000),
        location: 'Room C',
        capacity: 20,
        availableSlots: 18,
        department: 'CS',
        category: 'Seminar',
        status: 'published',
        createdBy: faculty._id,
      });
      activityId = a._id.toString();

      // Add enrollments
      await Participation.create({ activityId, userId: student._id, status: 'enrolled' });
    });

    it('faculty can access analytics', async () => {
      const res = await request(app)
        .get(`/api/dashboard/analytics/${activityId}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('activity');
    });

    it('admin can access analytics', async () => {
      const res = await request(app)
        .get(`/api/dashboard/analytics/${activityId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('student cannot access analytics → 403', async () => {
      const res = await request(app)
        .get(`/api/dashboard/analytics/${activityId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });
});
