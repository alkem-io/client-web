// ─── Mock Data for Unified Messaging System ──────────────────────────────────

export type ConversationType = "dm" | "group" | "space";

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  status: "online" | "offline" | "busy";
}

export interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean; // whether current user reacted
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderInitials: string;
  content: string;
  timestamp: string; // ISO string
  timeLabel: string;
  dateLabel: string;
  isOwn: boolean;
  isEdited?: boolean;
  replyTo?: { senderName: string; content: string };
  reactions?: Reaction[];
  attachment?: {
    type: "image" | "document" | "audio";
    name: string;
    size: string;
    url: string;
  };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string;
  initials: string;
  avatarColor?: string;
  lastMessage: string;
  lastMessageSender?: string;
  timeLabel: string;
  unread: number;
  muted: boolean;
  members?: UserInfo[];
  memberCount?: number;
  // For space channels
  spaceSlug?: string;
  isOnline?: boolean;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const USERS: Record<string, UserInfo> = {
  me: {
    id: "me",
    name: "Alex Contributor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    initials: "AC",
    status: "online",
  },
  sarah: {
    id: "sarah",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    initials: "SC",
    status: "online",
  },
  marc: {
    id: "marc",
    name: "Marc Johnson",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150",
    initials: "MJ",
    status: "offline",
  },
  david: {
    id: "david",
    name: "David Smith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    initials: "DS",
    status: "busy",
  },
  emily: {
    id: "emily",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    initials: "ER",
    status: "online",
  },
  nina: {
    id: "nina",
    name: "Nina Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    initials: "NP",
    status: "offline",
  },
  tom: {
    id: "tom",
    name: "Tom de Vries",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    initials: "TV",
    status: "online",
  },
};

// ─── Conversations ───────────────────────────────────────────────────────────

export const CONVERSATIONS: Conversation[] = [
  {
    id: "dm-sarah",
    type: "dm",
    name: "Sarah Chen",
    avatar: USERS.sarah.avatar,
    initials: "SC",
    lastMessage: "Can we review the Q1 goals?",
    timeLabel: "2m",
    unread: 2,
    muted: false,
    isOnline: true,
    members: [USERS.sarah],
  },
  {
    id: "space-innovation",
    type: "space",
    name: "Green Energy Space",
    avatar: "",
    initials: "GE",
    avatarColor: "#2563eb",
    lastMessage: "Emily: I've shared the updated roadmap with the team",
    lastMessageSender: "Emily Rodriguez",
    timeLabel: "15m",
    unread: 5,
    muted: false,
    memberCount: 29,
    spaceSlug: "green-energy",
  },
  {
    id: "group-workshop",
    type: "group",
    name: "Workshop Planning",
    avatar: "",
    initials: "WP",
    avatarColor: "#8b5cf6",
    lastMessage: "Marc: I'll book the room for Thursday",
    lastMessageSender: "Marc Johnson",
    timeLabel: "45m",
    unread: 0,
    muted: false,
    memberCount: 4,
    members: [USERS.sarah, USERS.marc, USERS.emily],
  },
  {
    id: "dm-marc",
    type: "dm",
    name: "Marc Johnson",
    avatar: USERS.marc.avatar,
    initials: "MJ",
    lastMessage: "Thanks for the update!",
    timeLabel: "1h",
    unread: 0,
    muted: false,
    isOnline: false,
    members: [USERS.marc],
  },
  {
    id: "space-climate",
    type: "space",
    name: "Climate Action NL",
    avatar: "",
    initials: "CA",
    avatarColor: "#059669",
    lastMessage: "Tom: The new policy brief is ready for review",
    lastMessageSender: "Tom de Vries",
    timeLabel: "2h",
    unread: 0,
    muted: false,
    memberCount: 24,
    spaceSlug: "community-garden",
  },
  {
    id: "group-leads",
    type: "group",
    name: "Portfolio Leads",
    avatar: "",
    initials: "PL",
    avatarColor: "#dc2626",
    lastMessage: "Nina: Q2 budget proposal attached",
    lastMessageSender: "Nina Patel",
    timeLabel: "3h",
    unread: 1,
    muted: false,
    memberCount: 3,
    members: [USERS.nina, USERS.david],
  },
  {
    id: "dm-david",
    type: "dm",
    name: "David Smith",
    avatar: USERS.david.avatar,
    initials: "DS",
    lastMessage: "See you at the meeting tomorrow.",
    timeLabel: "1d",
    unread: 0,
    muted: true,
    isOnline: false,
    members: [USERS.david],
  },
  {
    id: "dm-emily",
    type: "dm",
    name: "Emily Rodriguez",
    avatar: USERS.emily.avatar,
    initials: "ER",
    lastMessage: "Great work on the presentation!",
    timeLabel: "2d",
    unread: 0,
    muted: false,
    isOnline: true,
    members: [USERS.emily],
  },
];

// ─── Messages per conversation ───────────────────────────────────────────────

export const MESSAGES: Record<string, Message[]> = {
  "dm-sarah": [
    {
      id: "s1",
      senderId: "sarah",
      senderName: "Sarah Chen",
      senderAvatar: USERS.sarah.avatar,
      senderInitials: "SC",
      content: "Hey Alex! Do you have a minute to chat about the Q1 goals?",
      timestamp: "2026-02-12T10:30:00",
      timeLabel: "10:30 AM",
      dateLabel: "Today",
      isOwn: false,
    },
    {
      id: "s2",
      senderId: "me",
      senderName: "Alex Contributor",
      senderAvatar: USERS.me.avatar,
      senderInitials: "AC",
      content: "Sure, Sarah. What's on your mind?",
      timestamp: "2026-02-12T10:32:00",
      timeLabel: "10:32 AM",
      dateLabel: "Today",
      isOwn: true,
    },
    {
      id: "s3",
      senderId: "sarah",
      senderName: "Sarah Chen",
      senderAvatar: USERS.sarah.avatar,
      senderInitials: "SC",
      content: "I was thinking we should adjust the target for the Green Energy Space space. The current timeline seems a bit ambitious given the resource constraints we discussed last week.",
      timestamp: "2026-02-12T10:33:00",
      timeLabel: "10:33 AM",
      dateLabel: "Today",
      isOwn: false,
      reactions: [{ emoji: "👍", count: 1, reacted: true }],
    },
    {
      id: "s4",
      senderId: "me",
      senderName: "Alex Contributor",
      senderAvatar: USERS.me.avatar,
      senderInitials: "AC",
      content: "That's a fair point. Let me pull up the latest metrics and we can look at this together.",
      timestamp: "2026-02-12T10:35:00",
      timeLabel: "10:35 AM",
      dateLabel: "Today",
      isOwn: true,
      isEdited: true,
    },
    {
      id: "s5",
      senderId: "sarah",
      senderName: "Sarah Chen",
      senderAvatar: USERS.sarah.avatar,
      senderInitials: "SC",
      content: "Perfect! Also, can we loop in Emily? She has the breakdown from the last sprint.",
      timestamp: "2026-02-12T10:36:00",
      timeLabel: "10:36 AM",
      dateLabel: "Today",
      isOwn: false,
    },
    {
      id: "s6",
      senderId: "sarah",
      senderName: "Sarah Chen",
      senderAvatar: USERS.sarah.avatar,
      senderInitials: "SC",
      content: "Can we review the Q1 goals?",
      timestamp: "2026-02-12T10:38:00",
      timeLabel: "10:38 AM",
      dateLabel: "Today",
      isOwn: false,
    },
  ],

  "dm-marc": [
    {
      id: "m1",
      senderId: "me",
      senderName: "Alex Contributor",
      senderAvatar: USERS.me.avatar,
      senderInitials: "AC",
      content: "Hey Marc, just sent over the updated brief for the mobility project.",
      timestamp: "2026-02-12T09:15:00",
      timeLabel: "9:15 AM",
      dateLabel: "Today",
      isOwn: true,
    },
    {
      id: "m2",
      senderId: "marc",
      senderName: "Marc Johnson",
      senderAvatar: USERS.marc.avatar,
      senderInitials: "MJ",
      content: "Thanks for the update!",
      timestamp: "2026-02-12T09:22:00",
      timeLabel: "9:22 AM",
      dateLabel: "Today",
      isOwn: false,
      reactions: [{ emoji: "🙏", count: 1, reacted: false }],
    },
  ],

  "dm-david": [
    {
      id: "d1",
      senderId: "david",
      senderName: "David Smith",
      senderAvatar: USERS.david.avatar,
      senderInitials: "DS",
      content: "Hey, are you joining the stakeholder meeting tomorrow?",
      timestamp: "2026-02-11T16:00:00",
      timeLabel: "4:00 PM",
      dateLabel: "Yesterday",
      isOwn: false,
    },
    {
      id: "d2",
      senderId: "me",
      senderName: "Alex Contributor",
      senderAvatar: USERS.me.avatar,
      senderInitials: "AC",
      content: "Yes, I'll be there. Do we need to prepare anything specific?",
      timestamp: "2026-02-11T16:10:00",
      timeLabel: "4:10 PM",
      dateLabel: "Yesterday",
      isOwn: true,
    },
    {
      id: "d3",
      senderId: "david",
      senderName: "David Smith",
      senderAvatar: USERS.david.avatar,
      senderInitials: "DS",
      content: "See you at the meeting tomorrow.",
      timestamp: "2026-02-11T16:15:00",
      timeLabel: "4:15 PM",
      dateLabel: "Yesterday",
      isOwn: false,
    },
  ],

  "dm-emily": [
    {
      id: "e1",
      senderId: "emily",
      senderName: "Emily Rodriguez",
      senderAvatar: USERS.emily.avatar,
      senderInitials: "ER",
      content: "Great work on the presentation!",
      timestamp: "2026-02-10T14:00:00",
      timeLabel: "2:00 PM",
      dateLabel: "February 10",
      isOwn: false,
      reactions: [{ emoji: "❤️", count: 1, reacted: true }],
    },
  ],

  "group-workshop": [
    {
      id: "gw1",
      senderId: "sarah",
      senderName: "Sarah Chen",
      senderAvatar: USERS.sarah.avatar,
      senderInitials: "SC",
      content: "Hey team! We need to finalize the workshop agenda for next week.",
      timestamp: "2026-02-12T09:00:00",
      timeLabel: "9:00 AM",
      dateLabel: "Today",
      isOwn: false,
    },
    {
      id: "gw2",
      senderId: "emily",
      senderName: "Emily Rodriguez",
      senderAvatar: USERS.emily.avatar,
      senderInitials: "ER",
      content: "I can handle the intro session and the design thinking exercise. Should we allocate 90 minutes for the breakout groups?",
      timestamp: "2026-02-12T09:05:00",
      timeLabel: "9:05 AM",
      dateLabel: "Today",
      isOwn: false,
    },
    {
      id: "gw3",
      senderId: "me",
      senderName: "Alex Contributor",
      senderAvatar: USERS.me.avatar,
      senderInitials: "AC",
      content: "90 minutes sounds right. I'll prepare the participant materials.",
      timestamp: "2026-02-12T09:10:00",
      timeLabel: "9:10 AM",
      dateLabel: "Today",
      isOwn: true,
      reactions: [
        { emoji: "👍", count: 2, reacted: false },
      ],
    },
    {
      id: "gw4",
      senderId: "marc",
      senderName: "Marc Johnson",
      senderAvatar: USERS.marc.avatar,
      senderInitials: "MJ",
      content: "I'll book the room for Thursday",
      timestamp: "2026-02-12T09:15:00",
      timeLabel: "9:15 AM",
      dateLabel: "Today",
      isOwn: false,
    },
  ],

  "group-leads": [
    {
      id: "gl1",
      senderId: "nina",
      senderName: "Nina Patel",
      senderAvatar: USERS.nina.avatar,
      senderInitials: "NP",
      content: "Hi everyone, I've drafted the Q2 budget proposal. Key changes from last quarter: we're reallocating 15% from events to the digital platform.",
      timestamp: "2026-02-12T08:00:00",
      timeLabel: "8:00 AM",
      dateLabel: "Today",
      isOwn: false,
      attachment: {
        type: "document",
        name: "Q2_Budget_Proposal_v2.pdf",
        size: "2.4 MB",
        url: "#",
      },
    },
    {
      id: "gl2",
      senderId: "david",
      senderName: "David Smith",
      senderAvatar: USERS.david.avatar,
      senderInitials: "DS",
      content: "Looks good overall. Can we discuss the events reduction in our next sync?",
      timestamp: "2026-02-12T08:30:00",
      timeLabel: "8:30 AM",
      dateLabel: "Today",
      isOwn: false,
    },
    {
      id: "gl3",
      senderId: "nina",
      senderName: "Nina Patel",
      senderAvatar: USERS.nina.avatar,
      senderInitials: "NP",
      content: "Q2 budget proposal attached",
      timestamp: "2026-02-12T08:45:00",
      timeLabel: "8:45 AM",
      dateLabel: "Today",
      isOwn: false,
    },
  ],

  "space-innovation": [
    {
      id: "si1",
      senderId: "tom",
      senderName: "Tom de Vries",
      senderAvatar: USERS.tom.avatar,
      senderInitials: "TV",
      content: "Welcome everyone to the Green Energy Space channel! This is our shared space for quick coordination and updates.",
      timestamp: "2026-02-10T10:00:00",
      timeLabel: "10:00 AM",
      dateLabel: "February 10",
      isOwn: false,
    },
    {
      id: "si2",
      senderId: "sarah",
      senderName: "Sarah Chen",
      senderAvatar: USERS.sarah.avatar,
      senderInitials: "SC",
      content: "Great idea! Quick reminder: the prototype review is scheduled for this Friday at 2pm.",
      timestamp: "2026-02-11T11:00:00",
      timeLabel: "11:00 AM",
      dateLabel: "Yesterday",
      isOwn: false,
      reactions: [
        { emoji: "👍", count: 4, reacted: true },
        { emoji: "📅", count: 2, reacted: false },
      ],
    },
    {
      id: "si3",
      senderId: "me",
      senderName: "Alex Contributor",
      senderAvatar: USERS.me.avatar,
      senderInitials: "AC",
      content: "I've uploaded the latest user research findings to the Knowledge Base. Some really interesting patterns in the feedback around onboarding flows.",
      timestamp: "2026-02-12T09:30:00",
      timeLabel: "9:30 AM",
      dateLabel: "Today",
      isOwn: true,
    },
    {
      id: "si4",
      senderId: "marc",
      senderName: "Marc Johnson",
      senderAvatar: USERS.marc.avatar,
      senderInitials: "MJ",
      content: "@Alex great findings! The onboarding pain points align with what we've been hearing from the community surveys.",
      timestamp: "2026-02-12T09:45:00",
      timeLabel: "9:45 AM",
      dateLabel: "Today",
      isOwn: false,
    },
    {
      id: "si5",
      senderId: "emily",
      senderName: "Emily Rodriguez",
      senderAvatar: USERS.emily.avatar,
      senderInitials: "ER",
      content: "I've shared the updated roadmap with the team",
      timestamp: "2026-02-12T09:50:00",
      timeLabel: "9:50 AM",
      dateLabel: "Today",
      isOwn: false,
    },
  ],

  "space-climate": [
    {
      id: "sc1",
      senderId: "nina",
      senderName: "Nina Patel",
      senderAvatar: USERS.nina.avatar,
      senderInitials: "NP",
      content: "Quick update: we've secured the partnership with the Rotterdam Climate Office for the spring campaign.",
      timestamp: "2026-02-11T14:00:00",
      timeLabel: "2:00 PM",
      dateLabel: "Yesterday",
      isOwn: false,
      reactions: [
        { emoji: "🎉", count: 6, reacted: true },
      ],
    },
    {
      id: "sc2",
      senderId: "tom",
      senderName: "Tom de Vries",
      senderAvatar: USERS.tom.avatar,
      senderInitials: "TV",
      content: "The new policy brief is ready for review",
      timestamp: "2026-02-12T08:00:00",
      timeLabel: "8:00 AM",
      dateLabel: "Today",
      isOwn: false,
    },
  ],
};

// ─── Searchable users (for new conversation) ────────────────────────────────

export const ALL_USERS: UserInfo[] = Object.values(USERS).filter(
  (u) => u.id !== "me"
);
