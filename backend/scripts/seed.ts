import mongoose from 'mongoose';
import { config } from '../src/config';
import { User } from '../src/models/User';
import { Activity } from '../src/models/Activity';
import { Participation } from '../src/models/Participation';
import { logger } from '../src/utils/logger';

/**
 * Seed database with rich sample data for development & demo
 */
async function seed() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Activity.deleteMany({}),
      Participation.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    // ── Admin ──────────────────────────────────────────────
    const admin = await User.create({
      email: 'admin@eventmanagement.edu',
      password: 'Admin@123',
      name: 'System Admin',
      role: 'admin',
    });

    // ── Faculty (8 across departments) ────────────────────
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

    const faculty4 = await User.create({
      email: 'dr.gupta@college.edu',
      password: 'Faculty@123',
      name: 'Dr. Neha Gupta',
      role: 'faculty',
      department: 'Computer Science',
    });

    const faculty5 = await User.create({
      email: 'prof.reddy@college.edu',
      password: 'Faculty@123',
      name: 'Prof. Suresh Reddy',
      role: 'faculty',
      department: 'Physics',
    });

    const faculty6 = await User.create({
      email: 'dr.iyer@college.edu',
      password: 'Faculty@123',
      name: 'Dr. Lakshmi Iyer',
      role: 'faculty',
      department: 'Mathematics',
    });

    const faculty7 = await User.create({
      email: 'prof.khan@college.edu',
      password: 'Faculty@123',
      name: 'Prof. Farhan Khan',
      role: 'faculty',
      department: 'Civil Engineering',
    });

    const faculty8 = await User.create({
      email: 'dr.nair@college.edu',
      password: 'Faculty@123',
      name: 'Dr. Ananya Nair',
      role: 'faculty',
      department: 'Electronics',
    });

    logger.info('Created 8 faculty users');

    // ── Students (12 across departments) ──────────────────
    const studentData = [
      { email: 'student1@college.edu', name: 'Arjun Verma', dept: 'Computer Science', roll: 'CS2021001' },
      { email: 'student2@college.edu', name: 'Priya Singh', dept: 'Computer Science', roll: 'CS2021002' },
      { email: 'student3@college.edu', name: 'Rahul Mehta', dept: 'Electronics', roll: 'EC2021001' },
      { email: 'student4@college.edu', name: 'Sneha Desai', dept: 'Mechanical', roll: 'ME2021001' },
      { email: 'student5@college.edu', name: 'Vikram Rao', dept: 'Computer Science', roll: 'CS2021003' },
      { email: 'student6@college.edu', name: 'Anita Joshi', dept: 'Electronics', roll: 'EC2021002' },
      { email: 'student7@college.edu', name: 'Karan Malhotra', dept: 'Physics', roll: 'PH2021001' },
      { email: 'student8@college.edu', name: 'Meera Nambiar', dept: 'Mathematics', roll: 'MA2021001' },
      { email: 'student9@college.edu', name: 'Rohit Chopra', dept: 'Civil Engineering', roll: 'CE2021001' },
      { email: 'student10@college.edu', name: 'Divya Krishnan', dept: 'Computer Science', roll: 'CS2021004' },
      { email: 'student11@college.edu', name: 'Sahil Banerjee', dept: 'Mechanical', roll: 'ME2021002' },
      { email: 'student12@college.edu', name: 'Pooja Tiwari', dept: 'Electronics', roll: 'EC2021003' },
    ];

    const students = [];
    for (const s of studentData) {
      const student = await User.create({
        email: s.email,
        password: 'Student@123',
        name: s.name,
        role: 'student',
        department: s.dept,
        rollNumber: s.roll,
      });
      students.push(student);
    }

    logger.info(`Created ${students.length} student users`);

    // ── Helper: future date ──
    const now = new Date();
    const days = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const hours = (d: number, h: number) =>
      new Date(now.getTime() + d * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000);

    // ── Activities (25 events) ────────────────────────────
    const activities = await Activity.insertMany([
      // ---- Technical ----
      {
        title: 'AI & Machine Learning Workshop',
        description:
          'Hands-on workshop covering fundamentals of AI/ML with practical examples using Python and TensorFlow. Build neural networks and understand deep learning.',
        startDate: days(7),
        endDate: hours(7, 4),
        location: 'Computer Lab, Block A',
        capacity: 50,
        availableSlots: 46,
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
        startDate: days(30),
        endDate: days(32),
        location: 'Main Auditorium',
        capacity: 500,
        availableSlots: 485,
        department: 'All Departments',
        category: 'Technical',
        posterImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'Web Development Bootcamp',
        description:
          'Intensive 3-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build and deploy a full-stack web application by the end.',
        startDate: days(10),
        endDate: days(12),
        location: 'Computer Lab, Block C',
        capacity: 30,
        availableSlots: 22,
        department: 'Computer Science',
        category: 'Workshop',
        posterImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        createdBy: faculty4._id,
        status: 'published',
      },
      {
        title: 'Cloud Computing & DevOps Masterclass',
        description:
          'Learn AWS, Docker, Kubernetes, and CI/CD pipelines. Hands-on deployment of micro-services to the cloud. Certificate provided on completion.',
        startDate: days(16),
        endDate: hours(16, 6),
        location: 'Seminar Hall, Block A',
        capacity: 60,
        availableSlots: 55,
        department: 'Computer Science',
        category: 'Workshop',
        posterImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'Cybersecurity Awareness Day',
        description:
          'Interactive sessions on ethical hacking, phishing prevention, network security, and digital forensics. CTF challenges with prizes!',
        startDate: days(22),
        endDate: hours(22, 5),
        location: 'Computer Lab, Block B',
        capacity: 80,
        availableSlots: 73,
        department: 'Computer Science',
        category: 'Technical',
        posterImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        createdBy: faculty4._id,
        status: 'published',
      },

      // ---- Seminars ----
      {
        title: 'IoT and Smart Systems Seminar',
        description:
          'Expert seminar on Internet of Things, smart home automation, and embedded systems. Industry speakers from leading tech companies.',
        startDate: days(14),
        endDate: hours(14, 3),
        location: 'Seminar Hall, Block B',
        capacity: 100,
        availableSlots: 88,
        department: 'Electronics',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
        createdBy: faculty2._id,
        status: 'published',
      },
      {
        title: 'Career Counseling Session',
        description:
          'Interactive session with industry HR professionals and career counselors. Resume building, mock interviews, and career path guidance.',
        startDate: days(5),
        endDate: hours(5, 2),
        location: 'Auditorium',
        capacity: 150,
        availableSlots: 120,
        department: 'All Departments',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Entrepreneurship Summit',
        description:
          'Meet successful entrepreneurs, learn about the startup ecosystem, pitch your ideas, and network with investors and mentors from across India.',
        startDate: days(28),
        endDate: hours(28, 6),
        location: 'Conference Hall',
        capacity: 180,
        availableSlots: 165,
        department: 'All Departments',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
      {
        title: 'Quantum Computing: The Next Frontier',
        description:
          'A guest lecture by Dr. Prakash Rao from IISc Bangalore on quantum computing principles, qubits, and real-world applications of quantum algorithms.',
        startDate: days(19),
        endDate: hours(19, 2),
        location: 'Physics Lecture Hall',
        capacity: 120,
        availableSlots: 110,
        department: 'Physics',
        category: 'Seminar',
        posterImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        createdBy: faculty5._id,
        status: 'published',
      },

      // ---- Cultural ----
      {
        title: 'Cultural Night - Rhythms of India',
        description:
          'An evening of music, dance, and cultural performances celebrating the diversity of India. Open to all students and faculty members.',
        startDate: days(21),
        endDate: hours(21, 5),
        location: 'Open Air Theatre',
        capacity: 300,
        availableSlots: 250,
        department: 'All Departments',
        category: 'Cultural',
        posterImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Traditional Dance Workshop',
        description:
          'Learn classical Indian dance forms including Bharatanatyam, Kathak, and Folk dances from professional choreographers.',
        startDate: days(12),
        endDate: hours(12, 4),
        location: 'Dance Studio, Arts Block',
        capacity: 35,
        availableSlots: 28,
        department: 'All Departments',
        category: 'Cultural',
        posterImage: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
        createdBy: faculty2._id,
        status: 'published',
      },
      {
        title: 'Photography & Short Film Festival',
        description:
          'Submit your best photographs and short films (under 5 min). Screenings, critique sessions, and awards in multiple categories.',
        startDate: days(26),
        endDate: hours(26, 6),
        location: 'Mini Auditorium',
        capacity: 70,
        availableSlots: 62,
        department: 'All Departments',
        category: 'Cultural',
        posterImage: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
        createdBy: faculty8._id,
        status: 'published',
      },

      // ---- Sports ----
      {
        title: 'Inter-College Cricket Tournament',
        description:
          'Annual cricket championship with teams from 8 colleges competing for the trophy. Matches scheduled over weekends.',
        startDate: days(45),
        endDate: days(47),
        location: 'College Sports Ground',
        capacity: 200,
        availableSlots: 180,
        department: 'All Departments',
        category: 'Sports',
        posterImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Basketball Championship',
        description:
          'Inter-department basketball tournament. Form your team and compete for the championship trophy and cash prizes.',
        startDate: days(18),
        endDate: days(19),
        location: 'Indoor Sports Complex',
        capacity: 120,
        availableSlots: 100,
        department: 'All Departments',
        category: 'Sports',
        posterImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Marathon - Run for Health',
        description:
          '5K and 10K marathon on campus. Participants get a medal and finisher T-shirt. Open to students, faculty, and staff.',
        startDate: days(40),
        endDate: hours(40, 4),
        location: 'Campus Main Gate (Start)',
        capacity: 250,
        availableSlots: 230,
        department: 'All Departments',
        category: 'Sports',
        posterImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
        createdBy: admin._id,
        status: 'published',
      },

      // ---- Competition ----
      {
        title: 'CAD Design Competition',
        description:
          'Design competition for mechanical engineering students. Create innovative mechanical designs using AutoCAD and SolidWorks.',
        startDate: days(20),
        endDate: hours(20, 6),
        location: 'Design Lab, Mechanical Block',
        capacity: 40,
        availableSlots: 35,
        department: 'Mechanical',
        category: 'Competition',
        posterImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        createdBy: faculty3._id,
        status: 'published',
      },
      {
        title: 'Robotics Competition - RoboWars',
        description:
          'Build and battle! Design your combat robot and compete in this exciting robotics competition. Cash prizes for top 3 teams.',
        startDate: days(35),
        endDate: hours(35, 8),
        location: 'Robotics Lab, Electronics Block',
        capacity: 60,
        availableSlots: 48,
        department: 'Electronics',
        category: 'Competition',
        posterImage: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=800',
        createdBy: faculty2._id,
        status: 'published',
      },
      {
        title: 'National Coding Challenge',
        description:
          'Compete with coders from across the country in a 6-hour online + offline coding contest. DSA, competitive programming, and system design rounds.',
        startDate: days(24),
        endDate: hours(24, 6),
        location: 'Computer Lab, Block A & B',
        capacity: 100,
        availableSlots: 78,
        department: 'Computer Science',
        category: 'Competition',
        posterImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
        createdBy: faculty4._id,
        status: 'published',
      },
      {
        title: 'Bridge Building Challenge',
        description:
          'Civil engineering design challenge — build a bridge from popsicle sticks that can hold maximum weight. Team event (2-3 members).',
        startDate: days(33),
        endDate: hours(33, 5),
        location: 'Civil Engineering Workshop',
        capacity: 40,
        availableSlots: 36,
        department: 'Civil Engineering',
        category: 'Competition',
        posterImage: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800',
        createdBy: faculty7._id,
        status: 'published',
      },

      // ---- Academic ----
      {
        title: 'Academic Excellence Awards Ceremony',
        description:
          'Annual awards night recognizing outstanding academic achievements, research papers, and scholarly contributions by students and faculty.',
        startDate: days(25),
        endDate: hours(25, 3),
        location: 'Main Auditorium',
        capacity: 400,
        availableSlots: 360,
        department: 'All Departments',
        category: 'Academic',
        posterImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Research Paper Writing Workshop',
        description:
          'Learn how to write, format, and publish research papers in IEEE / Springer journals. Hands-on LaTeX and citation management.',
        startDate: days(9),
        endDate: hours(9, 3),
        location: 'Library Seminar Room',
        capacity: 40,
        availableSlots: 32,
        department: 'All Departments',
        category: 'Academic',
        posterImage: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800',
        createdBy: faculty6._id,
        status: 'published',
      },

      // ---- Social ----
      {
        title: 'Blood Donation Camp',
        description:
          'Social initiative blood donation camp organized in collaboration with the Red Cross. Help save lives by donating blood.',
        startDate: days(15),
        endDate: hours(15, 6),
        location: 'Medical Center',
        capacity: 200,
        availableSlots: 170,
        department: 'All Departments',
        category: 'Social',
        posterImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Campus Clean-Up Drive',
        description:
          'Join the NSS team for a campus-wide clean-up and tree planting drive. Volunteers receive community service hours.',
        startDate: days(11),
        endDate: hours(11, 4),
        location: 'Campus Wide (Start: Main Gate)',
        capacity: 100,
        availableSlots: 85,
        department: 'All Departments',
        category: 'Social',
        posterImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
        createdBy: admin._id,
        status: 'published',
      },

      // ---- Other ----
      {
        title: 'Yoga and Meditation Session',
        description:
          'De-stress and rejuvenate with guided yoga and meditation sessions. Perfect for exam preparation and mental wellness.',
        startDate: days(6),
        endDate: hours(6, 2),
        location: 'Yoga Hall, Wellness Center',
        capacity: 50,
        availableSlots: 42,
        department: 'All Departments',
        category: 'Other',
        posterImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        createdBy: admin._id,
        status: 'published',
      },
      {
        title: 'Python Programming Workshop',
        description:
          'Beginner to intermediate Python workshop covering data structures, file handling, and an introduction to data science libraries like Pandas & NumPy.',
        startDate: days(8),
        endDate: hours(8, 5),
        location: 'Computer Lab, Block A',
        capacity: 45,
        availableSlots: 38,
        department: 'Computer Science',
        category: 'Workshop',
        posterImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        createdBy: faculty1._id,
        status: 'published',
      },
    ]);

    logger.info(`Created ${activities.length} activities`);

    // ── Sample enrollments ────────────────────────────────
    // Enroll a few students in various activities to make dashboards look populated
    const enrollments = [
      { student: students[0], activity: activities[0] },  // Arjun → AI Workshop
      { student: students[0], activity: activities[2] },  // Arjun → Web Dev Bootcamp
      { student: students[0], activity: activities[6] },  // Arjun → Career Counseling
      { student: students[1], activity: activities[0] },  // Priya → AI Workshop
      { student: students[1], activity: activities[3] },  // Priya → Cloud Computing
      { student: students[2], activity: activities[5] },  // Rahul → IoT Seminar
      { student: students[2], activity: activities[10] }, // Rahul → Dance Workshop
      { student: students[3], activity: activities[15] }, // Sneha → CAD Competition
      { student: students[3], activity: activities[12] }, // Sneha → Cricket
      { student: students[4], activity: activities[2] },  // Vikram → Web Dev Bootcamp
      { student: students[4], activity: activities[17] }, // Vikram → National Coding
      { student: students[5], activity: activities[5] },  // Anita → IoT Seminar
      { student: students[5], activity: activities[16] }, // Anita → RoboWars
      { student: students[6], activity: activities[8] },  // Karan → Quantum Computing
      { student: students[7], activity: activities[21] }, // Meera → Research Paper
      { student: students[8], activity: activities[18] }, // Rohit → Bridge Building
      { student: students[9], activity: activities[4] },  // Divya → Cybersecurity
      { student: students[9], activity: activities[17] }, // Divya → National Coding
      { student: students[10], activity: activities[15] }, // Sahil → CAD
      { student: students[11], activity: activities[16] }, // Pooja → RoboWars
    ];

    for (const { student, activity } of enrollments) {
      await Participation.create({
        userId: student._id,
        activityId: activity._id,
        status: 'enrolled',
      });
    }

    logger.info(`Created ${enrollments.length} sample enrollments`);

    // ── Summary ──
    logger.info('\n✅ Database seeded successfully!');
    logger.info('\n📊 Summary:');
    logger.info(`   - Admin: 1`);
    logger.info(`   - Faculty: 8`);
    logger.info(`   - Students: ${students.length}`);
    logger.info(`   - Activities: ${activities.length}`);
    logger.info(`   - Enrollments: ${enrollments.length}`);

    logger.info('\n🔐 Test Credentials:');
    logger.info('   Admin:   admin@eventmanagement.edu / Admin@123');
    logger.info('   Faculty: dr.sharma@college.edu / Faculty@123');
    logger.info('   Faculty: dr.gupta@college.edu / Faculty@123');
    logger.info('   Student: student1@college.edu / Student@123');
    logger.info('   (All students share password Student@123)');

    await mongoose.connection.close();
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
