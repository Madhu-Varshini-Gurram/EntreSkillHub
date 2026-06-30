import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  getMentors,
  getMentorById,
  getMentorByUserId,
  createMentor,
  updateMentor,
  getSkills,
  getInterests,
  getIdeas,
  getIdeaById,
  getSessions,
  createSession,
  updateSession,
  createIdea,
  deleteIdea
} from "./dataStore.js";

// Load Environment Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/entreskill";
const TOKEN_SECRET = process.env.TOKEN_SECRET || "entreskill-secure-key-12345-june-2026";

// Middlewares
app.use(cors());
app.use(express.json());

// JWT Utilities
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, TOKEN_SECRET, { expiresIn: "24h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
  req.user = decoded;
  next();
}

// Admin Check Middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }
  next();
}

// --- API ROUTES ---



// 1. Health check & Initial Seed Info
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "mongodb", port: PORT, timestamp: new Date().toISOString() });
});

// 2. Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role, expertise } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const selectedRole = role === "mentor" ? role : "user";
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await createUser({
    email,
    password: hashedPassword,
    name,
    role: selectedRole
  });

  // If registering as a mentor, create a pending mentor profile
  let mentorApproved = false;
  if (selectedRole === "mentor") {
    await createMentor({
      userId: user.id,
      name: user.name,
      email: user.email,
      expertise: expertise || "General",
      bio: "Newly registered mentor waiting to update profile.",
      approved: false
    });
  }

  const token = generateToken(user.id, user.role);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, mentorApproved }
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  let mentorApproved = false;
  if (user.role === "mentor") {
    const mentorProfile = await getMentorByUserId(user.id);
    if (mentorProfile) mentorApproved = mentorProfile.approved;
  }
  const token = generateToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mentorApproved,
      skills: user.skills,
      interests: user.interests,
      bookmarks: user.bookmarks,
      completedSteps: user.completedSteps
    }
  });
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  let mentorApproved = false;
  if (user.role === "mentor") {
    const mentorProfile = await getMentorByUserId(user.id);
    if (mentorProfile) mentorApproved = mentorProfile.approved;
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mentorApproved,
      skills: user.skills,
      interests: user.interests,
      bookmarks: user.bookmarks,
      completedSteps: user.completedSteps
    }
  });
});

// 3. User profiling updates
app.put("/api/users/profile", authenticate, async (req, res) => {
  const { skills, interests } = req.body;
  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const updatedUser = await updateUser(req.user.userId, {
    skills: skills || user.skills,
    interests: interests || user.interests
  });

  res.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      skills: updatedUser.skills,
      interests: updatedUser.interests,
      bookmarks: updatedUser.bookmarks,
      completedSteps: updatedUser.completedSteps
    }
  });
});

// 4. Skills & Interests collections
app.get("/api/skills", async (req, res) => {
  res.json(await getSkills());
});

app.get("/api/interests", async (req, res) => {
  res.json(await getInterests());
});

// 5. Business Ideas Recommendations
app.get("/api/ideas", async (req, res) => {
  const ideas = await getIdeas();
  
  // Optional query params to filter by skills or user profile
  const authHeader = req.headers["authorization"];
  let currentUser = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      currentUser = await getUserById(decoded.userId);
    }
  }

  // Calculate scores if user profile is known
  const calculatedIdeas = ideas.map(idea => {
    let score = 50; // base score
    if (currentUser) {
      const userSkills = currentUser.skills || [];
      const userInterests = currentUser.interests || [];

      // Skills match
      const skillIntersection = idea.skills.filter(s => userSkills.includes(s));
      if (skillIntersection.length > 0) score += 30;

      // Interests match
      const interestIntersection = idea.interests.filter(i => userInterests.includes(i));
      score += interestIntersection.length * 5;
    }
    const ideaObj = idea.toJSON ? idea.toJSON() : idea;
    return { ...ideaObj, matchScore: Math.min(score, 100) };
  });

  // Sort by match score descending
  calculatedIdeas.sort((a, b) => b.matchScore - a.matchScore);
  res.json(calculatedIdeas);
});

app.get("/api/ideas/:id", async (req, res) => {
  const idea = await getIdeaById(req.params.id);
  if (!idea) return res.status(404).json({ error: "Business idea not found." });
  res.json(idea);
});

// 6. Progress and Bookmark Tracking
app.post("/api/progress/toggle", authenticate, async (req, res) => {
  const { ideaId, stepId, itemText, checked } = req.body;
  if (!ideaId || !stepId) {
    return res.status(400).json({ error: "ideaId and stepId are required." });
  }

  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const completedSteps = user.completedSteps ? { ...user.completedSteps } : {};
  if (!completedSteps[ideaId]) completedSteps[ideaId] = {};
  if (!completedSteps[ideaId][stepId]) {
    completedSteps[ideaId][stepId] = { completed: false, checklist: {} };
  }

  if (itemText !== undefined) {
    if (!completedSteps[ideaId][stepId].checklist) completedSteps[ideaId][stepId].checklist = {};
    completedSteps[ideaId][stepId].checklist[itemText] = checked;
  } else {
    completedSteps[ideaId][stepId].completed = checked;
  }

  user.completedSteps = completedSteps;
  user.markModified('completedSteps');
  await user.save();

  res.json({ completedSteps: user.completedSteps });
});

app.post("/api/progress/bookmark", authenticate, async (req, res) => {
  const { ideaId } = req.body;
  if (!ideaId) return res.status(400).json({ error: "ideaId is required." });

  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  let bookmarks = [...(user.bookmarks || [])];
  if (bookmarks.includes(ideaId)) {
    bookmarks = bookmarks.filter(id => id !== ideaId);
  } else {
    bookmarks.push(ideaId);
  }

  const updatedUser = await updateUser(req.user.userId, { bookmarks });
  res.json({ bookmarks: updatedUser.bookmarks });
});

// 7. Mentor Directory and Actions
app.get("/api/mentors", async (req, res) => {
  const mentors = await getMentors();
  const authHeader = req.headers["authorization"];
  let decoded = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    decoded = verifyToken(authHeader.split(" ")[1]);
  }

  const filtered = mentors.filter(m => {
    if (decoded && decoded.role === "admin") return true;
    if (decoded && m.userId === decoded.userId) return true;
    return m.approved;
  });

  res.json(filtered);
});

app.put("/api/mentors/profile", authenticate, async (req, res) => {
  const mentor = await getMentorByUserId(req.user.userId);
  if (!mentor) return res.status(404).json({ error: "Mentor profile not found." });

  const { expertise, bio } = req.body;
  const updatedMentor = await updateMentor(mentor.id, {
    expertise: expertise || mentor.expertise,
    bio: bio || mentor.bio
  });

  res.json(updatedMentor);
});

app.post("/api/mentors/request", authenticate, async (req, res) => {
  const { mentorId, question } = req.body;
  if (!mentorId || !question) {
    return res.status(400).json({ error: "mentorId and question are required." });
  }

  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const session = await createSession({
    mentorId,
    userId: user.id,
    userName: user.name,
    question,
    status: "pending"
  });

  res.status(201).json(session);
});

app.get("/api/mentors/sessions", authenticate, async (req, res) => {
  const sessions = await getSessions();
  const userRole = req.user.role;

  if (userRole === "mentor") {
    const mentorProfile = await getMentorByUserId(req.user.userId);
    if (!mentorProfile) return res.json([]);
    const filtered = sessions.filter(s => s.mentorId === mentorProfile.id);
    return res.json(filtered);
  } else if (userRole === "admin") {
    return res.json(sessions);
  } else {
    const filtered = sessions.filter(s => s.userId === req.user.userId);
    return res.json(filtered);
  }
});

app.patch("/api/mentors/sessions/:id", authenticate, async (req, res) => {
  const { status, response } = req.body;
  const sessionId = req.params.id;

  const mentorProfile = await getMentorByUserId(req.user.userId);
  const userRole = req.user.role;

  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: "Session request not found." });

  if (userRole !== "admin" && (!mentorProfile || session.mentorId !== mentorProfile.id)) {
    return res.status(403).json({ error: "You are not authorized to update this session request." });
  }

  const updates = { status };
  if (response !== undefined) {
    updates.response = response;
  }

  const updatedSession = await updateSession(sessionId, updates);
  res.json(updatedSession);
});

app.post("/api/mentors/resources", authenticate, async (req, res) => {
  const mentorProfile = await getMentorByUserId(req.user.userId);
  if (!mentorProfile) return res.status(403).json({ error: "Only mentors can add resources." });

  const { title, type, url } = req.body;
  if (!title || !type || !url) {
    return res.status(400).json({ error: "title, type, and url are required." });
  }

  const resources = [...(mentorProfile.resources || [])];
  const newResource = {
    id: `res_${Date.now()}`,
    title,
    type,
    url
  };
  resources.push(newResource);
  await updateMentor(mentorProfile.id, { resources });

  res.status(201).json(newResource);
});

// 8. Admin Operations
app.get("/api/admin/users", authenticate, requireAdmin, async (req, res) => {
  const users = await getUsers();
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, registeredAt: u.registeredAt })));
});

app.post("/api/admin/mentors/:id/approve", authenticate, requireAdmin, async (req, res) => {
  const { approve } = req.body;
  const mentorId = req.params.id;

  const mentor = await getMentorById(mentorId);
  if (!mentor) return res.status(404).json({ error: "Mentor not found." });

  const updatedMentor = await updateMentor(mentorId, { approved: !!approve });
  res.json(updatedMentor);
});

app.post("/api/admin/ideas", authenticate, requireAdmin, async (req, res) => {
  const { title, description, skills, interests, difficulty, steps } = req.body;
  
  if (!title || !description || !steps) {
    return res.status(400).json({ error: "title, description, and steps are required." });
  }

  const ideaId = `idea_${Date.now()}`;
  const newIdea = {
    id: ideaId,
    title,
    description,
    skills: skills || [],
    interests: interests || [],
    difficulty: difficulty || "Medium",
    steps: steps.map((s, idx) => ({
      id: `step_${Date.now()}_${idx}`,
      phase: s.phase || `${idx + 1}. Step`,
      title: s.title,
      description: s.description,
      checklist: s.checklist || []
    }))
  };

  const savedIdea = await createIdea(newIdea);
  res.status(201).json(savedIdea);
});

app.delete("/api/admin/ideas/:id", authenticate, requireAdmin, async (req, res) => {
  const ideaId = req.params.id;
  const result = await deleteIdea(ideaId);
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Business idea not found." });
  }
  res.json({ success: true, message: "Idea successfully deleted." });
});

// Serve static frontend files (After API routes)
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// API Catch-all
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// React Router Catch-all
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Connect to MongoDB then start Express Server
console.log("Connecting to MongoDB database...");
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    app.listen(PORT, () => {
      console.log(`EntreSkill Hub backend listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
