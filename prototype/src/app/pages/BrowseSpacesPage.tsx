import { useState, useMemo, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  FolderOpen,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  SpaceCard,
  SpaceCardSkeleton,
  type SpaceCardData,
} from "@/app/components/space/SpaceCard";
import { useLanguage } from "@/app/contexts/LanguageContext";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const LEAD_AVATARS = {
  sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  david: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  emily: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  james: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  anna: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  robert: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  maria: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  tom: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  nina: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
  lucas: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
};

const ALL_SPACES: SpaceCardData[] = [
  // ── Top-level Spaces ──
  {
    id: "s1",
    slug: "green-energy",
    name: "Green Energy Space",
    description:
      "A collaborative space for exploring emerging technologies and building innovative prototypes that address real-world challenges.",
    bannerImage:
      "https://images.unsplash.com/photo-1684907110935-dcb64eba6add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwdGVjaG5vbG9neSUyMGxhYiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzA3MjcwMDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "GE",
    avatarColor: "#2563eb",
    isPrivate: false,
    tags: ["Innovation", "Technology", "Prototyping"],
    memberCount: 128,
    leads: [
      { name: "Sarah Chen", avatar: LEAD_AVATARS.sarah, type: "person" },
      { name: "TechBridge Foundation", avatar: "", type: "org" },
      { name: "David Kim", avatar: LEAD_AVATARS.david, type: "person" },
    ],
  },
  {
    id: "s2",
    slug: "sustainable-futures",
    name: "Sustainable Futures",
    description:
      "Driving the transition to a sustainable economy through renewable energy solutions and circular business models.",
    bannerImage:
      "https://images.unsplash.com/photo-1616745207210-a98414926a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGVuZXJneSUyMHNvbGFyJTIwcGFuZWxzfGVufDF8fHx8MTc3MDYzOTE2MHww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SF",
    avatarColor: "#16a34a",
    isPrivate: false,
    tags: ["Sustainability", "Energy", "Climate"],
    memberCount: 94,
    leads: [
      { name: "Emily Davis", avatar: LEAD_AVATARS.emily, type: "person" },
      { name: "Green Future Org", avatar: "", type: "org" },
    ],
  },
  {
    id: "s3",
    slug: "community-building",
    name: "Community Building Lab",
    description:
      "Developing best practices for community engagement, participatory design, and inclusive collaboration methodologies.",
    bannerImage:
      "https://images.unsplash.com/photo-1758522275070-54e28abecf56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjb2xsYWJvcmF0aW9uJTIwd29ya3Nob3B8ZW58MXx8fHwxNzcwNzI3MDA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "CB",
    avatarColor: "#9333ea",
    isPrivate: false,
    tags: ["Community", "Engagement", "Design"],
    memberCount: 76,
    leads: [
      { name: "Anna Martinez", avatar: LEAD_AVATARS.anna, type: "person" },
      { name: "Local Council", avatar: "", type: "org" },
      { name: "James Wilson", avatar: LEAD_AVATARS.james, type: "person" },
    ],
  },
  {
    id: "s4",
    slug: "urban-development",
    name: "Urban Development Network",
    description:
      "Reimagining urban spaces through smart city planning, green infrastructure, and citizen-centered design approaches.",
    bannerImage:
      "https://images.unsplash.com/photo-1550837725-7998bc8efdb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGNpdHklMjBwbGFubmluZyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzA3MjcwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "UD",
    avatarColor: "#0891b2",
    isPrivate: false,
    tags: ["Urban", "Planning", "Smart Cities"],
    memberCount: 63,
    leads: [
      { name: "Robert Fox", avatar: LEAD_AVATARS.robert, type: "person" },
      { name: "City Planning Dept", avatar: "", type: "org" },
    ],
  },
  {
    id: "s5",
    slug: "education-transformation",
    name: "Education Transformation",
    description:
      "Rethinking education models for the 21st century with technology-enhanced learning and skills-based curricula.",
    bannerImage:
      "https://images.unsplash.com/photo-1759922378123-a1f4f1e39bae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBsZWFybmluZyUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzA3MjA2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "ET",
    avatarColor: "#ea580c",
    isPrivate: true,
    tags: ["Education", "Learning", "EdTech"],
    memberCount: 41,
    leads: [
      { name: "Maria Jansen", avatar: LEAD_AVATARS.maria, type: "person" },
    ],
  },
  {
    id: "s6",
    slug: "health-innovation",
    name: "Health Innovation Alliance",
    description:
      "Connecting healthcare professionals, researchers, and technologists to advance digital health and patient care.",
    bannerImage:
      "https://images.unsplash.com/photo-1765294064316-6c72add9e9e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMHJlc2VhcmNofGVufDF8fHx8MTc3MDcwNzAzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "HI",
    avatarColor: "#dc2626",
    isPrivate: true,
    tags: ["Health", "MedTech", "Research"],
    memberCount: 58,
    leads: [
      { name: "Tom Bakker", avatar: LEAD_AVATARS.tom, type: "person" },
      { name: "Philips Health", avatar: "", type: "org" },
      { name: "Nina van Dijk", avatar: LEAD_AVATARS.nina, type: "person" },
    ],
  },
  {
    id: "s7",
    slug: "data-driven-impact",
    name: "Data-Driven Impact",
    description:
      "Leveraging data science and analytics to measure, optimize, and scale social and environmental impact programs.",
    bannerImage:
      "https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkJTIwc2NyZWVufGVufDF8fHx8MTc3MDY4MzY0NHww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "DD",
    avatarColor: "#4f46e5",
    isPrivate: false,
    tags: ["Data", "Analytics", "Impact"],
    memberCount: 35,
    leads: [
      { name: "Lucas de Boer", avatar: LEAD_AVATARS.lucas, type: "person" },
    ],
  },
  {
    id: "s8",
    slug: "social-entrepreneurship",
    name: "Social Entrepreneurship Hub",
    description:
      "Supporting social entrepreneurs with mentoring, funding, and a vibrant network to scale purpose-driven ventures.",
    bannerImage:
      "https://images.unsplash.com/photo-1758599668178-d9716bbda9d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBpbXBhY3QlMjB2b2x1bnRlZXJpbmd8ZW58MXx8fHwxNzcwNzI3MDA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SE",
    avatarColor: "#c026d3",
    isPrivate: false,
    tags: ["Social Impact", "Startups", "Mentoring"],
    memberCount: 89,
    leads: [
      { name: "Emily Davis", avatar: LEAD_AVATARS.emily, type: "person" },
      { name: "Impact Foundation", avatar: "", type: "org" },
      { name: "David Kim", avatar: LEAD_AVATARS.david, type: "person" },
      { name: "Anna Martinez", avatar: LEAD_AVATARS.anna, type: "person" },
      { name: "Robert Fox", avatar: LEAD_AVATARS.robert, type: "person" },
    ],
  },
  {
    id: "s9",
    slug: "circular-economy",
    name: "Circular Economy Collective",
    description:
      "Designing products, services, and systems that eliminate waste and keep resources in circulation.",
    bannerImage:
      "https://images.unsplash.com/photo-1666804830091-56ba0e22becf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXJjdWxhciUyMGVjb25vbXklMjByZWN5Y2xpbmd8ZW58MXx8fHwxNzcwNzI3MDEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "CE",
    avatarColor: "#059669",
    isPrivate: false,
    tags: ["Circular", "Waste", "Design"],
    memberCount: 52,
    leads: [
      { name: "Sarah Chen", avatar: LEAD_AVATARS.sarah, type: "person" },
      { name: "Green Future Org", avatar: "", type: "org" },
    ],
  },
  {
    id: "s10",
    slug: "future-mobility",
    name: "Future Mobility",
    description:
      "Exploring autonomous vehicles, electric transport, and smart infrastructure for the cities of tomorrow.",
    bannerImage:
      "https://images.unsplash.com/photo-1759156255498-83aa3f0875ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFuc3BvcnQlMjBsb2dpc3RpY3MlMjBtb2JpbGl0eXxlbnwxfHx8fDE3NzA3MjcwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "FM",
    avatarColor: "#0d9488",
    isPrivate: true,
    tags: ["Mobility", "EV", "Infrastructure"],
    memberCount: 47,
    leads: [
      { name: "Tom Bakker", avatar: LEAD_AVATARS.tom, type: "person" },
      { name: "NS Railways", avatar: "", type: "org" },
    ],
  },

  // ── Subspaces (children of top-level) ──
  {
    id: "s11",
    slug: "renewable-energy-transition",
    name: "Renewable Energy Transition",
    description:
      "Developing strategies for municipal energy transition to 100% renewables by 2030.",
    bannerImage:
      "https://images.unsplash.com/photo-1716311778185-93ce152413e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwdHVyYmluZXMlMjByZW5ld2FibGUlMjBwb3dlcnxlbnwxfHx8fDE3NzA3MjcwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "RE",
    avatarColor: "#22c55e",
    isPrivate: false,
    tags: ["Wind", "Solar", "Transition"],
    memberCount: 24,
    leads: [
      { name: "Emily Davis", avatar: LEAD_AVATARS.emily, type: "person" },
      { name: "Eneco", avatar: "", type: "org" },
    ],
    parent: {
      name: "Sustainable Futures",
      slug: "sustainable-futures",
      initials: "SF",
      avatarColor: "#16a34a",
    },
  },
  {
    id: "s12",
    slug: "smart-cities-lab",
    name: "Smart Cities Lab",
    description:
      "Applying IoT, AI, and data analytics to create intelligent urban environments that improve quality of life.",
    bannerImage:
      "https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNpdHklMjBJb1QlMjBjb25uZWN0ZWR8ZW58MXx8fHwxNzcwNzI3MDExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SC",
    avatarColor: "#0ea5e9",
    isPrivate: false,
    tags: ["IoT", "AI", "Urban Tech"],
    memberCount: 31,
    leads: [
      { name: "Robert Fox", avatar: LEAD_AVATARS.robert, type: "person" },
      { name: "Municipality Amsterdam", avatar: "", type: "org" },
    ],
    parent: {
      name: "Urban Development Network",
      slug: "urban-development",
      initials: "UD",
      avatarColor: "#0891b2",
    },
  },
  {
    id: "s13",
    slug: "digital-health-tools",
    name: "Digital Health Tools",
    description:
      "Building and evaluating digital tools for remote patient monitoring, telemedicine, and wellness tracking.",
    bannerImage:
      "https://images.unsplash.com/photo-1763568258533-d0597f86ce62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb24lMjBhdXRvbWF0aW9ufGVufDF8fHx8MTc3MDcyNzAxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "DH",
    avatarColor: "#ef4444",
    isPrivate: true,
    tags: ["Telemedicine", "Wellness", "Digital"],
    memberCount: 19,
    leads: [
      { name: "Nina van Dijk", avatar: LEAD_AVATARS.nina, type: "person" },
    ],
    parent: {
      name: "Health Innovation Alliance",
      slug: "health-innovation",
      initials: "HI",
      avatarColor: "#dc2626",
    },
  },
  {
    id: "s14",
    slug: "agritech-innovation",
    name: "AgriTech Innovation",
    description:
      "Advancing sustainable agriculture through precision farming, vertical gardens, and food system redesign.",
    bannerImage:
      "https://images.unsplash.com/photo-1759509295194-e85b92b24e15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZvb2QlMjBzdXN0YWluYWJsZSUyMGZhcm1pbmd8ZW58MXx8fHwxNzcwNzI3MDEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "AT",
    avatarColor: "#65a30d",
    isPrivate: false,
    tags: ["Agriculture", "Food", "Farming"],
    memberCount: 28,
    leads: [
      { name: "James Wilson", avatar: LEAD_AVATARS.james, type: "person" },
      { name: "WUR Research", avatar: "", type: "org" },
    ],
    parent: {
      name: "Sustainable Futures",
      slug: "sustainable-futures",
      initials: "SF",
      avatarColor: "#16a34a",
    },
  },
  {
    id: "s15",
    slug: "design-thinking-practice",
    name: "Design Thinking Practice",
    description:
      "Sharing frameworks, case studies, and tools for human-centered design in complex systems.",
    bannerImage:
      "https://images.unsplash.com/photo-1760446410593-0710fb22cafc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB0aGlua2luZyUyMGNyZWF0aXZlJTIwcHJvdG90eXBpbmd8ZW58MXx8fHwxNzcwNzI3MDEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "DT",
    avatarColor: "#a855f7",
    isPrivate: false,
    tags: ["Design", "HCD", "Frameworks"],
    memberCount: 45,
    leads: [
      { name: "Anna Martinez", avatar: LEAD_AVATARS.anna, type: "person" },
      { name: "Maria Jansen", avatar: LEAD_AVATARS.maria, type: "person" },
    ],
    parent: {
      name: "Green Energy Space",
      slug: "green-energy",
      initials: "GE",
      avatarColor: "#2563eb",
    },
  },
  {
    id: "s16",
    slug: "ocean-research",
    name: "Ocean & Marine Research",
    description:
      "Collaborative research on ocean health, marine biodiversity, and sustainable blue economy initiatives.",
    bannerImage:
      "https://images.unsplash.com/photo-1761888112884-701d7a33ec88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMG1hcmluZSUyMHJlc2VhcmNoJTIwc2NpZW5jZXxlbnwxfHx8fDE3NzA3MjcwMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "OM",
    avatarColor: "#0369a1",
    isPrivate: false,
    tags: ["Ocean", "Marine", "Biodiversity"],
    memberCount: 22,
    leads: [
      { name: "Lucas de Boer", avatar: LEAD_AVATARS.lucas, type: "person" },
    ],
  },
  {
    id: "s17",
    slug: "ai-robotics",
    name: "AI & Robotics Forum",
    description:
      "Exploring the ethical, practical, and technical dimensions of artificial intelligence and robotics in society.",
    bannerImage:
      "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdGljcyUyMGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2V8ZW58MXx8fHwxNzcwNzI3MDEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "AR",
    avatarColor: "#6366f1",
    isPrivate: true,
    tags: ["AI", "Robotics", "Ethics"],
    memberCount: 37,
    leads: [
      { name: "David Kim", avatar: LEAD_AVATARS.david, type: "person" },
      { name: "TU Delft", avatar: "", type: "org" },
      { name: "Sarah Chen", avatar: LEAD_AVATARS.sarah, type: "person" },
    ],
    parent: {
      name: "Green Energy Space",
      slug: "green-energy",
      initials: "GE",
      avatarColor: "#2563eb",
    },
  },
  {
    id: "s18",
    slug: "climate-action",
    name: "Climate Action Network",
    description:
      "Coordinating climate adaptation and mitigation strategies across sectors, regions, and communities.",
    bannerImage:
      "https://images.unsplash.com/photo-1617419792679-31a4e9c22097?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwYWN0aW9uJTIwZW52aXJvbm1lbnQlMjBncmVlbnxlbnwxfHx8fDE3NzA3MjcwMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "CA",
    avatarColor: "#15803d",
    isPrivate: false,
    tags: ["Climate", "Adaptation", "Policy"],
    memberCount: 71,
    leads: [
      { name: "Emily Davis", avatar: LEAD_AVATARS.emily, type: "person" },
      { name: "Green Future Org", avatar: "", type: "org" },
      { name: "Tom Bakker", avatar: LEAD_AVATARS.tom, type: "person" },
    ],
  },
  {
    id: "s19",
    slug: "startup-incubator",
    name: "Startup Incubator",
    description:
      "An intensive program for early-stage ventures with access to mentorship, workspace, and seed funding.",
    bannerImage:
      "https://images.unsplash.com/photo-1758873271857-c42a7ef7d692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwZW50cmVwcmVuZXVyc2hpcCUyMHRlYW18ZW58MXx8fHwxNzcwNzI3MDA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SI",
    avatarColor: "#e11d48",
    isPrivate: true,
    tags: ["Startups", "Funding", "Incubation"],
    memberCount: 33,
    leads: [
      { name: "James Wilson", avatar: LEAD_AVATARS.james, type: "person" },
      { name: "Robert Fox", avatar: LEAD_AVATARS.robert, type: "person" },
    ],
    parent: {
      name: "Social Entrepreneurship Hub",
      slug: "social-entrepreneurship",
      initials: "SE",
      avatarColor: "#c026d3",
    },
  },
  {
    id: "s20",
    slug: "nature-biodiversity",
    name: "Nature & Biodiversity",
    description:
      "Protecting and restoring natural ecosystems through citizen science, conservation tech, and policy advocacy.",
    bannerImage:
      "https://images.unsplash.com/photo-1767892643673-f1976b3123fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBjb25zZXJ2YXRpb24lMjBiaW9kaXZlcnNpdHl8ZW58MXx8fHwxNzcwNjE5NjgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "NB",
    avatarColor: "#166534",
    isPrivate: false,
    tags: ["Nature", "Conservation", "Science"],
    memberCount: 56,
    leads: [
      { name: "Lucas de Boer", avatar: LEAD_AVATARS.lucas, type: "person" },
      { name: "Anna Martinez", avatar: LEAD_AVATARS.anna, type: "person" },
    ],
  },
  {
    id: "s21",
    slug: "coworking-network",
    name: "Coworking & Spaces Network",
    description:
      "Connecting coworking space operators and remote workers to share best practices and build community.",
    bannerImage:
      "https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBtb2Rlcm4lMjBvZmZpY2UlMjBzcGFjZXxlbnwxfHx8fDE3NzA3MjcwMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "CN",
    avatarColor: "#d97706",
    isPrivate: false,
    tags: ["Coworking", "Remote", "Community"],
    memberCount: 39,
    leads: [
      { name: "Maria Jansen", avatar: LEAD_AVATARS.maria, type: "person" },
    ],
  },
  {
    id: "s22",
    slug: "water-infrastructure",
    name: "Water & Infrastructure",
    description:
      "Developing resilient water management systems and climate-adaptive infrastructure for Dutch water challenges.",
    bannerImage:
      "https://images.unsplash.com/photo-1665590883306-3830f79e6961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHRyZWF0bWVudCUyMGluZnJhc3RydWN0dXJlfGVufDF8fHx8MTc3MDcyNzAxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "WI",
    avatarColor: "#0284c7",
    isPrivate: false,
    tags: ["Water", "Infrastructure", "Climate"],
    memberCount: 29,
    leads: [
      { name: "Tom Bakker", avatar: LEAD_AVATARS.tom, type: "person" },
      { name: "Rijkswaterstaat", avatar: "", type: "org" },
    ],
    parent: {
      name: "Urban Development Network",
      slug: "urban-development",
      initials: "UD",
      avatarColor: "#0891b2",
    },
  },
  {
    id: "s23",
    slug: "cultural-heritage-digital",
    name: "Cultural Heritage & Digital",
    description:
      "Using digital technologies to preserve, share, and reimagine cultural heritage for future generations.",
    bannerImage:
      "https://images.unsplash.com/photo-1758186169566-33d86f4f7737?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGhlcml0YWdlJTIwbXVzZXVtJTIwYXJ0fGVufDF8fHx8MTc3MDcyNzAxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "CH",
    avatarColor: "#b45309",
    isPrivate: false,
    tags: ["Heritage", "Digital", "Culture"],
    memberCount: 18,
    leads: [
      { name: "Nina van Dijk", avatar: LEAD_AVATARS.nina, type: "person" },
    ],
  },
  {
    id: "s24",
    slug: "cybersecurity-trust",
    name: "Cybersecurity & Trust",
    description:
      "Building secure digital infrastructure and fostering trust through responsible data governance practices.",
    bannerImage:
      "https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGlnaXRhbCUyMHNhZmV0eXxlbnwxfHx8fDE3NzA3MjcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "CT",
    avatarColor: "#64748b",
    isPrivate: true,
    tags: ["Security", "Privacy", "Governance"],
    memberCount: 26,
    leads: [
      { name: "David Kim", avatar: LEAD_AVATARS.david, type: "person" },
      { name: "TNO", avatar: "", type: "org" },
    ],
    parent: {
      name: "Data-Driven Impact",
      slug: "data-driven-impact",
      initials: "DD",
      avatarColor: "#4f46e5",
    },
  },
  {
    id: "s25",
    slug: "ev-charging-network",
    name: "EV Charging Network",
    description:
      "Accelerating the rollout of electric vehicle charging infrastructure across the Netherlands and Europe.",
    bannerImage:
      "https://images.unsplash.com/photo-1672542128826-5f0d578713d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb258ZW58MXx8fHwxNzcwNjUzNTY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "EV",
    avatarColor: "#0d9488",
    isPrivate: false,
    tags: ["EV", "Charging", "Clean Energy"],
    memberCount: 43,
    leads: [
      { name: "Robert Fox", avatar: LEAD_AVATARS.robert, type: "person" },
      { name: "Shell Ventures", avatar: "", type: "org" },
      { name: "Emily Davis", avatar: LEAD_AVATARS.emily, type: "person" },
    ],
    parent: {
      name: "Future Mobility",
      slug: "future-mobility",
      initials: "FM",
      avatarColor: "#0d9488",
    },
  },
];

const BATCH_SIZE = 12;

type SortOption = "recent" | "alpha" | "members" | "active";
type PrivacyFilter = "all" | "public" | "private";
type TypeFilter = "all" | "spaces" | "subspaces";

// ─── Component ───────────────────────────────────────────────────────────────

export default function BrowseSpacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter + search + sort
  const filteredSpaces = useMemo(() => {
    let result = [...ALL_SPACES];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Privacy filter
    if (privacyFilter === "public") result = result.filter((s) => !s.isPrivate);
    if (privacyFilter === "private") result = result.filter((s) => s.isPrivate);

    // Type filter
    if (typeFilter === "spaces") result = result.filter((s) => !s.parent);
    if (typeFilter === "subspaces") result = result.filter((s) => !!s.parent);

    // Sort
    switch (sortBy) {
      case "alpha":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "members":
        result.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case "active":
        // Simulate: higher member count = more active
        result.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case "recent":
      default:
        // Keep original order (simulates recency)
        break;
    }

    return result;
  }, [searchQuery, sortBy, privacyFilter, typeFilter]);

  const displayedSpaces = filteredSpaces.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSpaces.length;
  const activeFilterCount =
    (privacyFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    // Simulate network delay
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 600);
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setPrivacyFilter("all");
    setTypeFilter("all");
    setSortBy("recent");
  };

  const { t } = useLanguage();

  return (
    <div
      className="flex flex-col w-full max-w-[1600px] mx-auto"
      style={{ padding: "0 24px 48px", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ─── Page Header ───────────────────────────────────────────────── */}
      <div style={{ padding: "32px 0 24px" }}>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--foreground)",
            lineHeight: 1.2,
          }}
        >
          {t("spaces.title")}
        </h1>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
            marginTop: 6,
            maxWidth: 560,
            lineHeight: 1.5,
          }}
        >
          {t("spaces.subtitle")}
        </p>
      </div>

      {/* ─── Search & Filter Bar ──────────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row gap-3"
        style={{ marginBottom: 24 }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: 14,
              width: 16,
              height: 16,
              color: "var(--muted-foreground)",
            }}
          />
          <Input
            placeholder={t("spaces.search")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(BATCH_SIZE);
            }}
            style={{
              paddingLeft: 40,
              height: 40,
              fontSize: "var(--text-sm)",
              background: "var(--input-background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--foreground)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setVisibleCount(BATCH_SIZE);
              }}
              className="absolute top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
              style={{ right: 10, color: "var(--muted-foreground)" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger
            className="gap-2"
            style={{
              width: "auto",
              minWidth: 160,
              height: 40,
              fontSize: "var(--text-sm)",
              background: "var(--input-background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <ArrowUpDown style={{ width: 14, height: 14, color: "var(--muted-foreground)" }} />
            <SelectValue placeholder={t("spaces.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
            <SelectItem value="members">Most Members</SelectItem>
            <SelectItem value="active">Most Active</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2"
              style={{
                height: 40,
                fontSize: "var(--text-sm)",
                borderRadius: "var(--radius)",
                color: activeFilterCount > 0 ? "var(--primary)" : "var(--foreground)",
                borderColor: activeFilterCount > 0 ? "var(--primary)" : "var(--border)",
              }}
            >
              <SlidersHorizontal style={{ width: 14, height: 14 }} />
              {t("spaces.filters")}
              {activeFilterCount > 0 && (
                <Badge
                  style={{
                    fontSize: "10px",
                    padding: "0 5px",
                    height: 18,
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    borderRadius: "999px",
                    marginLeft: 2,
                  }}
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
            <DropdownMenuLabel
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted-foreground)",
              }}
            >
              Privacy
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === "all"}
              onCheckedChange={() => setPrivacyFilter("all")}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === "public"}
              onCheckedChange={() => setPrivacyFilter("public")}
            >
              Public only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === "private"}
              onCheckedChange={() => setPrivacyFilter("private")}
            >
              Private only
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted-foreground)",
              }}
            >
              Type
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={typeFilter === "all"}
              onCheckedChange={() => setTypeFilter("all")}
            >
              All types
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === "spaces"}
              onCheckedChange={() => setTypeFilter("spaces")}
            >
              Spaces only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === "subspaces"}
              onCheckedChange={() => setTypeFilter("subspaces")}
            >
              Subspaces only
            </DropdownMenuCheckboxItem>
            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div style={{ padding: "4px 8px" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full justify-start gap-2"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--destructive)",
                      height: 32,
                    }}
                  >
                    <X style={{ width: 12, height: 12 }} />
                    {t("spaces.clearFilters")}
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter chips */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 16 }}>
          {searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
              onClick={() => setSearchQuery("")}
            >
              Search: &quot;{searchQuery}&quot;
              <X style={{ width: 10, height: 10 }} />
            </Badge>
          )}
          {privacyFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
              onClick={() => setPrivacyFilter("all")}
            >
              {privacyFilter === "public" ? "Public" : "Private"}
              <X style={{ width: 10, height: 10 }} />
            </Badge>
          )}
          {typeFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
              onClick={() => setTypeFilter("all")}
            >
              {typeFilter === "spaces" ? "Spaces only" : "Subspaces only"}
              <X style={{ width: 10, height: 10 }} />
            </Badge>
          )}
        </div>
      )}

      {/* ─── Results count ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 16 }}
      >
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
          }}
        >
          {t("spaces.showing")}{" "}
          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
            {displayedSpaces.length}
          </span>{" "}
          {t("spaces.of")}{" "}
          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
            {filteredSpaces.length}
          </span>{" "}
          {t("spaces.spaces")}
        </p>
      </div>

      {/* ─── Space Card Grid ──────────────────────────────────────────── */}
      {displayedSpaces.length > 0 ? (
        <>
          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {displayedSpaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}

            {/* Skeleton cards while loading more */}
            {isLoadingMore &&
              Array.from({ length: Math.min(BATCH_SIZE, filteredSpaces.length - visibleCount) }).map(
                (_, i) => <SpaceCardSkeleton key={`skel-${i}`} />
              )}
          </div>

          {/* ─── Load More ────────────────────────────────────────────── */}
          {hasMore && !isLoadingMore && (
            <div
              className="flex flex-col items-center"
              style={{ marginTop: 32 }}
            >
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="gap-2"
                style={{
                  height: 40,
                  paddingLeft: 24,
                  paddingRight: 24,
                  fontSize: "var(--text-sm)",
                  borderRadius: "var(--radius)",
                  fontWeight: 500,
                }}
              >
                <ChevronDown style={{ width: 16, height: 16 }} />
                {t("spaces.loadMore")}
              </Button>
            </div>
          )}
        </>
      ) : (
        /* ─── Empty State ────────────────────────────────────────────── */
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            padding: "64px 24px",
            border: "1px dashed var(--border)",
            borderRadius: "calc(var(--radius) + 4px)",
            background: "var(--muted)",
          }}
        >
          <FolderOpen
            style={{
              width: 40,
              height: 40,
              color: "var(--muted-foreground)",
              opacity: 0.5,
              marginBottom: 12,
            }}
          />
          <h3
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            {t("spaces.noResults")}
          </h3>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              maxWidth: 360,
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {t("spaces.noResultsDesc")}
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2"
            style={{ fontSize: "var(--text-sm)" }}
          >
            <X style={{ width: 14, height: 14 }} />
            {t("spaces.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}