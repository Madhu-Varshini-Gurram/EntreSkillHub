import { User, Mentor, Idea, Session, Config } from './models.js';

// readDB returns the entire database structure, primarily used to populate configs or compatibility
export async function readDB() {
  const users = await User.find({});
  const mentors = await Mentor.find({});
  const ideas = await Idea.find({});
  const sessions = await Session.find({});
  const skillsConfig = await Config.findOne({ key: 'skills' });
  const interestsConfig = await Config.findOne({ key: 'interests' });

  return {
    users,
    mentors,
    ideas,
    sessions,
    skills: skillsConfig ? skillsConfig.value : [],
    interests: interestsConfig ? interestsConfig.value : []
  };
}

// writeDB remains as a placeholder to prevent syntax crashes in older routines
export async function writeDB(data) {
  return true;
}

export async function getUsers() {
  return User.find({});
}

export async function getUserById(id) {
  return User.findById(id);
}

export async function getUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

export async function createUser(user) {
  const newUser = new User({
    _id: user.id || `usr_${Date.now()}`,
    ...user
  });
  return newUser.save();
}

export async function updateUser(id, updates) {
  return User.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

export async function getMentors() {
  return Mentor.find({});
}

export async function getMentorById(id) {
  return Mentor.findById(id);
}

export async function getMentorByUserId(userId) {
  return Mentor.findOne({ userId });
}

export async function createMentor(mentor) {
  const newMentor = new Mentor({
    _id: mentor.id || `men_${Date.now()}`,
    ...mentor
  });
  return newMentor.save();
}

export async function updateMentor(id, updates) {
  return Mentor.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

export async function getSkills() {
  const cfg = await Config.findOne({ key: 'skills' });
  return cfg ? cfg.value : [];
}

export async function getInterests() {
  const cfg = await Config.findOne({ key: 'interests' });
  return cfg ? cfg.value : [];
}

export async function getIdeas() {
  return Idea.find({});
}

export async function getIdeaById(id) {
  return Idea.findOne({ id });
}

export async function getSessions() {
  return Session.find({});
}

export async function createSession(session) {
  const newSession = new Session({
    _id: session.id || `sess_${Date.now()}`,
    ...session
  });
  return newSession.save();
}

export async function updateSession(id, updates) {
  return Session.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

export async function createIdea(idea) {
  const newIdea = new Idea({
    _id: idea.id || `idea_${Date.now()}`,
    id: idea.id || `idea_${Date.now()}`,
    ...idea
  });
  return newIdea.save();
}

export async function deleteIdea(id) {
  return Idea.deleteOne({ id });
}
