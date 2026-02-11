import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Activity } from '../src/models/Activity';
import { Participation } from '../src/models/Participation';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

describe('Activity Enrollment - Race Condition Tests', () => {
  let studentToken: string;
  let studentId: string;
  let activityId: string;

  beforeEach(async () => {
    // Create faculty
    const faculty = await User.create({
      email: 'faculty@test.com',
      password: 'Test1234',
      name: 'Test Faculty',
      role: 'faculty',
    });

    const facultyToken = jwt.sign(
      { userId: faculty._id, email: faculty.email, role: faculty.role },
      config.jwt.secret
    );

    // Create activity with only 1 slot
    const activityResponse = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Limited Activity',
        description: 'Activity with only one slot',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 90000000).toISOString(),
        location: 'Test Hall',
        capacity: 1,
        department: 'Computer Science',
        category: 'Technical',
        status: 'published',
      });

    activityId = activityResponse.body.activity._id;

    // Create student
    const student = await User.create({
      email: 'student1@test.com',
      password: 'Test1234',
      name: 'Test Student 1',
      role: 'student',
    });

    studentId = student._id.toString();
    studentToken = jwt.sign(
      { userId: student._id, email: student.email, role: student.role },
      config.jwt.secret
    );
  });

  it('should handle atomic slot decrement correctly', async () => {
    // First enrollment should succeed
    const response1 = await request(app)
      .post(`/api/activities/${activityId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response1.status).toBe(200);
    expect(response1.body.message).toContain('Successfully enrolled');

    // Verify slot was decremented
    const activity = await Activity.findById(activityId);
    expect(activity!.availableSlots).toBe(0);

    // Second enrollment attempt should fail (duplicate)
    const response2 = await request(app)
      .post(`/api/activities/${activityId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response2.status).toBe(409);
  });

  it('should prevent duplicate enrollments at database level', async () => {
    // First enrollment
    await request(app)
      .post(`/api/activities/${activityId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    // Try to create duplicate participation directly
    try {
      await Participation.create({
        activityId,
        userId: studentId,
        status: 'enrolled',
      });
      fail('Should have thrown duplicate key error');
    } catch (error: any) {
      expect(error.code).toBe(11000); // Duplicate key error
    }
  });

  it('should reject enrollment when activity is full', async () => {
    // Manually set slots to 0
    await Activity.findByIdAndUpdate(activityId, { availableSlots: 0 });

    const response = await request(app)
      .post(`/api/activities/${activityId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('full');
  });

  it('should handle concurrent enrollments correctly', async () => {
    // Create second student
    const student2 = await User.create({
      email: 'student2@test.com',
      password: 'Test1234',
      name: 'Test Student 2',
      role: 'student',
    });

    const student2Token = jwt.sign(
      { userId: student2._id, email: student2.email, role: student2.role },
      config.jwt.secret
    );

    // Simulate concurrent enrollment attempts
    const [response1, response2] = await Promise.all([
      request(app)
        .post(`/api/activities/${activityId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`),
      request(app)
        .post(`/api/activities/${activityId}/enroll`)
        .set('Authorization', `Bearer ${student2Token}`),
    ]);

    // One should succeed, one should fail
    const statuses = [response1.status, response2.status].sort();
    expect(statuses).toEqual([200, 400]); // One success, one failure

    // Verify only one enrollment exists and slot is exactly 0
    const activity = await Activity.findById(activityId);
    expect(activity!.availableSlots).toBe(0);

    const enrollmentCount = await Participation.countDocuments({
      activityId,
      status: 'enrolled',
    });
    expect(enrollmentCount).toBe(1);
  });
});
