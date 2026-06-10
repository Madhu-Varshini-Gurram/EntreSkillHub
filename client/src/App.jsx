import React, { useState, useEffect } from 'react';
import './App.css';

// SVG Icons as standard inline components
const IconSkill = () => <svg className="selection-card-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const IconInterest = () => <svg className="selection-card-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconBookmark = ({ filled }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;

function App() {
  const [view, setView] = useState('landing'); // landing, survey, ideas, roadmap, mentors, dashboard, auth
  const [authTab, setAuthTab] = useState('login'); // login, register
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  
  // Data lists
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  // Selection states
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  
  // Form states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('user'); // user, mentor, admin
  
  // Booking modal
  const [bookingMentor, setBookingMentor] = useState(null);
  const [bookingQuestion, setBookingQuestion] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  // Mentor upload resource
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('pdf');
  const [resUrl, setResUrl] = useState('');

  // Admin add new idea form
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaSkills, setNewIdeaSkills] = useState([]);
  const [newIdeaInterests, setNewIdeaInterests] = useState([]);
  const [newIdeaDifficulty, setNewIdeaDifficulty] = useState('Medium');
  
  // Notification states
  const [alertText, setAlertText] = useState('');

  // Interactive Calculator
  const [calcSales, setCalcSales] = useState(30);
  const [calcPrice, setCalcPrice] = useState(50);
  const [calcCost, setCalcCost] = useState(15);
  const [calcSetupCosts, setCalcSetupCosts] = useState(500);

  // Fetch current user details if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token expired');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setSelectedSkills(data.user.skills || []);
        setSelectedInterests(data.user.interests || []);
      })
      .catch(() => {
        logout();
      });
    }
  }, [token]);

  // Load configuration lists & initial data
  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(setSkills);

    fetch('/api/interests')
      .then(res => res.json())
      .then(setInterests);

    fetchIdeas();
    fetchMentors();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchIdeas = () => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('/api/ideas', { headers })
      .then(res => res.json())
      .then(setIdeas);
  };

  const fetchMentors = () => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('/api/mentors', { headers })
      .then(res => res.json())
      .then(setMentors);
  };

  const fetchSessions = () => {
    fetch('/api/mentors/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSessions);
  };

  const triggerAlert = (text) => {
    setAlertText(text);
    setTimeout(() => setAlertText(''), 4000);
  };

  const login = (e) => {
    e.preventDefault();
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword })
    })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error); });
      return res.json();
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setSelectedSkills(data.user.skills || []);
      setSelectedInterests(data.user.interests || []);
      
      triggerAlert(`Welcome back, ${data.user.name}!`);
      
      // Route based on role
      if (data.user.role === 'admin') {
        setView('dashboard');
      } else if (data.user.role === 'mentor') {
        setView('dashboard');
      } else {
        setView(data.user.skills.length > 0 ? 'ideas' : 'survey');
      }
    })
    .catch(err => {
      triggerAlert(err.message);
    });
  };

  const register = (e) => {
    e.preventDefault();
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword, name: authName, role: authRole })
    })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error); });
      return res.json();
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setSelectedSkills([]);
      setSelectedInterests([]);
      triggerAlert('Account registered successfully!');
      setView(data.user.role === 'user' ? 'survey' : 'dashboard');
    })
    .catch(err => {
      triggerAlert(err.message);
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setSelectedSkills([]);
    setSelectedInterests([]);
    setView('landing');
    triggerAlert('Logged out successfully.');
  };

  const saveProfile = () => {
    if (!token) {
      setView('auth');
      triggerAlert('Please log in or register to see recommendations.');
      return;
    }
    fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ skills: selectedSkills, interests: selectedInterests })
    })
    .then(res => res.json())
    .then(data => {
      setUser(data.user);
      fetchIdeas();
      setView('ideas');
      triggerAlert('Profile saved! Here are your matches.');
    });
  };

  const toggleBookmark = (ideaId) => {
    if (!token) {
      setView('auth');
      triggerAlert('Please log in to bookmark ideas.');
      return;
    }
    fetch('/api/progress/bookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ideaId })
    })
    .then(res => res.json())
    .then(data => {
      setUser(prev => ({ ...prev, bookmarks: data.bookmarks }));
      triggerAlert(data.bookmarks.includes(ideaId) ? 'Idea bookmarked!' : 'Bookmark removed.');
    });
  };

  const toggleChecklistItem = (ideaId, stepId, itemText, checked) => {
    if (!token) return;
    fetch('/api/progress/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ideaId, stepId, itemText, checked })
    })
    .then(res => res.json())
    .then(data => {
      setUser(prev => ({ ...prev, completedSteps: data.completedSteps }));
    });
  };

  const toggleStepCompleted = (ideaId, stepId, checked) => {
    if (!token) return;
    fetch('/api/progress/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ideaId, stepId, checked })
    })
    .then(res => res.json())
    .then(data => {
      setUser(prev => ({ ...prev, completedSteps: data.completedSteps }));
      triggerAlert(checked ? 'Step completed!' : 'Step set to in progress.');
    });
  };

  const requestSession = (e) => {
    e.preventDefault();
    fetch('/api/mentors/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ mentorId: bookingMentor.id, question: bookingQuestion })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to request session.');
      return res.json();
    })
    .then(() => {
      setBookingMessage('Request submitted! The mentor will review it shortly.');
      setBookingQuestion('');
      fetchSessions();
      setTimeout(() => {
        setBookingMentor(null);
        setBookingMessage('');
      }, 3000);
    })
    .catch(err => {
      triggerAlert(err.message);
    });
  };

  // Mentor dashboard actions
  const handleSessionStatus = (sessionId, status) => {
    fetch(`/api/mentors/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
    .then(res => res.json())
    .then(() => {
      fetchSessions();
      triggerAlert(`Session status updated to: ${status}`);
    });
  };

  const uploadResource = (e) => {
    e.preventDefault();
    fetch('/api/mentors/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: resTitle, type: resType, url: resUrl })
    })
    .then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    })
    .then(() => {
      triggerAlert('Learning resource uploaded successfully!');
      setResTitle('');
      setResUrl('');
      fetchMentors();
    })
    .catch(err => triggerAlert(err.message));
  };

  // Admin dashboard actions
  const handleApproveMentor = (mentorId, approve) => {
    fetch(`/api/admin/mentors/${mentorId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ approve })
    })
    .then(res => res.json())
    .then(() => {
      fetchMentors();
      triggerAlert(approve ? 'Mentor profile approved!' : 'Mentor profile unapproved.');
    });
  };

  const createAdminIdea = (e) => {
    e.preventDefault();
    const mockSteps = [
      { phase: '1. Validation', title: 'Conduct Local Surveys', description: 'Validate client requirements in your neighborhood.', checklist: ['Draft query list', 'Interview 3 users'] },
      { phase: '2. Tools & Supplies', title: 'Equip Workspace', description: 'Source initial workstation equipment and products.', checklist: ['Purchase kit', 'Clear room'] },
      { phase: '3. Budgets & Rates', title: 'Cost Analysis', description: 'Specify expenses sheet and service pricing structure.', checklist: ['Set menu prices', 'Build balance ledger'] },
      { phase: '4. Legal Setup', title: 'Confirm Zone Compliance', description: 'Verify permissions and local business registry.', checklist: ['Get permit', 'Check taxes'] },
      { phase: '5. Marketing Launch', title: 'Announce Launch', description: 'Advertise through flyers and social media campaigns.', checklist: ['Post online', 'Drop catalogs'] }
    ];

    fetch('/api/admin/ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newIdeaTitle,
        description: newIdeaDesc,
        skills: newIdeaSkills,
        interests: newIdeaInterests,
        difficulty: newIdeaDifficulty,
        steps: mockSteps
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to create idea');
      return res.json();
    })
    .then(() => {
      triggerAlert('New Business Idea successfully created!');
      setNewIdeaTitle('');
      setNewIdeaDesc('');
      setNewIdeaSkills([]);
      setNewIdeaInterests([]);
      fetchIdeas();
    })
    .catch(err => triggerAlert(err.message));
  };

  // Progress metrics calculator helpers
  const getCompletedCount = (ideaId) => {
    if (!user || !user.completedSteps || !user.completedSteps[ideaId]) return 0;
    return Object.values(user.completedSteps[ideaId]).filter(s => s.completed).length;
  };

  const categorizeSkills = () => {
    const categories = [
      { title: "🎨 Creative Crafts & Culinary", items: [] },
      { title: "🛠️ Technical & Hands-On Services", items: [] },
      { title: "💻 Digital & Lifestyle Specialty", items: [] },
      { title: "✨ Additional Skills", items: [] }
    ];

    skills.forEach(s => {
      if (["Tailoring/Sewing", "Cooking/Baking", "Handicrafts/Art"].includes(s)) {
        categories[0].items.push(s);
      } else if (["Gadget Repair/Tech Support", "Carpentry/Woodworking", "Pet Care"].includes(s)) {
        categories[1].items.push(s);
      } else if (["Digital Marketing/Writing", "Gardening/Nursery", "Photography/Video Editing"].includes(s)) {
        categories[2].items.push(s);
      } else {
        categories[3].items.push(s);
      }
    });

    return categories.filter(c => c.items.length > 0);
  };

  const categorizeInterests = () => {
    const categories = [
      { title: "🌍 Impact & Creative Expression", items: [] },
      { title: "🚀 Commerce & Modern Tech", items: [] },
      { title: "🏡 Food & Neighborhood Community", items: [] },
      { title: "✨ Other Interests", items: [] }
    ];

    interests.forEach(i => {
      if (["Sustainability", "Creative Arts"].includes(i)) {
        categories[0].items.push(i);
      } else if (["E-commerce", "Tech/Gadgets"].includes(i)) {
        categories[1].items.push(i);
      } else if (["Local Community", "Food & Beverage"].includes(i)) {
        categories[2].items.push(i);
      } else {
        categories[3].items.push(i);
      }
    });

    return categories.filter(c => c.items.length > 0);
  };

  const getCoachingMessage = (pct) => {
    if (pct === 0) {
      return "🌱 Ready to build? Start by conducting local surveys to validate your idea.";
    } else if (pct > 0 && pct < 60) {
      return "📈 Doing great! Make sure to calculate your budgets and double check permits as you move forward.";
    } else if (pct >= 60 && pct < 100) {
      return "🚀 Almost there! Focus on setting up your online presence and prepping for your first customers.";
    } else if (pct === 100) {
      return "🎉 Congratulations! You have completed every milestone. You're ready to launch and make your first sale!";
    }
    return "";
  };

  const getNextRecommendedSteps = () => {
    if (!user || !user.completedSteps) return [];
    
    const recommendations = [];
    Object.entries(user.completedSteps).forEach(([ideaId, stepsMap]) => {
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) return;
      
      // Find the first step that is not completed
      const nextStep = idea.steps.find(s => !stepsMap[s.id]?.completed);
      if (nextStep) {
        recommendations.push({
          ideaTitle: idea.title,
          stepPhase: nextStep.phase,
          stepTitle: nextStep.title,
          stepDesc: nextStep.description,
          idea
        });
      }
    });
    return recommendations;
  };

  const marginPerUnit = calcPrice - calcCost;
  const breakEvenUnits = marginPerUnit > 0 ? Math.ceil(calcSetupCosts / marginPerUnit) : 'N/A';
  const monthlyProfit = (calcSales * calcPrice) - (calcSales * calcCost);
  const revenue = calcSales * calcPrice;
  const costRatio = revenue > 0 ? Math.min(100, Math.round(((calcSales * calcCost) / revenue) * 100)) : 0;
  const profitRatio = 100 - costRatio;
  const roadmapCompletionPct = selectedIdea ? (getCompletedCount(selectedIdea.id) / selectedIdea.steps.length) * 100 : 0;

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {alertText && (
        <div className="modal-overlay" style={{ background: 'transparent', zIndex: 1100, pointerEvents: 'none' }}>
          <div className="glass-panel animate-fade" style={{ background: 'rgba(18, 20, 29, 0.95)', border: '1px solid #c084fc', boxShadow: 'var(--shadow-glow)', pointerEvents: 'auto' }}>
            <p style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#c084fc' }}>●</span> {alertText}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-container">
          <a className="logo" onClick={() => setView('landing')}>
            EntreSkill<span className="text-gradient">Hub</span>
            <span className="logo-dot"></span>
          </a>
          <div className="nav-links">
            <button className={`nav-btn ${view === 'landing' ? 'active' : ''}`} onClick={() => setView('landing')}>Home</button>
            <button className={`nav-btn ${view === 'survey' ? 'active' : ''}`} onClick={() => setView('survey')}>Skill Wizard</button>
            <button className={`nav-btn ${view === 'ideas' ? 'active' : ''}`} onClick={() => setView('ideas')}>Ideas</button>
            <button className={`nav-btn ${view === 'mentors' ? 'active' : ''}`} onClick={() => setView('mentors')}>Mentors</button>
            
            {user ? (
              <>
                <button className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={logout}>
                  <IconLogout /> Logout
                </button>
              </>
            ) : (
              <button className="btn-premium" onClick={() => { setAuthTab('login'); setView('auth'); }}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container animate-fade" style={{ flex: 1, paddingTop: '2rem' }}>
        
        {/* VIEW: Landing */}
        {view === 'landing' && (
          <div>
            <section className="hero-section">
              <h1 className="hero-title">
                Turn Practical Skills Into a <span className="text-gradient">Sustainable Business</span>
              </h1>
              <p className="hero-subtitle">
                Helping local bakers, tailors, tech specialists, and creators uncover viable business models, track structured startup checklists, and access direct mentorship.
              </p>
              <div className="hero-buttons">
                <button className="btn-premium" style={{ padding: '0.85rem 2rem' }} onClick={() => setView(user ? 'survey' : 'auth')}>
                  Assess Your Skills
                </button>
                <button className="btn-outline" style={{ padding: '0.85rem 2rem' }} onClick={() => setView('ideas')}>
                  Explore Business Ideas
                </button>
              </div>
            </section>

            <div className="features-grid">
              <div className="glass-panel feature-card">
                <div className="feature-icon">
                  <IconSkill />
                </div>
                <h3>Skill Profiler</h3>
                <p>Select your skills and interests to generate matching custom micro-enterprise business profiles with high success rates.</p>
              </div>
              <div className="glass-panel feature-card">
                <div className="feature-icon" style={{ color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.1)' }}>
                  <IconCheck />
                </div>
                <h3>Checklist Roadmaps</h3>
                <p>Follow a progressive step-by-step guideline covering local laws, workstation setup, marketing launch, and startup budget estimations.</p>
              </div>
              <div className="glass-panel feature-card">
                <div className="feature-icon" style={{ color: '#fb923c', background: 'rgba(251, 146, 60, 0.1)' }}>
                  <IconCalendar />
                </div>
                <h3>Direct Mentorship</h3>
                <p>Connect with vetted local mentors, request check-in sessions, ask questions, and download verified resource manuals.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Auth */}
        {view === 'auth' && (
          <div className="auth-container">
            <div className="glass-panel auth-form-card">
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                <button 
                  className={`nav-btn`} 
                  style={{ flex: 1, borderBottom: authTab === 'login' ? '2px solid #818cf8' : 'none', color: authTab === 'login' ? '#fff' : 'var(--text-secondary)' }}
                  onClick={() => setAuthTab('login')}
                >
                  Log In
                </button>
                <button 
                  className={`nav-btn`} 
                  style={{ flex: 1, borderBottom: authTab === 'register' ? '2px solid #818cf8' : 'none', color: authTab === 'register' ? '#fff' : 'var(--text-secondary)' }}
                  onClick={() => setAuthTab('register')}
                >
                  Register
                </button>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#d8b4fe', marginBottom: '1.25rem', lineHeight: '1.4', textAlign: 'left' }}>
                <strong>💡 Demo Accounts (Password: <code>password123</code>)</strong><br/>
                • Admin: <code>admin@entreskill.com</code><br/>
                • Mentor: <code>mentor@entreskill.com</code><br/>
                • User: <code>user@entreskill.com</code>
              </div>

              {authTab === 'login' ? (
                <form onSubmit={login}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input className="form-control" type="email" placeholder="email@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input className="form-control" type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                  </div>
                  <button className="btn-premium" style={{ width: '100%', marginTop: '1rem' }} type="submit">Sign In</button>
                </form>
              ) : (
                <form onSubmit={register}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="form-control" type="text" placeholder="Jane Doe" value={authName} onChange={e => setAuthName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input className="form-control" type="email" placeholder="email@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input className="form-control" type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select className="form-control" value={authRole} onChange={e => setAuthRole(e.target.value)}>
                      <option value="user">Entrepreneur / Explorer</option>
                      <option value="mentor">Professional Mentor</option>
                    </select>
                  </div>
                  <button className="btn-premium" style={{ width: '100%', marginTop: '1rem' }} type="submit">Create Account</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* VIEW: Survey Wizard */}
        {view === 'survey' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="wizard-header">
              <h2 className="wizard-title">Skill & Interest Assessment</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Uncover tailored local business ideas matching your competencies.</p>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: selectedSkills.length > 0 ? '50%' : '10%' }}></div>
              </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="text-gradient" style={{ fontSize: '1.5rem' }}>1.</span> Pick Your Skills
              </h3>
              
              {categorizeSkills().map(cat => (
                <div key={cat.title} className="survey-category-section">
                  <div className="survey-category-title">{cat.title}</div>
                  <div className="selection-grid" style={{ marginBottom: 0 }}>
                    {cat.items.map(s => (
                      <div 
                        key={s} 
                        className={`selection-card ${selectedSkills.includes(s) ? 'selected' : ''}`}
                        onClick={() => {
                          if (selectedSkills.includes(s)) {
                            setSelectedSkills(selectedSkills.filter(x => x !== s));
                          } else {
                            setSelectedSkills([...selectedSkills, s]);
                          }
                        }}
                      >
                        <IconSkill />
                        <span style={{ fontSize: '0.9rem' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <h3 style={{ margin: '2rem 0 1.5rem 0', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="text-gradient" style={{ fontSize: '1.5rem' }}>2.</span> Pick Your Interests
              </h3>
              
              {categorizeInterests().map(cat => (
                <div key={cat.title} className="survey-category-section" style={{ borderColor: 'rgba(45, 212, 191, 0.05)' }}>
                  <div className="survey-category-title" style={{ color: '#2dd4bf' }}>{cat.title}</div>
                  <div className="selection-grid" style={{ marginBottom: 0 }}>
                    {cat.items.map(i => (
                      <div 
                        key={i} 
                        className={`selection-card ${selectedInterests.includes(i) ? 'selected' : ''}`}
                        style={{ borderColor: selectedInterests.includes(i) ? '#2dd4bf' : 'var(--border-light)' }}
                        onClick={() => {
                          if (selectedInterests.includes(i)) {
                            setSelectedInterests(selectedInterests.filter(x => x !== i));
                          } else {
                            setSelectedInterests([...selectedInterests, i]);
                          }
                        }}
                      >
                        <IconInterest />
                        <span style={{ fontSize: '0.9rem' }}>{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={saveProfile}>
                  Find Business Ideas <IconCheck />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Ideas Recommendations */}
        {view === 'ideas' && (
          <div>
            <div className="results-header">
              <div>
                <h2>Custom Business Matches</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>Sorted by skill matching accuracy.</p>
              </div>
              <button className="btn-outline" onClick={() => setView('survey')}>
                Refine Skills Assessment
              </button>
            </div>

            <div className="ideas-grid">
              {ideas.map(idea => {
                const isBookmarked = user?.bookmarks?.includes(idea.id);
                return (
                  <div key={idea.id} className="glass-panel idea-card">
                    <div className="idea-top">
                      <div className="idea-meta">
                        <span className="badge badge-primary">{idea.difficulty}</span>
                        <div className="match-meter-wrapper">
                          <svg width="22" height="22" viewBox="0 0 36 36" className="match-svg-circle">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2dd4bf" strokeWidth="3.5" 
                                    strokeDasharray={`${idea.matchScore || 50} ${100 - (idea.matchScore || 50)}`} strokeDashoffset="25" />
                          </svg>
                          <span className="match-meter-percentage">{idea.matchScore || 50}% Match</span>
                        </div>
                      </div>
                      <h3 className="idea-title">{idea.title}</h3>
                      <p className="idea-desc">{idea.description}</p>
                      
                      <div className="idea-tags">
                        {idea.skills.concat(idea.interests).map(t => (
                          <span key={t} className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="idea-bottom">
                      <button className="btn-premium" onClick={() => { setSelectedIdea(idea); setView('roadmap'); }}>
                        View Setup Roadmap
                      </button>
                      <button 
                        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={() => toggleBookmark(idea.id)}
                      >
                        <IconBookmark filled={isBookmarked} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: Roadmap detail */}
        {view === 'roadmap' && selectedIdea && (
          <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <button className="nav-btn" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => setView('ideas')}>
                  ← Back to Matches
                </button>
              </div>

              <div className="roadmap-container">
                
                {/* Main Timeline Column */}
                <div className="roadmap-main">
                  <div className="glass-panel roadmap-header-card" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{selectedIdea.title} Setup Roadmap</h2>
                      <span className="badge badge-primary">{selectedIdea.difficulty} Entry</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>
                      Follow this step-by-step checklist to safely validation, register, finance and market your business.
                    </p>
                    
                    {user && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                          <span>Roadmap Completion Progress</span>
                          <span>{getCompletedCount(selectedIdea.id)} of {selectedIdea.steps.length} Steps Done</span>
                        </div>
                        <div className="progress-bar-container" style={{ margin: 0, height: '8px' }}>
                          <div className="progress-bar" style={{ width: `${roadmapCompletionPct}%` }}></div>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#c084fc', fontStyle: 'italic', fontWeight: 500 }}>
                          {getCoachingMessage(Math.round(roadmapCompletionPct))}
                        </div>
                      </div>
                    )}
                  </div>

                <div className="timeline-container">
                  <div className="timeline-line"></div>
                  {selectedIdea.steps.map((step, idx) => {
                    const isStepDone = user?.completedSteps?.[selectedIdea.id]?.[step.id]?.completed;
                    
                    return (
                      <div key={step.id} className={`timeline-item ${isStepDone ? 'completed' : ''}`}>
                        <div className="timeline-node">
                          {isStepDone ? '✓' : idx + 1}
                        </div>
                        <div className="glass-panel timeline-card" style={{ textAlign: 'left', opacity: isStepDone ? 0.75 : 1 }}>
                          <div className="step-phase">{step.phase}</div>
                          <div className="step-title-row">
                            <h3 className="step-title">{step.title}</h3>
                            {user && (
                              <button 
                                className={`step-toggle-btn ${isStepDone ? 'completed' : ''}`}
                                onClick={() => toggleStepCompleted(selectedIdea.id, step.id, !isStepDone)}
                              >
                                {isStepDone ? '✓ Completed' : 'Mark Complete'}
                              </button>
                            )}
                          </div>
                          <p className="step-desc">{step.description}</p>
                          
                          {step.checklist && step.checklist.length > 0 && (
                            <div className="checklist-container">
                              <div className="checklist-title">Startup Checklist:</div>
                              {step.checklist.map(item => {
                                const isChecked = user?.completedSteps?.[selectedIdea.id]?.[step.id]?.checklist?.[item] || false;
                                return (
                                  <div 
                                    key={item} 
                                    className={`checklist-item ${isChecked ? 'checked' : ''}`}
                                    onClick={() => toggleChecklistItem(selectedIdea.id, step.id, item, !isChecked)}
                                  >
                                    <div className="checkbox-custom">
                                      {isChecked && <div className="checkbox-custom-tick" />}
                                    </div>
                                    <span>{item}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Widgets Column */}
              <div className="roadmap-side">
                
                {/* Micro profit calculator widget */}
                <div className="glass-panel calculator-card">
                  <h3 className="calculator-title">Startup Financial Estimator</h3>
                  
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Startup Setup Costs</span>
                      <strong>${calcSetupCosts}</strong>
                    </label>
                    <input type="range" min="100" max="5000" step="50" value={calcSetupCosts} onChange={e => setCalcSetupCosts(parseInt(e.target.value))} style={{ accentColor: '#c084fc', width: '100%' }} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Monthly Customers</span>
                      <strong>{calcSales} orders</strong>
                    </label>
                    <input type="range" min="5" max="200" value={calcSales} onChange={e => setCalcSales(parseInt(e.target.value))} style={{ accentColor: '#c084fc', width: '100%' }} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Price Per Service</span>
                      <strong>${calcPrice}</strong>
                    </label>
                    <input type="range" min="10" max="500" value={calcPrice} onChange={e => setCalcPrice(parseInt(e.target.value))} style={{ accentColor: '#c084fc', width: '100%' }} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Unit Supply Cost</span>
                      <strong>${calcCost}</strong>
                    </label>
                    <input type="range" min="2" max="200" value={calcCost} onChange={e => setCalcCost(parseInt(e.target.value))} style={{ accentColor: '#c084fc', width: '100%' }} />
                  </div>

                  {revenue > 0 && (
                    <div className="calc-visual-bar">
                      <div className="calc-bar-cost" style={{ width: `${costRatio}%` }}></div>
                      <div className="calc-bar-profit" style={{ width: `${profitRatio}%` }}></div>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Revenue</span>
                    <span>${revenue}</span>
                  </div>
                  <div className="calc-row">
                    <span>Material Cost</span>
                    <span>-${calcSales * calcCost}</span>
                  </div>
                  <div className="calc-row">
                    <span>Break-even Point</span>
                    <strong style={{ color: breakEvenUnits === 'N/A' ? '#ef4444' : '#2dd4bf' }}>
                      {breakEvenUnits === 'N/A' ? 'Unachievable' : `${breakEvenUnits} orders`}
                    </strong>
                  </div>
                  <div className="calc-row calc-total">
                    <span>Projected Margin</span>
                    <span className="text-gradient">${monthlyProfit}/mo</span>
                  </div>

                   <div className={`calc-verdict-box ${monthlyProfit > 0 ? 'positive' : 'neutral'}`}>
                    {marginPerUnit <= 0 ? (
                      <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>⚠️</span>
                        <span>Warning: Supply cost is higher than or equal to sale price. Adjust your pricing model to ensure viability.</span>
                      </span>
                    ) : monthlyProfit <= 0 ? (
                      <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>⚠️</span>
                        <span>Warning: Monthly order volume is too low to cover your raw costs. Work on generating more customer traffic.</span>
                      </span>
                    ) : calcSales < breakEvenUnits ? (
                      <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>💡</span>
                        <span>Info: You are making an operating profit of <strong>${monthlyProfit}/mo</strong>, but it will take about <strong>{Math.ceil(breakEvenUnits / calcSales)}</strong> months to recoup your initial <strong>${calcSetupCosts}</strong> setup costs.</span>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>🎉</span>
                        <span>Excellent! Your pricing model is highly viable. You will break even in your very first month of operating at this volume!</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Local Mentors Widget */}
                <div className="glass-panel" style={{ textAlign: 'left' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: '0 0 1rem 0' }}>Expert Mentors</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Get review feedback on your roadmap progress from verified advisors.</p>
                  
                  {mentors.filter(m => m.approved).slice(0, 2).map(mentor => (
                    <div key={mentor.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                      <div className="mentor-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                        {mentor.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{mentor.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }}>{mentor.expertise}</div>
                      </div>
                    </div>
                  ))}

                  <button className="btn-outline" style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem' }} onClick={() => setView('mentors')}>
                    Browse All Mentors
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW: Mentors Directory */}
        {view === 'mentors' && (
          <div>
            <div className="results-header" style={{ marginBottom: '2.5rem' }}>
              <div>
                <h2>Mentorship Directory</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>Get guidance from experienced mentors to confidently scale your enterprise.</p>
              </div>
            </div>

            <div className="mentor-grid">
              {mentors.filter(m => m.approved).map(mentor => (
                <div key={mentor.id} className="glass-panel mentor-card">
                  <div>
                    <div className="mentor-profile-header">
                      <div className="mentor-avatar">{mentor.name[0]}</div>
                      <div>
                        <h3 className="mentor-name">{mentor.name}</h3>
                        <span className="mentor-exp">{mentor.expertise}</span>
                      </div>
                    </div>
                    <p className="mentor-bio">{mentor.bio}</p>

                    {mentor.resources && mentor.resources.length > 0 && (
                      <div style={{ background: 'rgba(0, 0, 0, 0.15)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Learning Guides:</div>
                        {mentor.resources.map(r => (
                          <a key={r.id} href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#c084fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                            <IconUpload /> {r.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    className="btn-premium" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      if (!token) {
                        setView('auth');
                        triggerAlert('Please sign in to book mentorship requests.');
                      } else {
                        setBookingMentor(mentor);
                      }
                    }}
                  >
                    Request Free Session
                  </button>
                </div>
              ))}
            </div>

            {/* Mentor booking request modal */}
            {bookingMentor && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button className="modal-close" onClick={() => setBookingMentor(null)}>×</button>
                  <h3 className="modal-title">Request Mentorship</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Ask a question or request a review session with <strong>{bookingMentor.name}</strong>.
                  </p>
                  
                  {bookingMessage ? (
                    <div style={{ color: '#2dd4bf', padding: '1rem 0', fontWeight: 600, textAlign: 'center' }}>
                      {bookingMessage}
                    </div>
                  ) : (
                    <form onSubmit={requestSession}>
                      <div className="form-group">
                        <label>Explain what you need help with (e.g. licensing, supply chain, pricing):</label>
                        <textarea 
                          className="form-control" 
                          rows="4" 
                          placeholder="Type your inquiry here..."
                          value={bookingQuestion} 
                          onChange={e => setBookingQuestion(e.target.value)} 
                          required
                        />
                      </div>
                      <button className="btn-premium" style={{ width: '100%', marginTop: '1rem' }} type="submit">Submit Request</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Personal Dashboards & Admin Panels */}
        {view === 'dashboard' && user && (
          <div className="dashboard-grid">
            
            {/* Sidebar Profile card */}
            <div className="dashboard-sidebar">
              <div className="glass-panel dashboard-profile">
                <div className="dashboard-avatar">{user.name[0]}</div>
                <h3>{user.name}</h3>
                <p style={{ textTransform: 'capitalize' }}>Role: <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{user.role}</span></p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered: {new Date(user.registeredAt).toLocaleDateString()}</p>
              </div>

              <div className="glass-panel dashboard-menu">
                <button className="dash-menu-item active">Overview Profile</button>
                <button className="dash-menu-item" onClick={() => setView('ideas')}>Assessment Recommendations</button>
                <button className="dash-menu-item" onClick={() => setView('mentors')}>Browse Mentors</button>
              </div>
            </div>

            {/* Main Dashboard Panel */}
            <div className="dashboard-main">
              
              {/* Stat Boxes */}
              <div className="dash-stats-row">
                <div className="glass-panel stat-card">
                  <div className="stat-lbl">Bookmarked Ideas</div>
                  <div className="stat-val text-gradient">{(user.bookmarks || []).length}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-lbl">Active Roadmaps</div>
                  <div className="stat-val text-gradient">{Object.keys(user.completedSteps || {}).length}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-lbl">Mentor Inquiries</div>
                  <div className="stat-val text-gradient">{sessions.length}</div>
                </div>
              </div>

              {/* USER ROLE: Entrepreneur / User */}
              {user.role === 'user' && (
                <>
                  {/* Next recommended steps */}
                  {getNextRecommendedSteps().length > 0 && (
                    <div className="glass-panel" style={{ textAlign: 'left', borderLeft: '4px solid #818cf8' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🎯 Recommended Next Action</span>
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {getNextRecommendedSteps().map((rec, idx) => (
                          <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <strong style={{ fontSize: '1rem', color: '#fff' }}>{rec.ideaTitle}</strong>
                              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{rec.stepPhase}</span>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a855f7', marginBottom: '0.5rem' }}>{rec.stepTitle}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>{rec.stepDesc}</div>
                            <button className="btn-premium" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }} onClick={() => { setSelectedIdea(rec.idea); setView('roadmap'); }}>
                              Go to Checklist
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bookmarked Ideas */}
                  <div className="glass-panel" style={{ textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', fontSize: '1.25rem' }}>Saved Startup Projects</h3>
                    {user.bookmarks && user.bookmarks.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ideas.filter(i => user.bookmarks.includes(i.id)).map(idea => (
                          <div key={idea.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{idea.title}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{idea.description.slice(0, 100)}...</div>
                            </div>
                            <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }} onClick={() => { setSelectedIdea(idea); setView('roadmap'); }}>
                              Open Roadmap
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You haven't bookmarked any business ideas yet. Browse ideas to bookmark your favorites.</p>
                    )}
                  </div>

                  {/* Requested Mentor Sessions */}
                  <div className="glass-panel" style={{ textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', fontSize: '1.25rem' }}>Mentorship Inquiries</h3>
                    {sessions.length > 0 ? (
                      <table className="session-table">
                        <thead>
                          <tr>
                            <th>Mentor</th>
                            <th>Question / Topic</th>
                            <th>Requested At</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map(s => {
                            const m = mentors.find(x => x.id === s.mentorId);
                            return (
                              <tr key={s.id}>
                                <td style={{ fontWeight: 600 }}>{m ? m.name : 'Unknown Mentor'}</td>
                                <td>{s.question}</td>
                                <td>{new Date(s.requestedAt).toLocaleDateString()}</td>
                                <td>
                                  <span className={`status-indicator ${s.status === 'pending' ? 'badge-warning' : s.status === 'approved' ? 'badge-accent' : 'badge-primary'} badge`}>
                                    {s.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No session requests made yet.</p>
                    )}
                  </div>
                </>
              )}

              {/* USER ROLE: Mentor Dashboard */}
              {user.role === 'mentor' && (
                <>
                  {/* Handle bookings list */}
                  <div className="glass-panel" style={{ textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', fontSize: '1.25rem' }}>Mentees Inquiries Requests</h3>
                    {sessions.length > 0 ? (
                      <table className="session-table">
                        <thead>
                          <tr>
                            <th>Mentee Name</th>
                            <th>Question details</th>
                            <th>Requested Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map(s => (
                            <tr key={s.id}>
                              <td style={{ fontWeight: 600 }}>{s.userName}</td>
                              <td>{s.question}</td>
                              <td>{new Date(s.requestedAt).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${s.status === 'pending' ? 'badge-warning' : s.status === 'approved' ? 'badge-accent' : 'badge-primary'}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td>
                                {s.status === 'pending' && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-premium" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }} onClick={() => handleSessionStatus(s.id, 'approved')}>Accept</button>
                                    <button className="btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }} onClick={() => handleSessionStatus(s.id, 'rejected')}>Reject</button>
                                  </div>
                                )}
                                {s.status === 'approved' && (
                                  <button className="btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }} onClick={() => handleSessionStatus(s.id, 'completed')}>Complete Session</button>
                                )}
                                {s.status === 'completed' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Archived</span>}
                              </td>
                            </tr>
                          ))}

                        </tbody>
                      </table>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No pending inquiries from mentees found.</p>
                    )}
                  </div>

                  {/* Upload new resource guides */}
                  <div className="glass-panel" style={{ textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', fontSize: '1.25rem' }}>Upload Learning Resource</h3>
                    <form onSubmit={uploadResource} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Guide / PDF Title</label>
                        <input className="form-control" type="text" placeholder="e.g. Sourcing Local Woodworking Materials" value={resTitle} onChange={e => setResTitle(e.target.value)} required />
                      </div>
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Resource Format</label>
                          <select className="form-control" value={resType} onChange={e => setResType(e.target.value)}>
                            <option value="pdf">PDF Manual</option>
                            <option value="video">Video Guide</option>
                            <option value="article">Article/Checklist</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                          <label>Resource Link / URL</label>
                          <input className="form-control" type="url" placeholder="https://example.com/guide" value={resUrl} onChange={e => setResUrl(e.target.value)} required />
                        </div>
                      </div>
                      <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} type="submit">
                        <IconUpload /> Publish Resource Link
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* USER ROLE: Admin Panel Dashboard */}
              {user.role === 'admin' && (
                <>
                  {/* Mentor Verifications */}
                  <div className="glass-panel" style={{ textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', fontSize: '1.25rem' }}>Mentor Approval & Verification</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {mentors.map(m => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {m.name}
                              <span className={`badge ${m.approved ? 'badge-accent' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                                {m.approved ? 'Approved' : 'Pending Verification'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expertise: {m.expertise} | Contact: {m.email}</div>
                          </div>
                          <div>
                            {m.approved ? (
                              <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleApproveMentor(m.id, false)}>Revoke</button>
                            ) : (
                              <button className="btn-premium" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }} onClick={() => handleApproveMentor(m.id, true)}>Approve Profile</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add new ideas and roadmaps database catalog */}
                  <div className="glass-panel" style={{ textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', fontSize: '1.25rem' }}>Create New Business Idea</h3>
                    <form onSubmit={createAdminIdea} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Business Idea Title</label>
                        <input className="form-control" type="text" placeholder="e.g. Local Organic Soap Production" value={newIdeaTitle} onChange={e => setNewIdeaTitle(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Description Summary</label>
                        <textarea className="form-control" placeholder="Provide a summary of required work and business viability..." value={newIdeaDesc} onChange={e => setNewIdeaDesc(e.target.value)} required />
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Required Skill Tag</label>
                          <select className="form-control" onChange={e => setNewIdeaSkills([e.target.value])}>
                            <option value="">Choose Skill...</option>
                            {skills.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Core Interest Area</label>
                          <select className="form-control" onChange={e => setNewIdeaInterests([e.target.value])}>
                            <option value="">Choose Interest...</option>
                            {interests.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Setup Difficulty</label>
                          <select className="form-control" value={newIdeaDifficulty} onChange={e => setNewIdeaDifficulty(e.target.value)}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <button className="btn-premium" style={{ padding: '0.75rem', marginTop: '0.5rem' }} type="submit">
                        Publish Idea & Checklist Template
                      </button>
                    </form>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2026 EntreSkill Hub.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
