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

    // Create student users (one by one to trigger password hashing)
    const student1 = await User.create({
      email: 'student1@college.edu',
      password: 'Student@123',
      name: 'Arjun Verma',
      role: 'student',
      department: 'Computer Science',
      rollNumber: 'CS2021001',
    });

    const student2 = await User.create({
      email: 'student2@college.edu',
      password: 'Student@123',
      name: 'Priya Singh',
      role: 'student',
      department: 'Computer Science',
      rollNumber: 'CS2021002',
    });

    const student3 = await User.create({
      email: 'student3@college.edu',
      password: 'Student@123',
      name: 'Rahul Mehta',
      role: 'student',
      department: 'Electronics',
      rollNumber: 'EC2021001',
    });

    const student4 = await User.create({
      email: 'student4@college.edu',
      password: 'Student@123',
      name: 'Sneha Desai',
      role: 'student',
      department: 'Mechanical',
      rollNumber: 'ME2021001',
    });

    const student5 = await User.create({
      email: 'student5@college.edu',
      password: 'Student@123',
      name: 'Vikram Rao',
      role: 'student',
      department: 'Computer Science',
      rollNumber: 'CS2021003',
    });

    const students = [student1, student2, student3, student4, student5];

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
      {
        title: 'Academic Excellence Awards Ceremony',
        description:
          'Annual awards ceremony recognizing outstanding academic achievements, research papers, and scholarly contributions by students and faculty.',
        startDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: 'Main Auditorium',
        capacity: 400,
        availableSlots: 400,
        department: 'All Departments',
        category: 'Academic',
        posterImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Blood Donation Camp',
        description:
          'Social initiative blood donation camp organized in collaboration with the Red Cross. Help save lives by donating blood.',
        startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        location: 'Medical Center',
        capacity: 200,
        availableSlots: 200,
        department: 'All Departments',
        category: 'Social',
        posterImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Traditional Dance Workshop',
        description:
          'Learn classical Indian dance forms including Bharatanatyam, Kathak, and Folk dances from professional choreographers.',
        startDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: 'Dance Studio, Arts Block',
        capacity: 35,
        availableSlots: 35,
        department: 'All Departments',
        category: 'Cultural',
        posterImage: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
        createdBy: faculty2._id,
        status: 'published',
      },
      {
        title: 'Basketball Championship',
        description:
          'Inter-department basketball tournament. Form your team and compete for the championship trophy and prizes.',
        startDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
        location: 'Indoor Sports Complex',
        capacity: 120,
        availableSlots: 120,
        department: 'All Departments',
        category: 'Sports',
        posterImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Python Programming Workshop',
        description:
          'Beginner to intermediate Python workshop covering basics, data structures, file handling, and introduction to data science libraries.',
        startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        location: 'Computer Lab, Block A',
        capacity: 45,
        availableSlots: 45,
        department: 'Computer Science',
        category: 'Workshop',
        posterImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'Robotics Competition - RoboWars',
        description:
          'Build and battle! Design your own combat robot and compete in this exciting robotics competition with cash prizes.',
        startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        location: 'Robotics Lab, Electronics Block',
        capacity: 60,
        availableSlots: 60,
        department: 'Electronics',
        category: 'Competition',
        posterImage: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=800',
        createdBy: faculty2._id,
        status: 'published',
      },
      {
        title: 'Entrepreneurship Summit',
        description:
          'Meet successful entrepreneurs, learn about startup ecosystem, pitch your ideas, and network with investors and mentors.',
        startDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        location: 'Conference Hall',
        capacity: 180,
        availableSlots: 180,
        department: 'All Departments',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'Yoga and Meditation Session',
        description:
          'De-stress and rejuvenate with guided yoga and meditation sessions. Perfect for exam preparation and mental wellness.',
        startDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'Yoga Hall, Wellness Center',
        capacity: 50,
        availableSlots: 50,
        department: 'All Departments',
        category: 'Other',
        posterImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
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
