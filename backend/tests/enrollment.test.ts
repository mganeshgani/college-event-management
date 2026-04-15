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

const BASE_ACTIVITY = {
  title: 'Enrollment Test Activity',
  description: 'Activity for enrollment testing purposes',
  startDate: new Date(Date.now() + 86400000).toISOString(),
  endDate: new Date(Date.now() + 90000000).toISOString(),
  location: 'Test Hall',
  capacity: 2,
  department: 'Computer Science',
  category: 'Technical',
};

describe('Activity Enrollment', () => {
  let faculty: any, facultyToken: string;
  let student1: any, student1Token: string;
  let student2: any, student2Token: string;

  beforeEach(async () => {
    faculty = await User.create({ email: 'fac@test.com', password: 'Test1234', name: 'Faculty', role: 'faculty' });
    student1 = await User.create({ email: 'stu1@test.com', password: 'Test1234', name: 'Student1', role: 'student' });
    student2 = await User.create({ email: 'stu2@test.com', password: 'Test1234', name: 'Student2', role: 'student' });
    facultyToken = makeToken(faculty);
    student1Token = makeToken(student1);
    student2Token = makeToken(student2);
  });

  async function createPublishedActivity(overrides: Record<string, unknown> = {}) {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ ...BASE_ACTIVITY, status: 'published', ...overrides });
    return res.body.activity._id;
  }

  // ─── BASIC ENROLLMENT ────────────────────────────────────────
  describe('POST /api/activities/:id/enroll', () => {
    it('student enrolls successfully', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      const res = await request(app)
        .post(`/api/activities/${actId}/enroll`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('enrolled');

      // Verify in DB
      const p = await Participation.findOne({ activityId: actId, userId: student1._id });
      expect(p).toBeTruthy();
      expect(p!.status).toBe('enrolled');
    });

    it('decrements availableSlots after enrollment', async () => {
      const actId = await createPublishedActivity({ capacity: 5 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      const activity = await Activity.findById(actId);
      expect(activity!.availableSlots).toBe(4);
    });

    it('rejects duplicate enrollment → 409', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);
      const res = await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(409);
    });

    it('rejects when activity is full → 400', async () => {
      const actId = await createPublishedActivity({ capacity: 1 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);
      const res = await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(400);
    });

    it('faculty cannot enroll → 403', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      const res = await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects enrollment to non-existent activity → 404', async () => {
      const res = await request(app)
        .post('/api/activities/507f1f77bcf86cd799439011/enroll')
        .set('Authorization', `Bearer ${student1Token}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── WAITLIST ────────────────────────────────────────────────
  describe('Waitlist behavior', () => {
    it('waitlists student when activity is full and waitlist enabled', async () => {
      const actId = await createPublishedActivity({ capacity: 1, waitlistEnabled: true });

      // First student gets enrolled
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      // Second student gets waitlisted
      const res = await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('waitlist');

      const p = await Participation.findOne({ activityId: actId, userId: student2._id });
      expect(p!.status).toBe('waitlisted');
    });

    it('rejects when full and waitlist NOT enabled → 400', async () => {
      const actId = await createPublishedActivity({ capacity: 1, waitlistEnabled: false });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);
      const res = await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(400);
    });
  });

  // ─── CANCEL ENROLLMENT ──────────────────────────────────────
  describe('POST /api/activities/:id/cancel', () => {
    it('student cancels enrollment successfully', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      const res = await request(app)
        .post(`/api/activities/${actId}/cancel`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);

      // Verify slot restored
      const activity = await Activity.findById(actId);
      expect(activity!.availableSlots).toBe(10);
    });

    it('promotes waitlisted student when enrolled cancels', async () => {
      const actId = await createPublishedActivity({ capacity: 1, waitlistEnabled: true });

      // Student 1 enrolls, student 2 waitlisted
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student2Token}`);

      // Student 1 cancels
      await request(app).post(`/api/activities/${actId}/cancel`).set('Authorization', `Bearer ${student1Token}`);

      // Student 2 should be promoted
      const p = await Participation.findOne({ activityId: actId, userId: student2._id });
      expect(p!.status).toBe('enrolled');

      // Slots should still be 0 (since waitlisted person took the slot)
      const activity = await Activity.findById(actId);
      expect(activity!.availableSlots).toBe(0);
    });

    it('rejects cancel when not enrolled → 404', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      const res = await request(app)
        .post(`/api/activities/${actId}/cancel`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── MY ENROLLMENTS ──────────────────────────────────────────
  describe('GET /api/activities/my/enrollments', () => {
    it('returns student enrollments', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      const res = await request(app)
        .get('/api/activities/my/enrollments')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.enrollments.length).toBe(1);
    });

    it('returns empty array when no enrollments', async () => {
      const res = await request(app)
        .get('/api/activities/my/enrollments')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.enrollments.length).toBe(0);
    });

    it('faculty cannot access → 403', async () => {
      const res = await request(app)
        .get('/api/activities/my/enrollments')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── RACE CONDITIONS ────────────────────────────────────────
  describe('Concurrency', () => {
    it('handles concurrent enrollments for 1 slot correctly', async () => {
      const actId = await createPublishedActivity({ capacity: 1 });

      const [r1, r2] = await Promise.all([
        request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`),
        request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student2Token}`),
      ]);

      const statuses = [r1.status, r2.status].sort();
      // One should succeed (200), the other should fail (400 for full or 409 for duplicate-like conflict)
      expect(statuses[0]).toBe(200);
      expect([400, 409]).toContain(statuses[1]);

      const count = await Participation.countDocuments({ activityId: actId, status: 'enrolled' });
      expect(count).toBe(1);
    });

    it('prevents duplicate participation at DB level', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      await Participation.create({ activityId: actId, userId: student1._id, status: 'enrolled' });

      try {
        await Participation.create({ activityId: actId, userId: student1._id, status: 'enrolled' });
        fail('Should have thrown duplicate key error');
      } catch (error: any) {
        expect(error.code).toBe(11000);
      }
    });
  });

  // ─── PARTICIPANTS ACCESS ─────────────────────────────────────
  describe('GET /api/activities/:id/participants', () => {
    it('faculty can view participants', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      const res = await request(app)
        .get(`/api/activities/${actId}/participants`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.participants.length).toBe(1);
      expect(res.body.participants[0].name).toBe('Student1');
    });

    it('admin can view participants of any activity', async () => {
      const adminToken = makeToken(await User.create({ email: 'admin2@test.com', password: 'Test1234', name: 'Admin2', role: 'admin' }));
      const actId = await createPublishedActivity({ capacity: 10 });
      await request(app).post(`/api/activities/${actId}/enroll`).set('Authorization', `Bearer ${student1Token}`);

      const res = await request(app)
        .get(`/api/activities/${actId}/participants`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.participants.length).toBe(1);
    });

    it('student cannot view participants → 403', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      const res = await request(app)
        .get(`/api/activities/${actId}/participants`)
        .set('Authorization', `Bearer ${student1Token}`);
      expect(res.status).toBe(403);
    });

    it('returns pagination info', async () => {
      const actId = await createPublishedActivity({ capacity: 10 });
      const res = await request(app)
        .get(`/api/activities/${actId}/participants?page=1&limit=10`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page');
    });
  });
});
