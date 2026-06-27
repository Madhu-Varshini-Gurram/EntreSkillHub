# EntreSkill Hub – Skill-to-Startup Enablement Platform

A full-stack web platform designed to help users discover business ideas based on their skills, providing structured step-by-step roadmaps, learning resources, and mentor connections to convert skills into sustainable micro-businesses.

---

## 🌐 Live Demo for Evaluators

**[Insert Link to Deployed Application Here]**

### 🔑 Demo Accounts
To easily test the platform's role-based features without registering, use the following demo accounts. The password for all accounts is `password123`.

*   **Admin Access:** `admin@entreskill.com` 
    *(Can approve mentors, create new business ideas, and view all sessions)*
*   **Mentor Access:** `mentor@entreskill.com` 
    *(Can respond to mentoring requests and upload learning resources)*
*   **User Access:** `user@entreskill.com` 
    *(Can take the skill survey, track business roadmaps, bookmark ideas, and request mentoring)*

---

## 🚀 Key Features

*   **Skill Profiler:** Users select skills and interests to generate matching micro-enterprise business ideas with computed success match scores.
*   **Checklist Roadmaps:** Step-by-step guidelines for users covering local laws, workstation setup, marketing launch, and budget estimations.
*   **Direct Mentorship:** Connect with vetted local mentors, request check-in sessions, ask questions, and download verified resource manuals.
*   **Role-Based Dashboards:** Distinct experiences and administrative tools for Users, Mentors, and Admins.
*   **Secure Authentication:** Custom JWT-based authentication system.

## 🛠️ Technology Stack

*   **Frontend:** React.js (Vite), standard CSS (responsive design)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Mongoose)

---

## 💻 Local Setup Instructions

If you wish to run this project locally, follow these steps:

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB running locally on default port `27017` (or a MongoDB URI connection string).

### 2. Backend Setup
1. Open a terminal and navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Start the Express server: `npm run dev`
*(The server will run on http://localhost:3001 and automatically connect to `mongodb://127.0.0.1:27017/entreskill`)*

### 3. Frontend Setup
1. Open a second terminal and navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
*(The frontend will be accessible at http://localhost:5173)*

## 📝 Résumé Highlights

- Designed and implemented a complete MERN-style application from scratch for the Unified Mentor / SBA Problem Statement.
- Integrated secure JWT authentication and role-based access control.
- Built modular front-end architecture with reusable React components and an intuitive UI.
- Configured MongoDB schema design for flexible business-idea data models and progress tracking.
