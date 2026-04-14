import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { User } from '../src/models/User';
import { Activity } from '../src/models/Activity';
import { Participation } from '../src/models/Participation';
import { config } from '../src/config';

describe('Participants Access', () => {
  it('allows both faculty and admin to view student details', async () => {
    const creatorFaculty = await User.create({
      email: 'creator.faculty@test.com',
      password: 'Test1234',
      name: 'Creator Faculty',
      role: 'faculty',
      department: 'Computer Science',
    });

    const otherFaculty = await User.create({
      email: 'other.faculty@test.com',
      password: 'Test1234',
      name: 'Other Faculty',
      role: 'faculty',
      department: 'Computer Science',
    });

    const admin = await User.create({
      email: 'admin@test.com',
      password: 'Test1234',
      name: 'Admin User',
      role: 'admin',
      department: 'Administration',
    });

    const student = await User.create({
      email: 'student.participant@test.com',
      password: 'Test1234',
      name: 'Participant Student',
      role: 'student',
      department: 'Computer Science',
      rollNumber: 'CS999',
    });

    const activity = await Activity.create({
      title: 'Participants Access Activity',
      description: 'Activity to verify participants visibility by roles',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 90000000),
      location: 'Main Hall',
      capacity: 100,
      availableSlots: 99,
      department: 'Computer Science',
      category: 'Technical',
      status: 'published',
      createdBy: creatorFaculty._id,
    });

    await Participation.create({
      activityId: activity._id,
      userId: student._id,
      status: 'enrolled',
    });

    const otherFacultyToken = jwt.sign(
      {
        userId: otherFaculty._id,
        email: otherFaculty.email,
        role: otherFaculty.role,
      },
      config.jwt.secret
    );

    const adminToken = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        role: admin.role,
      },
      config.jwt.secret
    );

    const facultyResponse = await request(app)
      .get(`/api/activities/${activity._id}/participants`)
      .set('Authorization', `Bearer ${otherFacultyToken}`);

    expect(facultyResponse.status).toBe(200);
    expect(facultyResponse.body.participants).toHaveLength(1);
    expect(facultyResponse.body.participants[0].email).toBe(student.email);
    expect(facultyResponse.body.participants[0].rollNumber).toBe(student.rollNumber);

    const adminResponse = await request(app)
      .get(`/api/activities/${activity._id}/participants`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.participants).toHaveLength(1);
    expect(adminResponse.body.participants[0].name).toBe(student.name);
  });
});