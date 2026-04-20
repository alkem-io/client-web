export type MembershipRole = "Admin" | "Lead" | "Member";

export interface MembershipItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  isPrivate: boolean;
  role: MembershipRole;
  initials: string;
  color: string;
  type: "space" | "subspace";
  parentId?: string;
  parentName?: string;
  image?: string;
}

const colors = [
  "#1d384a",
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#db2777",
];

const c = (i: number) => colors[i % colors.length];

export const MOCK_MEMBERSHIPS: MembershipItem[] = [
  {
    id: "s1",
    type: "space",
    name: "Innovation Lab",
    slug: "innovation-lab",
    tagline: "Central hub for innovation initiatives and rapid experiments.",
    isPrivate: true,
    role: "Lead",
    initials: "IL",
    color: c(0),
    image: "https://images.unsplash.com/photo-1623652554515-91c833e3080e?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s1-sub-1",
    type: "subspace",
    parentId: "s1",
    parentName: "Innovation Lab",
    name: "Q1 Experiments",
    slug: "q1-experiments",
    isPrivate: true,
    role: "Lead",
    initials: "Q1",
    color: c(0),
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s1-sub-2",
    type: "subspace",
    parentId: "s1",
    parentName: "Innovation Lab",
    name: "Idea Repository",
    slug: "idea-repository",
    isPrivate: false,
    role: "Member",
    initials: "IR",
    color: c(0),
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s2",
    type: "space",
    name: "Design Workshop",
    slug: "design-workshop",
    tagline: "Design critiques, assets, and product exploration.",
    isPrivate: false,
    role: "Admin",
    initials: "DW",
    color: c(1),
    image: "https://images.unsplash.com/photo-1735639013995-086e648eaa38?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s3",
    type: "space",
    name: "Team Sync",
    slug: "team-sync",
    tagline: "Weekly alignment and delivery planning for the core team.",
    isPrivate: true,
    role: "Member",
    initials: "TS",
    color: c(2),
    image: "https://images.unsplash.com/photo-1768659347532-74d3b1efb0ae?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s3-sub-1",
    type: "subspace",
    parentId: "s3",
    parentName: "Team Sync",
    name: "Daily Standup",
    slug: "daily-standup",
    isPrivate: true,
    role: "Member",
    initials: "DS",
    color: c(2),
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s4",
    type: "space",
    name: "Future Strategy",
    slug: "future-strategy",
    tagline: "Long-range planning and roadmap discussions.",
    isPrivate: false,
    role: "Member",
    initials: "FS",
    color: c(3),
    image: "https://images.unsplash.com/photo-1676276376052-dc9c9c0b6917?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s4-sub-1",
    type: "subspace",
    parentId: "s4",
    parentName: "Future Strategy",
    name: "Market Research",
    slug: "market-research",
    isPrivate: false,
    role: "Member",
    initials: "MR",
    color: c(3),
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s4-sub-2",
    type: "subspace",
    parentId: "s4",
    parentName: "Future Strategy",
    name: "2026 Roadmap",
    slug: "2026-roadmap",
    isPrivate: false,
    role: "Member",
    initials: "26",
    color: c(3),
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s5",
    type: "space",
    name: "Community Events",
    slug: "community-events",
    tagline: "Planning meetups, webinars, and community activity.",
    isPrivate: true,
    role: "Lead",
    initials: "CE",
    color: c(4),
    image: "https://images.unsplash.com/photo-1768776179834-93e6cafc6d97?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "s6",
    type: "space",
    name: "Platform Management",
    slug: "platform-management",
    tagline: "Templates, governance, and platform operations.",
    isPrivate: true,
    role: "Admin",
    initials: "PM",
    color: c(5),
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
  },
];
