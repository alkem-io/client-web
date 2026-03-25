
// Mock Data for Templates and Packs

export const IMAGES = [
  "https://images.unsplash.com/photo-1554103210-26d928978fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1631203924388-644782a70944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1758691736084-4ef3e6f6a2cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1721132537184-5494c01ed87f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1677506048148-0c914dd8197b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
];

export const SPACE_IMAGES = [
  "https://images.unsplash.com/photo-1663720408974-ba1a28863487?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1750768145651-86374acaff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1681041318320-1ed7a6fa376c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
];

export const SUBSPACE_IMAGES = [
  "https://images.unsplash.com/photo-1768036479285-006169612ff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1630852722702-3e2ec1eaa751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1562939651-9359f291c988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
];

export const PACK_NAMES = [
  "Design Sprint Kit", "Agile Team Rituals", "Strategic Planning", "User Research Suite", 
  "Product Launch System", "Community Building", "Marketing Campaign", "Startup Fundamentals", 
  "Remote Work Essentials", "Innovation Workshop", "Growth Hacking", "Crisis Management", 
  "Brand Identity", "Content Strategy", "Sales Pipeline", "Customer Support", 
  "HR Onboarding", "Event Planning", "Financial Modeling", "Data Analysis", 
  "Software Development", "Quality Assurance", "Legal Compliance", "Partnership Agreement", 
  "Investment Pitch", "Board Meeting", "Quarterly Review", "Yearly Planning", 
  "Team Retreat", "Educational Course"
];

export const AUTHORS = ["Google Ventures", "Atlassian", "HBR", "Nielsen Norman", "Y Combinator", "Miro", "Figma", "Notion", "Slack", "Salesforce"];
export const CATEGORIES = ["All", "Subspace", "Collaboration Tool", "Community Guidelines", "Post", "Space", "Whiteboard"];
export const TEMPLATE_TYPES = ["Subspace", "Collaboration Tool", "Community Guidelines", "Post", "Space", "Whiteboard"];

// Generate 30 Packs
export const TEMPLATE_PACKS = Array.from({ length: 30 }).map((_, i) => ({
  id: `pack-${i + 1}`,
  name: PACK_NAMES[i % PACK_NAMES.length] + (i >= PACK_NAMES.length ? ` ${Math.floor(i / PACK_NAMES.length) + 1}` : ""),
  description: `Complete process for ${PACK_NAMES[i % PACK_NAMES.length].toLowerCase()} with essential tools and frameworks.`,
  templateCount: Math.floor(Math.random() * 8) + 3,
  tags: [["Innovation", "Product", "Strategy"], ["Management", "Agile", "Teamwork"], ["Research", "UX", "Design"]][i % 3],
  image: IMAGES[i % IMAGES.length],
  initials: PACK_NAMES[i % PACK_NAMES.length].split(" ").map(n => n[0]).join("").substring(0, 2),
  color: ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"][i % 5],
  author: AUTHORS[i % AUTHORS.length]
}));

// Generate 100 Templates
export const INDIVIDUAL_TEMPLATES = Array.from({ length: 100 }).map((_, i) => {
  const isPartOfPack = Math.random() > 0.4; // 60% chance to be part of a pack
  const pack = isPartOfPack ? TEMPLATE_PACKS[Math.floor(Math.random() * TEMPLATE_PACKS.length)] : null;
  const type = TEMPLATE_TYPES[Math.floor(Math.random() * TEMPLATE_TYPES.length)];
  
  // Base Structure
  let structure: any = {};
  let previewContent = "";
  
  if (type === "Space") {
      previewContent = SPACE_IMAGES[i % SPACE_IMAGES.length];
      structure = {
          tabs: ["About", "Resources", "Subspaces", "Templates"],
          about: "This space is dedicated to " + type.toLowerCase() + " activities. Use the tabs to navigate between resources and active work streams.",
          subspaces: [
              { name: "Strategy Hub", description: "Central planning and decision making", type: "Subspace" },
              { name: "Execution Lab", description: "Daily tasks and sprint tracking", type: "Subspace" },
              { name: "Archive", description: "Historical documents and past decisions", type: "Subspace" }
          ],
          templates: [
              { name: "Weekly Update", type: "Post" },
              { name: "Project Canvas", type: "Whiteboard" }
          ],
          samplePosts: {
              "Resources": [
                  { title: "Key Metrics Dashboard", type: "Link" },
                  { title: "Brand Guidelines PDF", type: "File" }
              ],
              "Subspaces": [
                  { title: "Q1 Strategy Kickoff", type: "Post" }
              ]
          }
      };
  } else if (type === "Subspace") {
      previewContent = SUBSPACE_IMAGES[i % SUBSPACE_IMAGES.length];
      structure = {
          description: "A workflow for managing the innovation lifecycle.",
          stages: [
              { 
                  name: "Innovate", 
                  posts: ["Problem Definition", "Brainstorming Session", "Customer Interviews"]
              },
              { 
                  name: "Build", 
                  posts: ["Prototype Specs", "Tech Stack Review", "MVP Scope"]
              },
              { 
                  name: "Execute", 
                  posts: ["Launch Plan", "Marketing Assets", "Go-Live Checklist"]
              },
               { 
                  name: "Evaluate", 
                  posts: ["Post-Mortem", "User Feedback Analysis"]
              }
          ]
      };
  } else if (type === "Collaboration Tool") {
      const components = ["Whiteboard", "Memo", "Link Collection"];
      const comp = components[i % 3];
      structure = {
          post: {
              title: "Workshop Kickoff",
              description: "Use this post to frame the session. Participants will click through to the attached " + comp + ".",
              fields: ["Context", "Goals", "Attendees"]
          },
          component: {
              type: comp,
              name: "Collaborative " + comp,
              preview: "Visual preview of " + comp
          }
      };
  } else if (type === "Post") {
      structure = {
          title: "[Project Name] - Status Update",
          body: "## Summary\n\n## Blockers\n- \n\n## Next Steps\n- "
      };
  } else if (type === "Community Guidelines") {
      structure = {
          categories: [
              { name: "Code of Conduct", preview: "Be respectful and inclusive..." },
              { name: "Communication Norms", preview: "Use threads for discussions..." },
              { name: "Conflict Resolution", preview: "Escalate to admins if needed..." }
          ]
      };
  }

  return {
    id: `temp-${i + 1}`,
    name: `${type} Template: ${["Analysis", "Review", "Plan", "Board", "Document", "Guide", "Canvas", "Flow"][i % 8]} ${i + 1}`,
    description: `A comprehensive ${type.toLowerCase()} template for your team workflow.`,
    type: type,
    category: ["Planning", "Ideation", "Strategy", "Design", "Research", "Management"][i % 6],
    tags: [["Creative", "Team"], ["Documentation", "Start"], ["Feedback", "Review"], ["Analysis", "Business"]][i % 4],
    previewContent: previewContent,
    structure,
    packId: pack?.id || null,
    packName: pack?.name || null,
    author: AUTHORS[i % AUTHORS.length],
    complexity: ["Beginner", "Intermediate", "Advanced"][i % 3],
    usageCount: Math.floor(Math.random() * 500) + 10,
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
    instructions: Math.random() > 0.3 ? `
      <h2>How to Use This Template</h2>
      <p>This template is designed to facilitate ${type.toLowerCase()} sessions. Follow these steps to get the most out of it:</p>
      
      <h3>1. Setup</h3>
      <p>Begin by defining the core objective. Make sure all participants understand the goal of the session.</p>
      
      <h3>2. Brainstorming</h3>
      <p>Use the provided sections to capture ideas. Encourage quantity over quality in the initial phase.</p>
      
      <h3>3. Synthesis</h3>
      <p>Group related items together. Look for patterns and themes that emerge from the contributions.</p>
      
      <h3>4. Action Items</h3>
      <p>Conclude by assigning owners to specific tasks. Ensure clear deadlines are set.</p>
    ` : null
  };
});

// Specific templates used in Pack Detail
export const PACK_SPECIFIC_TEMPLATES = [
  {
    id: "temp-1",
    name: "Sprint Room",
    description: "A dedicated war room for your sprint team with daily boards and resource links.",
    type: "Space",
    category: "Space",
    previewContent: null,
    tags: ["Sprint", "Agile"],
    usageCount: 150,
    author: "Google Ventures",
    complexity: "Intermediate",
    structure: {
        tabs: ["About", "Resources", "Subspaces", "Templates"],
        about: "The Sprint Room is your team's home base for the 5-day design sprint. It organizes all daily activities and artifacts in one place.",
        subspaces: [
            { name: "Day 1: Map", description: "Understand the problem space", type: "Subspace" },
            { name: "Day 2: Sketch", description: "Ideate solutions individually", type: "Subspace" },
            { name: "Day 3: Decide", description: "Converge on the best solution", type: "Subspace" },
            { name: "Day 4: Prototype", description: "Build a realistic facade", type: "Subspace" },
            { name: "Day 5: Test", description: "Validate with real users", type: "Subspace" }
        ],
        templates: [
            { name: "Daily Standup", type: "Post" },
            { name: "Retrospective", type: "Post" }
        ],
        samplePosts: {
            "Resources": [
                { title: "Sprint Book PDF", type: "File" },
                { title: "User Research Recordings", type: "Link" }
            ]
        }
    },
    instructions: "<h2>Setting up your Sprint Room</h2><p>This space is your central hub. 1. Invite your team. 2. Schedule the daily standups. 3. Upload your initial research to the Knowledge Base.</p>"
  },
  {
      id: "temp-sub-1",
      name: "Innovation Pipeline",
      description: "Track ideas from concept to launch with these predefined phases.",
      type: "Subspace",
      category: "Process",
      previewContent: "https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      tags: ["Innovation", "Process"],
      usageCount: 85,
      author: "Google Ventures",
      complexity: "Advanced",
      structure: {
          description: "A structured flow to move ideas from conception to market launch.",
          stages: [
              { name: "Discovery", posts: ["Trend Analysis", "Customer Pain Points", "Market Opportunity"] },
              { name: "Validation", posts: ["Hypothesis Testing", "User Interviews", "Survey Results"] },
              { name: "Prototyping", posts: ["Wireframes", "Mockups", "Feasibility Check"] },
              { name: "Pilot", posts: ["Beta Launch Plan", "Success Metrics", "Early Adopter Feedback"] },
              { name: "Launch", posts: ["GTM Strategy", "Press Release Draft", "Sales Enablement"] }
          ]
      },
      instructions: "<h2>Pipeline Management</h2><p>Move items through these phases as they mature. Require specific exit criteria for each phase.</p>"
  },
  {
      id: "temp-sub-2",
      name: "User Research Study",
      description: "Manage recruitment, interviews, and synthesis phases.",
      type: "Subspace",
      category: "Research",
      previewContent: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      tags: ["Research", "User Testing"],
      usageCount: 60,
      author: "Google Ventures",
      complexity: "Intermediate",
      structure: {
          description: "End-to-end management of a user research study.",
          stages: [
              { name: "Planning", posts: ["Research Plan", "Recruitment Screener"] },
              { name: "Fieldwork", posts: ["Interview Notes", "Session Recordings"] },
              { name: "Analysis", posts: ["Affinity Mapping", "Key Insights"] },
              { name: "Reporting", posts: ["Final Report", "Shareout Deck"] }
          ]
      },
      instructions: "<h2>Research Workflow</h2><p>Use the Recruitment phase to track candidates. Store signed NDAs in the card attachments.</p>"
  },
  {
    id: "temp-2",
    name: "Sprint Agenda & Schedule",
    description: "Day-by-day schedule for the 5-day sprint process.",
    type: "Collaboration Tool",
    category: "Planning",
    previewContent: null,
    tags: ["Planning", "Agenda"],
    usageCount: 200,
    author: "Google Ventures",
    complexity: "Beginner",
    structure: {
        post: {
            title: "Sprint Week Agenda",
            description: "A clear schedule for the week to keep everyone aligned.",
            fields: ["Date", "Time Slots", "Activities", "Owner"]
        },
        component: {
            type: "Whiteboard",
            name: "Schedule Planner Board",
            preview: "Calendar grid with sticky notes"
        }
    },
    instructions: "<h2>Running the Agenda</h2><p>Post this at the start of the week. Update it daily with any adjustments.</p>"
  },
  {
    id: "temp-3",
    name: "User Interview Script",
    description: "Template for interviewing users on Friday.",
    type: "Collaboration Tool",
    category: "Research",
    previewContent: null,
    tags: ["Research", "Script"],
    usageCount: 90,
    author: "Google Ventures",
    complexity: "Beginner",
    structure: {
        post: {
            title: "Interview Guide: [Participant Name]",
            description: "Standardized questions to ask during the interview.",
            fields: ["Intro Script", "Warm-up Questions", "Core Task Scenarios", "Wrap-up"]
        },
        component: {
            type: "Memo",
            name: "Note Taking Doc",
            preview: "Structured document with question headers"
        }
    },
    instructions: "<h2>Interviewing</h2><p>Read the introduction verbatim to ensure consistency across participants.</p>"
  },
  {
    id: "temp-4",
    name: "Monday: Map & Target",
    description: "Whiteboard for mapping the problem and picking a target.",
    type: "Whiteboard",
    category: "Ideation",
    previewContent: null,
    tags: ["Mapping", "Strategy"],
    usageCount: 110,
    author: "Google Ventures",
    complexity: "Intermediate",
    structure: {},
    instructions: "<h2>Mapping</h2><p>Start on the left. List the actors. Map the flow to the goal on the right.</p>"
  },
  {
    id: "temp-5",
    name: "Tuesday: Sketching",
    description: "Board for Crazy 8s and Solution Sketching.",
    type: "Whiteboard",
    category: "Ideation",
    previewContent: null,
    tags: ["Sketching", "Ideation"],
    usageCount: 115,
    author: "Google Ventures",
    complexity: "Beginner",
    structure: {},
    instructions: "<h2>Crazy 8s</h2><p>Fold a paper into 8 sections. Sketch 8 ideas in 8 minutes. Go for quantity.</p>"
  },
  {
    id: "temp-6",
    name: "Wednesday: Decide",
    description: "Sticky decision board for selecting the best ideas.",
    type: "Whiteboard",
    category: "Decision Making",
    previewContent: null,
    tags: ["Decision", "Voting"],
    usageCount: 105,
    author: "Google Ventures",
    complexity: "Beginner",
    structure: {},
    instructions: "<h2>Sticky Decision</h2><p>Vote silently with dots. The Decider has the Supervote.</p>"
  },
  {
    id: "temp-7",
    name: "Thursday: Storyboard",
    description: "Grid for planning the prototype.",
    type: "Whiteboard",
    category: "Prototyping",
    previewContent: null,
    tags: ["Prototyping", "Storyboard"],
    usageCount: 95,
    author: "Google Ventures",
    complexity: "Advanced",
    structure: {},
    instructions: "<h2>Storyboarding</h2><p>Fill the grid. Don't worry about artistic quality, focus on the flow.</p>"
  },
  {
    id: "temp-8",
    name: "Sprint Rules",
    description: "Guidelines for maintaining energy and focus.",
    type: "Community Guidelines",
    category: "Guidelines",
    previewContent: null,
    tags: ["Guidelines", "Rules"],
    usageCount: 300,
    author: "Google Ventures",
    complexity: "Beginner",
    structure: {
        categories: [
            { name: "Devices", preview: "No laptops or phones during sessions." },
            { name: "Timing", preview: "Strict adherence to the time timer." },
            { name: "Participation", preview: "Together alone - work silently then share." }
        ]
    },
    instructions: "<h2>Setting Guidelines</h2><p>Review these rules at the start of the sprint. Post them visibly in the room.</p>"
  }
];

export const ALL_TEMPLATES = [...PACK_SPECIFIC_TEMPLATES, ...INDIVIDUAL_TEMPLATES.filter(t => !PACK_SPECIFIC_TEMPLATES.find(pt => pt.id === t.id))];
