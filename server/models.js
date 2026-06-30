import mongoose from 'mongoose';

const { Schema } = mongoose;

// 1. User Schema
const UserSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'mentor', 'admin'],
    default: 'user'
  },
  skills: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  bookmarks: {
    type: [String],
    default: []
  },
  completedSteps: {
    type: Schema.Types.Mixed,
    default: {}
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

// 2. Mentor Schema
const MentorSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  expertise: {
    type: String,
    default: 'General'
  },
  bio: {
    type: String,
    default: ''
  },
  approved: {
    type: Boolean,
    default: false
  },
  resources: [
    {
      id: { type: String, default: () => `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` },
      title: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true }
    }
  ]
});

MentorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

// 3. Idea Schema
const IdeaSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  steps: [
    {
      id: { type: String, required: true },
      phase: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      checklist: { type: [String], default: [] }
    }
  ]
});

IdeaSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

// 4. Session Schema
const SessionSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  mentorId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  response: {
    type: String,
    default: ''
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

SessionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

// 5. Config/Static schemas for Skills & Interests
const ConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: [String], default: [] }
});

export const User = mongoose.model('User', UserSchema);
export const Mentor = mongoose.model('Mentor', MentorSchema);
export const Idea = mongoose.model('Idea', IdeaSchema);
export const Session = mongoose.model('Session', SessionSchema);
export const Config = mongoose.model('Config', ConfigSchema);
