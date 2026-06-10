import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { User, Mentor, Idea, Session, Config } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/entreskill';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database.');

    const dbPath = path.join(__dirname, 'db.json');
    if (!fs.existsSync(dbPath)) {
      console.log('No local db.json found to seed from.');
      await mongoose.connection.close();
      return;
    }

    const rawData = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Clear existing collections
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await Idea.deleteMany({});
    await Session.deleteMany({});
    await Config.deleteMany({});

    // Seed Configs
    console.log('Seeding skills and interests config...');
    await Config.create({ key: 'skills', value: data.skills || [] });
    await Config.create({ key: 'interests', value: data.interests || [] });

    // Seed Users
    if (data.users && data.users.length > 0) {
      console.log(`Seeding ${data.users.length} users...`);
      const usersToInsert = data.users.map(u => {
        const { id, ...rest } = u;
        return { _id: id, ...rest };
      });
      await User.insertMany(usersToInsert);
    }

    // Seed Mentors
    if (data.mentors && data.mentors.length > 0) {
      console.log(`Seeding ${data.mentors.length} mentors...`);
      const mentorsToInsert = data.mentors.map(m => {
        const { id, ...rest } = m;
        return { _id: id, ...rest };
      });
      await Mentor.insertMany(mentorsToInsert);
    }

    // Seed Ideas
    if (data.ideas && data.ideas.length > 0) {
      console.log(`Seeding ${data.ideas.length} ideas...`);
      const ideasToInsert = data.ideas.map(i => {
        const { id, ...rest } = i;
        return { _id: id, id, ...rest };
      });
      await Idea.insertMany(ideasToInsert);
    }

    // Seed Sessions
    if (data.sessions && data.sessions.length > 0) {
      console.log(`Seeding ${data.sessions.length} sessions...`);
      const sessionsToInsert = data.sessions.map(s => {
        const { id, ...rest } = s;
        return { _id: id, ...rest };
      });
      await Session.insertMany(sessionsToInsert);
    }

    console.log('🎉 Seeding successfully completed!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seed();
