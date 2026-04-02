import type { SpaceCardData } from "@/app/components/space/SpaceCard";

// ── Result types ──

export interface SearchPostResult {
  id: string;
  title: string;
  snippet: string;
  type: "post" | "whiteboard" | "memo";
  author: { name: string; avatar: string };
  spaceName: string;
  spaceSlug: string;
  date: string;
  bannerImage?: string;
  stats: { comments: number; reactions: number };
}

export interface SearchResponseResult {
  id: string;
  title: string;
  snippet: string;
  type: "post" | "whiteboard" | "memo";
  author: { name: string; avatar: string };
  parentPostTitle: string;
  parentPostId: string;
  spaceName: string;
  spaceSlug: string;
  date: string;
  stats: { comments: number; reactions: number };
}

export interface SearchUserResult {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
}

export interface SearchOrgResult {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  type: string;
}

// ── Category keys ──
export type SearchCategory = "spaces" | "posts" | "responses" | "users" | "organizations";

export const CATEGORY_LABELS: Record<SearchCategory, string> = {
  spaces: "Spaces & Subspaces",
  posts: "Posts",
  responses: "Responses",
  users: "Users",
  organizations: "Organizations",
};

// ── Mock spaces ──
export const MOCK_SPACES: SpaceCardData[] = [
  {
    id: "s1",
    slug: "green-energy",
    name: "Green Energy Space",
    description: "A collaborative workspace for cross-sector innovation, bringing together stakeholders from government, business, and civil society.",
    bannerImage: "https://images.unsplash.com/photo-1767163934854-655747a35068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaW5ub3ZhdGlvbiUyMHRlY2hub2xvZ3klMjBzdGFydHVwfGVufDF8fHx8MTc3MTUwNDQxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "GE",
    avatarColor: "#3b82f6",
    isPrivate: false,
    tags: ["Innovation", "Collaboration", "Design"],
    memberCount: 142,
    leads: [
      { name: "Elena Martinez", avatar: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256", type: "person" },
      { name: "David Kim", avatar: "https://images.unsplash.com/photo-1651634099348-e4c38cfaa6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBiZWFyZCUyMHN1bnNldCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256", type: "person" },
    ],
  },
  {
    id: "s2",
    slug: "sustainability-lab",
    name: "Sustainability Lab",
    description: "Research and projects focused on sustainable urban development, clean energy, and environmental policy.",
    bannerImage: "https://images.unsplash.com/photo-1638068109209-002be3ae4950?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhciUyMHdpbmR8ZW58MXx8fHwxNzcxNDMzNDAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SL",
    avatarColor: "#22c55e",
    isPrivate: false,
    tags: ["Sustainability", "Environment", "Research"],
    memberCount: 89,
    leads: [
      { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1757347398206-7425300ef990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256", type: "person" },
    ],
  },
  {
    id: "s3",
    slug: "urban-mobility",
    name: "Urban Mobility Lab",
    description: "Exploring smart transportation solutions for cities, from micro-mobility to autonomous systems.",
    bannerImage: "https://images.unsplash.com/photo-1760459477099-ad81fd11d7c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjaXR5JTIwdXJiYW4lMjBwbGFubmluZ3xlbnwxfHx8fDE3NzE0NDQ3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "UM",
    avatarColor: "#f59e0b",
    isPrivate: false,
    tags: ["Mobility", "Smart Cities", "Transport"],
    memberCount: 67,
    leads: [
      { name: "Maya Ross", avatar: "https://images.unsplash.com/photo-1589332911105-a6b59f2e4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256", type: "person" },
    ],
  },
  {
    id: "s4",
    slug: "green-design",
    name: "Green Design Challenge",
    description: "A subspace dedicated to eco-friendly product and architectural design.",
    bannerImage: "https://images.unsplash.com/photo-1770982699106-7dfcce2c44d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBzdXN0YWluYWJsZXxlbnwxfHx8fDE3NzE1MDQ0MjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "GD",
    avatarColor: "#10b981",
    isPrivate: true,
    tags: ["Design", "Architecture", "Eco"],
    memberCount: 35,
    leads: [
      { name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1651097681268-851acda33b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGRlciUyMG1hbiUyMHdoaXRlJTIwYmVhcmQlMjBnbGFzc2VzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256", type: "person" },
    ],
    parent: { name: "Sustainability Lab", slug: "sustainability-lab", initials: "SL", avatarColor: "#22c55e" },
  },
  {
    id: "s5",
    slug: "ocean-health",
    name: "Ocean Health Initiative",
    description: "Protecting marine ecosystems through collaborative research and community action.",
    bannerImage: "https://images.unsplash.com/photo-1761590699238-6f763c27f012?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGNvbnNlcnZhdGlvbiUyMG1hcmluZSUyMGVudmlyb25tZW50fGVufDF8fHx8MTc3MTUwNDQzNHww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "OH",
    avatarColor: "#0ea5e9",
    isPrivate: false,
    tags: ["Ocean", "Conservation", "Marine"],
    memberCount: 53,
    leads: [
      { name: "Elena Martinez", avatar: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256", type: "person" },
    ],
  },
];

// ── Mock posts ──
export const MOCK_POSTS: SearchPostResult[] = [
  {
    id: "p1",
    title: "Design Thinking Workshop Outcomes",
    snippet: "Summary of last week's workshop where we explored human-centered solutions for urban mobility challenges, including new prototyping methods.",
    type: "post",
    author: { name: "Elena Martinez", avatar: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256" },
    spaceName: "Green Energy Space",
    spaceSlug: "green-energy",
    date: "Feb 14, 2026",
    bannerImage: "https://images.unsplash.com/photo-1630673489068-d329fa4e2767?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdGVhbSUyMG1lZXRpbmclMjB3aGl0ZWJvYXJkfGVufDF8fHx8MTc3MTUwNDQzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    stats: { comments: 12, reactions: 34 },
  },
  {
    id: "p2",
    title: "Innovation Sprint Planning Board",
    snippet: "Collaborative whiteboard mapping Q2 innovation sprint objectives and team assignments.",
    type: "whiteboard",
    author: { name: "David Kim", avatar: "https://images.unsplash.com/photo-1651634099348-e4c38cfaa6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBiZWFyZCUyMHN1bnNldCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256" },
    spaceName: "Green Energy Space",
    spaceSlug: "green-energy",
    date: "Feb 10, 2026",
    stats: { comments: 5, reactions: 18 },
  },
  {
    id: "p3",
    title: "Meeting Notes: Sustainability KPIs",
    snippet: "Key performance indicators we agreed upon for measuring environmental impact across all projects this quarter.",
    type: "memo",
    author: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1757347398206-7425300ef990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256" },
    spaceName: "Sustainability Lab",
    spaceSlug: "sustainability-lab",
    date: "Feb 8, 2026",
    stats: { comments: 8, reactions: 22 },
  },
  {
    id: "p4",
    title: "Green Building Materials Research",
    snippet: "An overview of cutting-edge eco-friendly construction materials being evaluated for pilot projects.",
    type: "post",
    author: { name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1651097681268-851acda33b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGRlciUyMG1hbiUyMHdoaXRlJTIwYmVhcmQlMjBnbGFzc2VzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256" },
    spaceName: "Green Design Challenge",
    spaceSlug: "green-design",
    date: "Feb 5, 2026",
    stats: { comments: 3, reactions: 15 },
  },
  {
    id: "p5",
    title: "Mobility Design Patterns",
    snippet: "A collection of design pattern templates for urban mobility applications and smart city integrations.",
    type: "whiteboard",
    author: { name: "Maya Ross", avatar: "https://images.unsplash.com/photo-1589332911105-a6b59f2e4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256" },
    spaceName: "Urban Mobility Lab",
    spaceSlug: "urban-mobility",
    date: "Feb 2, 2026",
    stats: { comments: 7, reactions: 28 },
  },
  {
    id: "p6",
    title: "Coral Reef Monitoring Data Analysis",
    snippet: "Latest sensor data from reef monitoring stations, with preliminary insights on temperature impacts.",
    type: "memo",
    author: { name: "Elena Martinez", avatar: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256" },
    spaceName: "Ocean Health Initiative",
    spaceSlug: "ocean-health",
    date: "Jan 28, 2026",
    stats: { comments: 14, reactions: 41 },
  },
];

// ── Mock responses ──
export const MOCK_RESPONSES: SearchResponseResult[] = [
  {
    id: "r1",
    title: "Electric Bus Route Optimization",
    snippet: "Proposal for redesigning bus routes in the downtown core using electric micro-bus fleet data from pilot.",
    type: "post",
    author: { name: "David Kim", avatar: "https://images.unsplash.com/photo-1651634099348-e4c38cfaa6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBiZWFyZCUyMHN1bnNldCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256" },
    parentPostTitle: "Call for Mobility Solutions",
    parentPostId: "p5",
    spaceName: "Urban Mobility Lab",
    spaceSlug: "urban-mobility",
    date: "Feb 12, 2026",
    stats: { comments: 4, reactions: 11 },
  },
  {
    id: "r2",
    title: "Bio-Based Insulation Materials",
    snippet: "Response presenting research on mycelium-based insulation as a sustainable alternative to fiberglass.",
    type: "whiteboard",
    author: { name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1651097681268-851acda33b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGRlciUyMG1hbiUyMHdoaXRlJTIwYmVhcmQlMjBnbGFzc2VzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256" },
    parentPostTitle: "Green Building Materials Research",
    parentPostId: "p4",
    spaceName: "Green Design Challenge",
    spaceSlug: "green-design",
    date: "Feb 9, 2026",
    stats: { comments: 6, reactions: 19 },
  },
  {
    id: "r3",
    title: "Citizen Science Platform for Reef Health",
    snippet: "A memo outlining how to engage local diving communities to contribute coral health observation data.",
    type: "memo",
    author: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1757347398206-7425300ef990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256" },
    parentPostTitle: "Coral Reef Monitoring Data Analysis",
    parentPostId: "p6",
    spaceName: "Ocean Health Initiative",
    spaceSlug: "ocean-health",
    date: "Feb 3, 2026",
    stats: { comments: 9, reactions: 25 },
  },
  {
    id: "r4",
    title: "Stakeholder Map for Innovation Network",
    snippet: "Visual mapping of current stakeholders across the innovation portfolio with engagement levels.",
    type: "whiteboard",
    author: { name: "Maya Ross", avatar: "https://images.unsplash.com/photo-1589332911105-a6b59f2e4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256" },
    parentPostTitle: "Design Thinking Workshop Outcomes",
    parentPostId: "p1",
    spaceName: "Green Energy Space",
    spaceSlug: "green-energy",
    date: "Feb 16, 2026",
    stats: { comments: 2, reactions: 8 },
  },
];

// ── Mock users ──
export const MOCK_USERS: SearchUserResult[] = [
  { id: "u1", name: "Elena Martinez", avatar: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256", email: "elena@alkemio.org", role: "Host" },
  { id: "u2", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1757347398206-7425300ef990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256", email: "sarah@alkemio.org", role: "Admin" },
  { id: "u3", name: "Maya Ross", avatar: "https://images.unsplash.com/photo-1589332911105-a6b59f2e4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256", email: "maya@alkemio.org", role: "Lead" },
  { id: "u4", name: "David Kim", avatar: "https://images.unsplash.com/photo-1651634099348-e4c38cfaa6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBiZWFyZCUyMHN1bnNldCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256", email: "david@example.com", role: "Member" },
  { id: "u5", name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1651097681268-851acda33b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGRlciUyMG1hbiUyMHdoaXRlJTIwYmVhcmQlMjBnbGFzc2VzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256", email: "robert@greendesign.co", role: "Member" },
  { id: "u6", name: "Ava Patel", avatar: "https://images.unsplash.com/photo-1758599543120-4e462429a4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwY29ycG9yYXRlfGVufDF8fHx8MTc3MTUwNDQyNHww&ixlib=rb-4.1.0&q=80&w=1080", email: "ava@oceanfund.org", role: "Contributor" },
  { id: "u7", name: "James Wilson", avatar: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MTQzOTIzOXww&ixlib=rb-4.1.0&q=80&w=1080", email: "james@urbantech.io", role: "Lead" },
];

// ── Mock organizations ──
export const MOCK_ORGS: SearchOrgResult[] = [
  { id: "o1", name: "GreenTech Foundation", avatar: "", tagline: "Accelerating sustainable technology adoption", type: "Non-profit" },
  { id: "o2", name: "Urban Dynamics Institute", avatar: "", tagline: "Research for smarter, more equitable cities", type: "Research" },
  { id: "o3", name: "OceanWatch International", avatar: "", tagline: "Protecting marine ecosystems worldwide", type: "NGO" },
  { id: "o4", name: "Alkemio BV", avatar: "", tagline: "Open innovation platform for collaboration", type: "Company" },
  { id: "o5", name: "EcoDesign Partners", avatar: "", tagline: "Sustainable architecture and product design", type: "Consultancy" },
];

// ── Search helper: simple keyword match (OR logic for broader discovery) ──
function matchesTags(text: string, tags: string[]): boolean {
  if (tags.length === 0) return false;
  const lower = text.toLowerCase();
  return tags.some((tag) => lower.includes(tag.toLowerCase()));
}

export interface SearchResults {
  spaces: SpaceCardData[];
  posts: SearchPostResult[];
  responses: SearchResponseResult[];
  users: SearchUserResult[];
  organizations: SearchOrgResult[];
}

export function performSearch(
  tags: string[],
  scope: "all" | string, // "all" or a space slug
): SearchResults {
  if (tags.length === 0) {
    return { spaces: [], posts: [], responses: [], users: [], organizations: [] };
  }

  const scopeFilter = (spaceSlug: string) => scope === "all" || spaceSlug === scope;

  const spaces = MOCK_SPACES.filter(
    (s) =>
      matchesTags(`${s.name} ${s.description} ${s.tags.join(" ")}`, tags) &&
      (scope === "all" || s.slug === scope || s.parent?.slug === scope),
  );

  const posts = MOCK_POSTS.filter(
    (p) =>
      matchesTags(`${p.title} ${p.snippet} ${p.author.name} ${p.spaceName}`, tags) &&
      scopeFilter(p.spaceSlug),
  );

  const responses = MOCK_RESPONSES.filter(
    (r) =>
      matchesTags(`${r.title} ${r.snippet} ${r.author.name} ${r.parentPostTitle} ${r.spaceName}`, tags) &&
      scopeFilter(r.spaceSlug),
  );

  const users = MOCK_USERS.filter((u) =>
    matchesTags(`${u.name} ${u.email} ${u.role}`, tags),
  );

  const organizations = MOCK_ORGS.filter((o) =>
    matchesTags(`${o.name} ${o.tagline} ${o.type}`, tags),
  );

  return { spaces, posts, responses, users, organizations };
}
