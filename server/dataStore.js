import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const INITIAL_DATA = {
  users: [
    {
      id: 'usr_1',
      email: 'admin@entreskill.com',
      password: 'password123', // In a real app we'd hash, but keep simple for now
      name: 'Admin User',
      role: 'admin',
      skills: [],
      interests: [],
      bookmarks: [],
      completedSteps: {},
      registeredAt: '2026-06-01T12:00:00Z'
    },
    {
      id: 'usr_2',
      email: 'user@entreskill.com',
      password: 'password123',
      name: 'Jane Doe',
      role: 'user',
      skills: ['Cooking/Baking'],
      interests: ['Food & Beverage', 'Local Community'],
      bookmarks: [],
      completedSteps: {},
      registeredAt: '2026-06-02T10:00:00Z'
    },
    {
      id: 'usr_3',
      email: 'mentor@entreskill.com',
      password: 'password123',
      name: 'Sarah Jenkins',
      role: 'mentor',
      skills: [],
      interests: [],
      bookmarks: [],
      completedSteps: {},
      registeredAt: '2026-06-03T09:00:00Z'
    },
    {
      id: 'usr_4',
      email: 'mentor2@entreskill.com',
      password: 'password123',
      name: 'Elena Rostova',
      role: 'mentor',
      skills: [],
      interests: [],
      bookmarks: [],
      completedSteps: {},
      registeredAt: '2026-06-04T15:00:00Z'
    }
  ],
  mentors: [
    {
      id: 'men_1',
      userId: 'usr_3',
      name: 'Sarah Jenkins',
      email: 'mentor@entreskill.com',
      expertise: 'Tailoring & Crafting',
      bio: 'Fashion designer with 10+ years running custom design boutiques and community tailoring hubs.',
      approved: true,
      resources: [
        {
          id: 'res_1',
          title: 'Sourcing Fabrics Sustainably',
          type: 'pdf',
          url: 'https://example.com/fabrics-guide.pdf'
        }
      ]
    },
    {
      id: 'men_2',
      userId: 'usr_4',
      name: 'Elena Rostova',
      email: 'mentor2@entreskill.com',
      expertise: 'Cooking/Baking',
      bio: 'Professional pastry chef helping local food creators navigate cottage food licensing.',
      approved: false,
      resources: []
    }
  ],
  skills: [
    'Tailoring/Sewing',
    'Cooking/Baking',
    'Handicrafts/Art',
    'Gadget Repair/Tech Support',
    'Digital Marketing/Writing',
    'Gardening/Nursery',
    'Carpentry/Woodworking',
    'Pet Care',
    'Photography/Video Editing'
  ],
  interests: [
    'Sustainability',
    'E-commerce',
    'Local Community',
    'Tech/Gadgets',
    'Food & Beverage',
    'Creative Arts'
  ],
  ideas: [
    {
      id: 'idea_1',
      title: 'Custom Boutique & Tailoring Shop',
      description: 'Help people look their best with bespoke dressmaking, alterations, and custom garments from a home workshop.',
      skills: ['Tailoring/Sewing'],
      interests: ['Sustainability', 'Creative Arts', 'E-commerce'],
      difficulty: 'Medium',
      matchScore: 95,
      steps: [
        {
          id: 'step_1_1',
          phase: '1. Idea Validation',
          title: 'Define Your Unique Selling Proposition (USP)',
          description: 'Identify your niche (e.g., custom bridal wear, denim alterations, eco-friendly upcycled fashion). Interview at least 5 potential customers on what tailoring services they struggle to find.',
          checklist: ['Write a 1-sentence USP description', 'Decide if you will offer pickup/delivery', 'Create a Pinterest board of your signature styles']
        },
        {
          id: 'step_1_2',
          phase: '2. Tools & Skills',
          title: 'Secure Essential Hardware',
          description: 'Ensure you have a heavy-duty sewing machine, professional tailoring scissors, measurement tapes, iron + ironing board, chalk markers, and a variety of thread colors.',
          checklist: ['Source a high-quality sewing machine', 'Set up dedicated work table with good lighting', 'Compile basic sewing kit and patterns archive']
        },
        {
          id: 'step_1_3',
          phase: '3. Cost & Pricing',
          title: 'Build Budget & Rates Sheets',
          description: 'Establish pricing based on time or service categories. Basic hem ($15), complex alteration ($45+), bespoke dress ($150+). Factor in raw materials plus an hourly wage.',
          checklist: ['Draft a service price menu', 'Calculate monthly utility/thread costs', 'Set aside a budget for machine maintenance']
        },
        {
          id: 'step_1_4',
          phase: '4. Legal & Setup',
          title: 'Register Business & Workspace Permits',
          description: 'Choose a business structure (usually Sole Proprietorship for starters). Register your business name locally. Confirm your home zone allows customer pickups.',
          checklist: ['Register business name (DBA)', 'Setup separate business checking account', 'Design template invoices and customer intake forms']
        },
        {
          id: 'step_1_5',
          phase: '5. Marketing & Launch',
          title: 'Launch Social Media & Dry Cleaner Partnerships',
          description: 'Set up an Instagram/Facebook page displaying before/after alteration work. Connect with local dry cleaners who do not offer alterations and set up a referral network.',
          checklist: ['Create Instagram profile with booking link', 'Drop flyers/business cards at local dry cleaners', 'Offer first 10 customers a 15% discount']
        }
      ]
    },
    {
      id: 'idea_2',
      title: 'Home Bakery & Custom Cakes',
      description: 'Design custom cakes, breads, and treats for birthdays, weddings, and local coffee shops from your kitchen.',
      skills: ['Cooking/Baking'],
      interests: ['Food & Beverage', 'Local Community'],
      difficulty: 'Easy',
      matchScore: 90,
      steps: [
        {
          id: 'step_2_1',
          phase: '1. Idea Validation',
          title: 'Identify Signature Items',
          description: 'Focus on 3-5 high-demand items (e.g. sourdough bread, vegan cupcakes, customized birthday cakes) to start. Bake samples and distribute to family and friends for honest feedback.',
          checklist: ['Finalize 3 recipe cards with exact measurements', 'Take professional photos of finished treats', 'Verify feedback on taste, texture, and visual appeal']
        },
        {
          id: 'step_2_2',
          phase: '2. Tools & Skills',
          title: 'Equip the Cottage Kitchen',
          description: 'Upgrade to a stand mixer, digital kitchen scale, cake decorating tools, piping tips, boxes, and bulk food-safe packaging tags.',
          checklist: ['Procure standard baking pans and mixing bowls', 'Purchase food-grade parchment paper and boxes', 'Establish organized cupboard storage for ingredients']
        },
        {
          id: 'step_2_3',
          phase: '3. Cost & Pricing',
          title: 'Calculate Cost per Unit',
          description: 'Tally the exact cost of ingredients (flour, eggs, sugar, custom packaging). Target a standard 3x markup to ensure labor and utility overheads are covered.',
          checklist: ['Create a spreadsheet calculating ingredient cost per cake', 'Set final retail prices for cupcakes, cookies, and specialty cakes', 'Choose your primary payment apps (Venmo, cash, cards)']
        },
        {
          id: 'step_2_4',
          phase: '4. Legal & Setup',
          title: 'Register for Cottage Food Permits',
          description: 'Review local Cottage Food regulations. Most states allow selling non-perishable baked goods from home. Complete a food handler safety course.',
          checklist: ['Complete a basic Food Handler certification', 'Review list of permitted cottage foods in your state', 'Design labels containing allergens and cottage food disclaimer']
        },
        {
          id: 'step_2_5',
          phase: '5. Marketing & Launch',
          title: 'Local Markets & Social Promos',
          description: 'Apply for a stall at the local farmers market. Launch a WhatsApp catalog, publish baking reels on Instagram, and offer free dessert samples to local office buildings.',
          checklist: ['Design banner/tablecloth for farmers markets', 'Set up a WhatsApp Business catalog page', 'Schedule first weekend pop-up launch event']
        }
      ]
    },
    {
      id: 'idea_3',
      title: 'Eco-friendly Handmade Gift Shop',
      description: 'Craft sustainable gifts like beeswax candles, organic soaps, and natural stationery to sell online and at local craft fairs.',
      skills: ['Handicrafts/Art'],
      interests: ['Sustainability', 'Creative Arts', 'E-commerce'],
      difficulty: 'Easy',
      matchScore: 88,
      steps: [
        {
          id: 'step_3_1',
          phase: '1. Idea Validation',
          title: 'Select Material & Product Range',
          description: 'Zero in on products you enjoy making. Choose biodegradable packaging and natural raw materials. Test-make 10 items to measure speed and consistency.',
          checklist: ['Choose product type (candles, soap, paper)', 'Verify sourcing of organic, chemical-free materials', 'Document time spent making a single item']
        },
        {
          id: 'step_3_2',
          phase: '2. Tools & Skills',
          title: 'Gather Workstation Gear',
          description: 'Assemble candle melting pots, silicone soap molds, measuring scales, fragrance oils, labels, and craft paper wraps.',
          checklist: ['Purchase safety equipment (gloves, goggles, thermometer)', 'Establish dry storage for finished products', 'Design branding stamp for plain box wraps']
        },
        {
          id: 'step_3_3',
          phase: '3. Cost & Pricing',
          title: 'Develop Multi-Tier Pricing',
          description: 'Itemize costs for wax/oils, wicks, custom stamps, and shipping materials. Target a 65-70% margin for direct-to-consumer sales.',
          checklist: ['Calculate raw cost of each product unit', 'Define single item prices and combo gift pack prices', 'List shipping options and carrier flat-rates']
        },
        {
          id: 'step_3_4',
          phase: '4. Legal & Setup',
          title: 'Register Online Store accounts',
          description: 'Open a shop on Etsy or design a basic Shopify storefront. Complete standard sole proprietorship registration and get a tax ID if required.',
          checklist: ['Create Etsy seller account or basic Shopify page', 'Draft clear refund, exchange, and shipping policies', 'Set up business email and billing gateway']
        },
        {
          id: 'step_3_5',
          phase: '5. Marketing & Launch',
          title: 'Branding & Social Community Building',
          description: 'Share behind-the-scenes videos of your crafting process on Instagram/TikTok. Participate in eco-aware local craft markets and flea fairs.',
          checklist: ['Record a video showing product creation step-by-step', 'Register for a booth at upcoming local holiday/craft market', 'Create a discounts voucher for newsletter subscribers']
        }
      ]
    },
    {
      id: 'idea_4',
      title: 'Local Gadget Repair & Tech Support',
      description: 'Provide repair services for screens, batteries, computer software troubleshooting, and home network setups.',
      skills: ['Gadget Repair/Tech Support'],
      interests: ['Tech/Gadgets', 'Local Community'],
      difficulty: 'Hard',
      matchScore: 92,
      steps: [
        {
          id: 'step_4_1',
          phase: '1. Idea Validation',
          title: 'Identify Core Services',
          description: 'Determine which devices you can confidently fix (e.g. iPhone screens, Windows PC slow speed fixes, smart home setups). Reach out to friends to act as first mock clients.',
          checklist: ['Make a list of devices and brands supported', 'Write diagnostic protocols for common failures', 'Confirm availability of quality replacement part suppliers']
        },
        {
          id: 'step_4_2',
          phase: '2. Tools & Skills',
          title: 'Procure Quality Diagnostics Tools',
          description: 'Buy an anti-static mat, precision driver set, heat gun for screen softening, screen adhesive strips, clamp tools, and a digital multimeter.',
          checklist: ['Acquire iFixit-style repair toolkit', 'Organize spare parts organizer bins', 'Set up clean workbench workspace free of static']
        },
        {
          id: 'step_4_3',
          phase: '3. Cost & Pricing',
          title: 'Service Charges & Part Markup',
          description: 'Establish standard labor rates (e.g., $40 flat fee for diagnostics, $60/hr for repair labor). Add a 20-30% markup on ordered hardware components.',
          checklist: ['Draft service menu (screen swap, battery swap, software clean)', 'Set up quick invoicing system containing terms and conditions', 'Research wholesale distributors of replacement screens/batteries']
        },
        {
          id: 'step_4_4',
          phase: '4. Legal & Setup',
          title: 'Formulate Liability Waiver & Business entity',
          description: 'Create a liability disclaimer (since you are working on client hardware/data). Register your LLC and research local recycling protocols for lithium batteries.',
          checklist: ['Draft customer liability waiver (important for electronics!)', 'Check battery recycling drop-off locations nearby', 'Register business locally']
        },
        {
          id: 'step_4_5',
          phase: '5. Marketing & Launch',
          title: 'SEO, Google Maps, and Flyer Drop',
          description: 'Create a Google Business Profile listing your services, address, and hours. Run high-visibility flyer drops in local retirement homes or neighborhood centers.',
          checklist: ['Claim Google Maps Business Profile location', 'Print 100 flyers highlighting senior discount offers', 'Launch simple website listing services and rates']
        }
      ]
    },
    {
      id: 'idea_5',
      title: 'Social Media Management for Small Brands',
      description: 'Help local businesses, shops, and startups increase sales by creating content and managing their social media pages.',
      skills: ['Digital Marketing/Writing', 'Photography/Video Editing'],
      interests: ['Tech/Gadgets', 'E-commerce', 'Creative Arts'],
      difficulty: 'Medium',
      matchScore: 90,
      steps: [
        {
          id: 'step_5_1',
          phase: '1. Idea Validation',
          title: 'Identify Ideal Client Profile & Niche',
          description: 'Define your target niche (e.g., local cafes, boutique retail stores, fitness trainers). Audit 5 local brand profiles to find visual gaps and opportunities.',
          checklist: ['List 10 local businesses with outdated/inactive pages', 'Create a sample portfolio of posts (mock brands)', 'Draft a value-proposition elevator pitch']
        },
        {
          id: 'step_5_2',
          phase: '2. Tools & Skills',
          title: 'Learn Industry-Standard Software',
          description: 'Acquire access and proficiency in design apps (Canva Pro), social schedulers (Buffer/Later), and video editors (CapCut/Premiere).',
          checklist: ['Set up graphic design templates in Canva', 'Create free scheduler accounts for content queuing', 'Build resource library of royalty-free sound/stock paths']
        },
        {
          id: 'step_5_3',
          phase: '3. Cost & Pricing',
          title: 'Structure Monthly Retainers',
          description: 'Design monthly packages. Starter Package: 3 posts/week ($300/mo). Growth Package: 5 posts + 2 reels + comments response ($600/mo).',
          checklist: ['Draft PDF proposal outlining package scopes', 'Choose payment setup (recurring invoicing via Stripe/PayPal)', 'Calculate monthly software subscriptions overhead costs']
        },
        {
          id: 'step_5_4',
          phase: '4. Legal & Setup',
          title: 'Draft standard freelance client contract',
          description: 'Prepare a freelance contract outlining delivery terms, client approval milestones, payment rules, and account access safety protocols.',
          checklist: ['Acquire/draft standard Social Media Freelancer agreement template', 'Establish shared password managers access protocol', 'Set up business banking and email domains']
        },
        {
          id: 'step_5_5',
          phase: '5. Marketing & Launch',
          title: 'Portfolio Showcase & Pitching Campaign',
          description: 'Publish case studies on LinkedIn or your website showing post ideas. Pitch 3 local business owners with a free 1-week visual post template audit.',
          checklist: ['Launch personal landing page / portfolio portfolio', 'Pitch 3 local store owners via email or physical visits', 'Offer first client a 15% discount for a 3-month contract sign-on']
        }
      ]
    }
  ],
  sessions: [
    {
      id: 'sess_1',
      mentorId: 'men_1',
      userId: 'usr_2',
      userName: 'Jane Doe',
      status: 'pending',
      question: 'How do I start sourcing eco-friendly fabrics locally on a small budget?',
      requestedAt: '2026-06-05T10:00:00Z'
    }
  ]
};

// Helper functions for reading and writing data
export function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(INITIAL_DATA);
    return INITIAL_DATA;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, returning initial seed data', err);
    return INITIAL_DATA;
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file', err);
  }
}

export function getUsers() {
  return readDB().users;
}

export function getUserById(id) {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(user) {
  const db = readDB();
  const newUser = {
    id: `usr_${Date.now()}`,
    skills: [],
    interests: [],
    bookmarks: [],
    completedSteps: {},
    registeredAt: new Date().toISOString(),
    ...user
  };
  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

export function updateUser(id, updates) {
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...updates };
    writeDB(db);
    return db.users[idx];
  }
  return null;
}

export function getMentors() {
  return readDB().mentors;
}

export function getMentorById(id) {
  return getMentors().find(m => m.id === id);
}

export function getMentorByUserId(userId) {
  return getMentors().find(m => m.userId === userId);
}

export function createMentor(mentor) {
  const db = readDB();
  const newMentor = {
    id: `men_${Date.now()}`,
    approved: false,
    resources: [],
    ...mentor
  };
  db.mentors.push(newMentor);
  writeDB(db);
  return newMentor;
}

export function updateMentor(id, updates) {
  const db = readDB();
  const idx = db.mentors.findIndex(m => m.id === id);
  if (idx !== -1) {
    db.mentors[idx] = { ...db.mentors[idx], ...updates };
    writeDB(db);
    return db.mentors[idx];
  }
  return null;
}

export function getSkills() {
  return readDB().skills;
}

export function getInterests() {
  return readDB().interests;
}

export function getIdeas() {
  return readDB().ideas;
}

export function getIdeaById(id) {
  return getIdeas().find(i => i.id === id);
}

export function getSessions() {
  return readDB().sessions;
}

export function createSession(session) {
  const db = readDB();
  const newSession = {
    id: `sess_${Date.now()}`,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    ...session
  };
  db.sessions.push(newSession);
  writeDB(db);
  return newSession;
}

export function updateSession(id, updates) {
  const db = readDB();
  const idx = db.sessions.findIndex(s => s.id === id);
  if (idx !== -1) {
    db.sessions[idx] = { ...db.sessions[idx], ...updates };
    writeDB(db);
    return db.sessions[idx];
  }
  return null;
}
