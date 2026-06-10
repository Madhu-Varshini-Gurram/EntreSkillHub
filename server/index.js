import express from "express";
import cors from "cors";
import crypto from "crypto";
import {
  readDB,
  writeDB,
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
  updateSession
} from "./dataStore.js";

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN_SECRET = "entreskill-secure-key-12345-june-2026";

// Middlewares
app.use(cors());
app.use(express.json());

// Custom Token Utilities using native crypto
function generateToken(userId, role) {
  const payload = `${userId}:${role}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64");
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parts = raw.split(":");
    if (parts.length !== 4) return null;
    const [userId, role, timestamp, sig] = parts;
    
    // Verify signature
    const checkPayload = `${userId}:${role}:${timestamp}`;
    const checkHmac = crypto.createHmac("sha256", TOKEN_SECRET).update(checkPayload).digest("hex");
    if (checkHmac !== sig) return null;

    // Check expiration (24 hours)
    if (Date.now() - parseInt(timestamp, 10) > 24 * 60 * 60 * 1000) return null;

    return { userId, role };
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

// Root route welcome message
app.get("/", (req, res) => {
  res.send("EntreSkill Hub API Server is running. Access the front-end UI at http://localhost:5173");
});

// 1. Health check & Initial Seed Info
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", port: PORT, timestamp: new Date().toISOString() });
});


// 2. Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const selectedRole = role === "mentor" || role === "admin" ? role : "user";
  const user = createUser({
    email,
    password, // In a real system, hash it
    name,
    role: selectedRole
  });

  // If registering as a mentor, create a pending mentor profile
  if (selectedRole === "mentor") {
    createMentor({
      userId: user.id,
      name: user.name,
      email: user.email,
      expertise: "General",
      bio: "Newly registered mentor waiting to update profile.",
      approved: false
    });
  }

  const token = generateToken(user.id, user.role);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  const token = generateToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      skills: user.skills,
      interests: user.interests,
      bookmarks: user.bookmarks,
      completedSteps: user.completedSteps
    }
  });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      skills: user.skills,
      interests: user.interests,
      bookmarks: user.bookmarks,
      completedSteps: user.completedSteps
    }
  });
});

// 3. User profiling updates
app.put("/api/users/profile", authenticate, (req, res) => {
  const { skills, interests } = req.body;
  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const updatedUser = updateUser(req.user.userId, {
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

// 4. Skills & Interests static collections
app.get("/api/skills", (req, res) => {
  res.json(getSkills());
});

app.get("/api/interests", (req, res) => {
  res.json(getInterests());
});

// 5. Business Ideas Recommendations
app.get("/api/ideas", (req, res) => {
  const ideas = getIdeas();
  
  // Optional query params to filter by skills or user profile
  const authHeader = req.headers["authorization"];
  let currentUser = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      currentUser = getUserById(decoded.userId);
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
    return { ...idea, matchScore: Math.min(score, 100) };
  });

  // Sort by match score descending
  calculatedIdeas.sort((a, b) => b.matchScore - a.matchScore);
  res.json(calculatedIdeas);
});

app.get("/api/ideas/:id", (req, res) => {
  const idea = getIdeaById(req.params.id);
  if (!idea) return res.status(404).json({ error: "Business idea not found." });
  res.json(idea);
});

// 6. Progress and Bookmark Tracking
app.post("/api/progress/toggle", authenticate, (req, res) => {
  const { ideaId, stepId, itemText, checked } = req.body;
  if (!ideaId || !stepId) {
    return res.status(400).json({ error: "ideaId and stepId are required." });
  }

  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  // completedSteps struct: { [ideaId]: { [stepId]: { completed: boolean, checklist: { [itemText]: boolean } } } }
  const completedSteps = { ...user.completedSteps };
  if (!completedSteps[ideaId]) completedSteps[ideaId] = {};
  if (!completedSteps[ideaId][stepId]) {
    completedSteps[ideaId][stepId] = { completed: false, checklist: {} };
  }

  if (itemText !== undefined) {
    // Toggling a sub-checklist item
    completedSteps[ideaId][stepId].checklist[itemText] = checked;
  } else {
    // Toggling the whole step completion status
    completedSteps[ideaId][stepId].completed = checked;
  }

  const updatedUser = updateUser(req.user.userId, { completedSteps });
  res.json({ completedSteps: updatedUser.completedSteps });
});

app.post("/api/progress/bookmark", authenticate, (req, res) => {
  const { ideaId } = req.body;
  if (!ideaId) return res.status(400).json({ error: "ideaId is required." });

  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  let bookmarks = [...user.bookmarks];
  if (bookmarks.includes(ideaId)) {
    bookmarks = bookmarks.filter(id => id !== ideaId);
  } else {
    bookmarks.push(ideaId);
  }

  const updatedUser = updateUser(req.user.userId, { bookmarks });
  res.json({ bookmarks: updatedUser.bookmarks });
});

// 7. Mentor Directory and Actions
app.get("/api/mentors", (req, res) => {
  const mentors = getMentors();
  const authHeader = req.headers["authorization"];
  let decoded = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    decoded = verifyToken(authHeader.split(" ")[1]);
  }

  // Filter approved ones unless it is the admin or the mentor requesting their own
  const filtered = mentors.filter(m => {
    if (decoded && decoded.role === "admin") return true;
    if (decoded && m.userId === decoded.userId) return true;
    return m.approved;
  });

  res.json(filtered);
});

app.put("/api/mentors/profile", authenticate, (req, res) => {
  const mentor = getMentorByUserId(req.user.userId);
  if (!mentor) return res.status(404).json({ error: "Mentor profile not found." });

  const { expertise, bio } = req.body;
  const updatedMentor = updateMentor(mentor.id, {
    expertise: expertise || mentor.expertise,
    bio: bio || mentor.bio
  });

  res.json(updatedMentor);
});

app.post("/api/mentors/request", authenticate, (req, res) => {
  const { mentorId, question } = req.body;
  if (!mentorId || !question) {
    return res.status(400).json({ error: "mentorId and question are required." });
  }

  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const session = createSession({
    mentorId,
    userId: user.id,
    userName: user.name,
    question,
    status: "pending"
  });

  res.status(201).json(session);
});

app.get("/api/mentors/sessions", authenticate, (req, res) => {
  const sessions = getSessions();
  const userRole = req.user.role;

  if (userRole === "mentor") {
    const mentorProfile = getMentorByUserId(req.user.userId);
    if (!mentorProfile) return res.json([]);
    const filtered = sessions.filter(s => s.mentorId === mentorProfile.id);
    return res.json(filtered);
  } else if (userRole === "admin") {
    return res.json(sessions);
  } else {
    // Regular entrepreneur user gets their sessions
    const filtered = sessions.filter(s => s.userId === req.user.userId);
    return res.json(filtered);
  }
});

app.patch("/api/mentors/sessions/:id", authenticate, (req, res) => {
  const { status } = req.body; // approved, completed, rejected
  const sessionId = req.params.id;

  const mentorProfile = getMentorByUserId(req.user.userId);
  const userRole = req.user.role;

  // Verify that only the relevant mentor or admin can change the status
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: "Session request not found." });

  if (userRole !== "admin" && (!mentorProfile || session.mentorId !== mentorProfile.id)) {
    return res.status(403).json({ error: "You are not authorized to update this session request." });
  }

  const updatedSession = updateSession(sessionId, { status });
  res.json(updatedSession);
});

// Post a learning resource (Mentor only)
app.post("/api/mentors/resources", authenticate, (req, res) => {
  const mentorProfile = getMentorByUserId(req.user.userId);
  if (!mentorProfile) return res.status(403).json({ error: "Only mentors can add resources." });

  const { title, type, url } = req.body;
  if (!title || !type || !url) {
    return res.status(400).json({ error: "title, type, and url are required." });
  }

  const resources = [...mentorProfile.resources];
  const newResource = {
    id: `res_${Date.now()}`,
    title,
    type,
    url
  };
  resources.push(newResource);
  updateMentor(mentorProfile.id, { resources });

  res.status(201).json(newResource);
});

// 8. Admin Operations
app.get("/api/admin/users", authenticate, requireAdmin, (req, res) => {
  res.json(getUsers().map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, registeredAt: u.registeredAt })));
});

app.post("/api/admin/mentors/:id/approve", authenticate, requireAdmin, (req, res) => {
  const { approve } = req.body;
  const mentorId = req.params.id;

  const mentor = getMentorById(mentorId);
  if (!mentor) return res.status(404).json({ error: "Mentor not found." });

  const updatedMentor = updateMentor(mentorId, { approved: !!approve });
  res.json(updatedMentor);
});

// Admin add new idea or update existing
app.post("/api/admin/ideas", authenticate, requireAdmin, (req, res) => {
  const db = readDB();
  const { title, description, skills, interests, difficulty, steps } = req.body;
  
  if (!title || !description || !steps) {
    return res.status(400).json({ error: "title, description, and steps are required." });
  }

  const newIdea = {
    id: `idea_${Date.now()}`,
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

  db.ideas.push(newIdea);
  writeDB(db);
  res.status(201).json(newIdea);
});

app.delete("/api/admin/ideas/:id", authenticate, requireAdmin, (req, res) => {
  const db = readDB();
  const ideaId = req.params.id;
  const exists = db.ideas.some(i => i.id === ideaId);
  if (!exists) return res.status(404).json({ error: "Business idea not found." });

  db.ideas = db.ideas.filter(i => i.id !== ideaId);
  writeDB(db);
  res.json({ success: true, message: "Idea successfully deleted." });
});

// Catch-all
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`EntreSkill Hub backend listening on http://localhost:${PORT}`);
});
