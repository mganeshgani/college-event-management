import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

// Disable rate limiting in tests
process.env.RATE_LIMIT_ENROLL_MAX = '10000';
process.env.RATE_LIMIT_MAX_REQUESTS = '10000';

let mongoServer: MongoMemoryReplSet;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
