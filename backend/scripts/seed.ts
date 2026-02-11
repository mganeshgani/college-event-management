import mongoose from 'mongoose';
import { config } from '../src/config';
import { User } from '../src/models/User';
import { Activity } from '../src/models/Activity';
import { logger } from '../src/utils/logger';

/**
 * Seed database with sample data for development
 */
async function seed() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    // Create admin
    const admin = await User.create({
      email: 'admin@eventmanagement.edu',
      password: 'Admin@123',
      name: 'System Admin',
      role: 'admin',
    });
    logger.info('Created admin user');

    // Create faculty users
    const faculty1 = await User.create({
      email: 'dr.sharma@college.edu',
      password: 'Faculty@123',
      name: 'Dr. Rajesh Sharma',
      role: 'faculty',
      department: 'Computer Science',
    });

    const faculty2 = await User.create({
      email: 'prof.patel@college.edu',
      password: 'Faculty@123',
      name: 'Prof. Priya Patel',
      role: 'faculty',
      department: 'Electronics',
    });

    const faculty3 = await User.create({
      email: 'dr.kumar@college.edu',
      password: 'Faculty@123',
      name: 'Dr. Amit Kumar',
      role: 'faculty',
      department: 'Mechanical',
    });

    logger.info('Created faculty users');

    // Create student users
    const students = await User.insertMany([
      {
        email: 'student1@college.edu',
        password: 'Student@123',
        name: 'Arjun Verma',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2021001',
      },
      {
        email: 'student2@college.edu',
        password: 'Student@123',
        name: 'Priya Singh',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2021002',
      },
      {
        email: 'student3@college.edu',
        password: 'Student@123',
        name: 'Rahul Mehta',
        role: 'student',
        department: 'Electronics',
        rollNumber: 'EC2021001',
      },
      {
        email: 'student4@college.edu',
        password: 'Student@123',
        name: 'Sneha Desai',
        role: 'student',
        department: 'Mechanical',
        rollNumber: 'ME2021001',
      },
      {
        email: 'student5@college.edu',
        password: 'Student@123',
        name: 'Vikram Rao',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2021003',
      },
    ]);

    logger.info('Created student users');

    // Create sample activities
    const now = new Date();
    const activities = await Activity.insertMany([
      {
        title: 'AI & Machine Learning Workshop',
        description:
          'Hands-on workshop covering fundamentals of AI/ML with practical examples using Python and TensorFlow. Learn to build neural networks and understand deep learning concepts.',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: 'Computer Lab, Block A',
        capacity: 50,
        availableSlots: 50,
        department: 'Computer Science',
        category: 'Workshop',
        posterImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'Annual Tech Fest 2026',
        description:
          'Three-day technical festival featuring coding competitions, hackathons, robotics challenges, and tech talks by industry experts. Prize pool of ₹5 lakhs!',
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
        location: 'Main Auditorium',
        capacity: 500,
        availableSlots: 500,
        department: 'All Departments',
        category: 'Technical',
        posterImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'IoT and Smart Systems Seminar',
        description:
          'Expert seminar on Internet of Things, smart home automation, and embedded systems. Industry speakers from leading tech companies.',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: 'Seminar Hall, Block B',
        capacity: 100,
        availableSlots: 100,
        department: 'Electronics',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
        createdBy: faculty2._id,
        status: 'published',
      },
      {
        title: 'Cultural Night - Rhythms of India',
        description:
          'Evening of music, dance, and cultural performances celebrating the diversity of India. Open to all students and faculty members.',
        startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        location: 'Open Air Theatre',
        capacity: 300,
        availableSlots: 300,
        department: 'All Departments',
        category: 'Cultural',
        posterImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Inter-College Cricket Tournament',
        description:
          'Annual cricket championship with teams from 8 colleges competing for the trophy. Matches scheduled over weekends.',
        startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
        location: 'College Sports Ground',
        capacity: 200,
        availableSlots: 200,
        department: 'All Departments',
        category: 'Sports',
        posterImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Web Development Bootcamp',
        description:
          'Intensive 3-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build and deploy a full-stack web application.',
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        location: 'Computer Lab, Block C',
        capacity: 30,
        availableSlots: 30,
        department: 'Computer Science',
        category: 'Workshop',
        posterImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'CAD Design Competition',
        description:
          'Design competition for mechanical engineering students. Create innovative mechanical designs using AutoCAD and SolidWorks.',
        startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        location: 'Design Lab, Mechanical Block',
        capacity: 40,
        availableSlots: 40,
        department: 'Mechanical',
        category: 'Competition',
        posterImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        createdBy: faculty3._id,
        status: 'published',
      },
      {
        title: 'Career Counseling Session',
        description:
          'Interactive session with industry HR professionals and career counselors. Get guidance on resume building, interviews, and career paths.',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'Auditorium',
        capacity: 150,
        availableSlots: 150,
        department: 'All Departments',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        createdBy: admin._id,
        status: 'published',
      },
    ]);

    logger.info('Created sample activities');

    // Summary
    logger.info('\n✅ Database seeded successfully!');
    logger.info('\n📊 Summary:');
    logger.info(`   - Admin: 1`);
    logger.info(`   - Faculty: 3`);
    logger.info(`   - Students: 5`);
    logger.info(`   - Activities: ${activities.length}`);

    logger.info('\n🔐 Test Credentials:');
    logger.info('   Admin: admin@eventmanagement.edu / Admin@123');
    logger.info('   Faculty: dr.sharma@college.edu / Faculty@123');
    logger.info('   Student: student1@college.edu / Student@123');

    await mongoose.connection.close();
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
