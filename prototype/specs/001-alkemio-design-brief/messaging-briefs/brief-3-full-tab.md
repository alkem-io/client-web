# Brief 3: Unified Messaging System — Full Tab Within Space

> **Integration Pattern**: Space Channel accessed via a **full tab** in the Space's tab navigation (HOME | COMMUNITY | SUBSPACES | KNOWLEDGE BASE | **CHAT**)  
> **Scope**: Complete messaging system — 1:1 DMs, Group Chats, Space Channels + Messaging Hub  
> **Date**: February 12, 2026  
> **Status**: Draft — design option 3 of 4  
> **Related**: [server#5829](https://github.com/alkem-io/server/issues/5829), [server#5713](https://github.com/alkem-io/server/issues/5713), [alkemio#1741](https://github.com/alkem-io/alkemio/issues/1741)  
> **Protocol**: Matrix

---

## Why This Exists

### The Problem

Alkemio has structured collaboration tools — Spaces, Subspaces, Posts, Knowledge Base — but **no real-time conversational layer**. The platform enables people to *work together* but not to *talk together*. As a result:

- **Facilitators** answering the same coordination questions repeatedly because there's no persistent shared channel; they resort to email or WhatsApp and lose that context.
- **Contributors** who want to quickly ask "hey, can you look at this?" leave the platform entirely — dropping into Slack, Teams, or WhatsApp — and that conversation never comes back.
- **Portfolio Owners** who want to feel the pulse of a collaboration have to read through formal posts; there's no lightweight, ambient signal of how a Space is doing.

### The Vision

Alkemio becomes the place where collaboration **and** communication happen together. Users shouldn't need Slack *and* Alkemio, or Teams *and* Alkemio. The platform provides a **complete collaboration + communication experience** — not by competing with chat apps feature-for-feature, but by making conversation a natural part of collaborative work.

This also aligns with a broader industry trend: organizations are migrating away from Big Tech communication tools toward platforms that align with their values — open, self-sovereign, and integrated with how they actually work.

### The Three Conversation Types

| Layer | What | Who controls membership | When you'd use it |
|-------|------|-------------------------|-------------------|
| **1:1 DMs** | Direct messages between two users | The two participants | "Hey Duncan, can you review this?" |
| **Group Chats** | Ad-hoc group conversations created by any user | Any group member can add/remove | "Let's loop in the three of us to plan the workshop" |
| **(Sub)-Space Channel** | Auto-created team channel tied to a Space's membership | Membership follows the Space — admin can only enable/disable | "All members of the Climate Action Space can talk here" |

### Expected Communication Pace

This is a **low-traffic, coordination-style** communication layer — think a few messages a day, not dozens per hour. The UI should be designed for clarity and readability, not for high-throughput real-time streaming. Messages are meaningful, not ephemeral.

### What's NOT In Scope (v1)

- Moderation UI (flagging, review, audit trail) — later design phase
- Message deletion UI (admin delete, user delete) — later design phase
- Read receipts, typing indicators
- Email notifications for messages
- Voice/video integration (Jitsi)
- AI agents/bots in chat
- Multiple channels per Space
- Blocking users

### Relationship to Status Updates

Status Updates from Leads remain a **separate feature** for v1. The Space Channel is many-to-many; Status Updates are one-to-many from Leads. In a future version, a Status Update could become a pinned message in the Space Channel — but for now, they coexist independently.

---

## What Makes This Brief Unique: Full Tab Within Space

This brief uses a **dedicated tab** in the Space's horizontal tab navigation for the Space Channel. The Chat tab sits alongside Home, Community, Subspaces, and Knowledge Base as a first-class section of the Space.

**Why this pattern:**
- Chat is a **first-class citizen** in the Space — it has equal prominence with posts, community, and knowledge
- Full-page real estate for the conversation — no narrow panels, no cramped sidebars
- Clean information architecture — users know exactly where to find chat (it's a tab, like everything else)
- No layout interference — content pages stay at full width; the chat has its own dedicated view
- Consistent with the existing Space navigation pattern — predictable, learnable

**Trade-offs:**
- User must **leave** the content view to access chat — they can't see posts and chat simultaneously
- One extra click to switch between content and chat (tab switch)
- If chat is low-traffic, the tab might feel empty or underwhelming most of the time
- Adds a fifth tab — may feel crowded on mobile

---

## Design Principle: One Home, Two Entry Points

All conversations — 1:1 DMs, Group Chats, and Space Channels — live in **one unified Messaging Hub**. Users have a single place to see all their conversations, with filters to focus on what they need.

But Space Channels also have a **second entry point**: a full tab within the Space. This dual-access pattern means:
- From the **Messaging Hub**: "I want to check all my conversations" — DMs, groups, and space channels are all here.
- From **inside a Space**: "I want to talk to my Space team" — the Chat tab gives a full-page conversation experience in context.

Same channel, same messages, same state. Two optimized entry points for two modes.

---

## Section 1: The Messaging Hub (Unified Panel)

**Trigger**: Chat icon in the top navigation bar (replacing the current 1:1-only dialog)  
**Container**: Full-height sliding panel from right edge — persistent across navigation  
**Audience**: All authenticated users

### Design Brief

You are designing the **Messaging Hub** — the central panel where all conversations live. This replaces the current 1:1 chat dialog with a richer, unified messaging experience. Think of this as Alkemio's answer to Slack's sidebar or Teams' chat panel — but lighter, calmer, and purpose-built for low-traffic coordination.

**Why this panel matters**: Users should never need to think "where do I find that conversation?" Whether it was a DM, a group chat, or a Space discussion — it's all here.

**Key Elements**:

1. **Panel Header**
   - Title: "Messages" or "Conversations"
   - "New Message" button (prominent) — starts the new conversation flow
   - Close button (×) to dismiss the panel
   - Panel has fixed/responsive widths (~380px desktop)

2. **Filter / Segment Bar** (below header)
   - Horizontal filter tabs or pill buttons:
     - **All** — every conversation, interleaved by recency
     - **Direct** — 1:1 DMs only
     - **Groups** — ad-hoc group chats only
     - **Spaces** — Space/Subspace channels only
   - Active filter is highlighted; counts/badges per filter (e.g., "Spaces (3)" if 3 unread)
   - Search input: Filter conversations by name/keyword within the selected tab

3. **Conversation List** (scrollable, below filters)
   - Vertically stacked conversation previews, sorted by most recent activity
   - Each item: Avatar, Name, Type badge (subtle), Preview (~60 chars), Timestamp, Unread indicator, Muted indicator
   - For Space channels: Space avatar + Space name + channel icon (📢 or `#`)
   - For Group chats: group avatar (rounded-square) + group name
   - For DMs: user avatar (circular) + user name
   - **Empty state**: "No conversations yet. Start a message to connect with your team."

4. **New Conversation Flow** (triggered by "New Message" button)
   - Choose type: "Direct Message", "New Group", or browse Space channels
   - DM: Search/select user → opens chat
   - Group: Multi-select users → name + avatar → create → opens chat
   - Space channels: Browse/pin (not created here — automatic)

5. **Panel Behavior**
   - Opens chat views inside the panel; back arrow returns to list
   - Persists across page navigation; dismissible (×); state preserved
   - Unread badge on top-nav chat icon reflects total unread

**Visual Requirements**:
- Clean, minimal list; visual hierarchy: Name > Preview > Timestamp
- Avatar shape as primary differentiator; unread = bold + dot/highlight
- Smooth slide-in animation; "Load more" at bottom

**Responsive Behavior**:
- **Desktop**: ~380px panel, overlays content
- **Tablet**: ~50% width
- **Mobile**: Full-screen overlay

**Accessibility**: Focus trap, keyboard nav, screen reader announcements

**Personas**:
- **Contributor**: Checks DMs and group chats; glances at Space channels
- **Facilitator**: Triages across all conversation types
- **Portfolio Owner**: Monitors Space channels across portfolio

---

## Section 2: 1:1 Direct Messages (Chat View)

**Context**: Opened from Messaging Hub or via envelope icon on user profile  
**Container**: Inside the Messaging Hub panel  
**Audience**: Any two authenticated users

### Design Brief

You are designing the **1:1 Direct Message chat view** — a simple, focused conversation between two people.

**Why DMs matter**: The fundamental need to reach one person directly. DMs are the glue that turns platform acquaintances into collaborators.

**Key Elements**:

1. **Chat Header**: Back arrow, user avatar (circular) + name, optional online/offline dot, three-dot menu (View Profile, Mute, DND)

2. **Message Thread** (scrollable):
   - Chat bubbles: own = right-aligned (brand color), theirs = left-aligned (light gray)
   - Content, timestamp, "Edited" tag, emoji reactions (pill badges)
   - Message grouping (~2 min window), date separators, "Load more" at top

3. **Message Composer** (fixed bottom):
   - Auto-expanding input, rich text toolbar (bold/italic/strikethrough/code/link, Markdown)
   - 📎 Attach, 😀 Emoji, Send (Enter; Shift+Enter for newline)
   - @mentions trigger search dropdown

4. **Message Interactions** (hover/long-press): React, Reply (quote), Edit (own only). Delete: not in v1.

5. **Attachments**: Inline images, audio/video playback, documents (25MB limit)

6. **Notifications**: Per-conversation mute, DND schedule

**Visual**: Soft rounded bubbles, generous padding, clear own/theirs distinction, inline attachments, fixed composer, low-traffic whitespace

**Empty State**: "This is the start of your conversation with [User Name]. Say hello! 👋"

**Responsive**: Panel width on desktop; full-screen on mobile

**Accessibility**: Screen reader announcements, keyboard reactions, aria-label on composer

---

## Section 3: Group Chats (Chat View)

**Context**: Opened from Messaging Hub, or created via "New Message" → "New Group"  
**Container**: Inside the Messaging Hub panel  
**Audience**: Group members

### Design Brief

You are designing the **Group Chat view** — an ad-hoc conversation between multiple people. Groups are self-organizing: any member can add or remove others.

**Why Group Chats matter**: They fill the gap between DMs (too private) and Space Channels (too broad).

**Key Elements**:

1. **Chat Header**: Back arrow, group avatar (rounded-square) + name, member count, three-dot menu (Manage Members, Group Info, Mute, DND, Leave Group with confirmation)

2. **Message Thread**: Same as DMs but each message shows sender avatar + name. @mentions dropdown shows group members; mentioned users notified even if muted.

3. **Message Composer**: Identical to DMs; @mentions show group members

4. **Member Management Dialog**: Current members with "Remove"; add member search (all users, existing filtered out); any member can add/remove; minimum 2 members + creator; added members see full history; removed lose access immediately

5. **Group Creation Flow** (3 steps): Select users → name + avatar → create. Cannot convert 1:1 to group.

6. **Leave Group**: Chat disappears from list; group continues; re-added users see full history

**Visual**: Rounded-square group avatar; stacked member avatars in header; sender identity on messages

**Empty State**: "Welcome to [Group Name]! Start the conversation. 💬"

**Responsive / Accessibility**: Same as DMs

**Personas**:
- **Contributor**: Cross-space coordination
- **Facilitator**: Back-channel with co-leads
- **Portfolio Owner**: Strategic alignment across portfolio

---

## Section 4: (Sub)-Space Channel — Full Tab

**Route**: `/space/[space-slug]/chat` (or `/space/[space-slug]/channel`)  
**Position**: New tab in Space tab navigation: HOME | COMMUNITY | SUBSPACES | KNOWLEDGE BASE | **CHAT**  
**Also accessible via**: The Messaging Hub (where it appears in the conversation list)  
**Audience**: All members of the (Sub)-Space

### Design Brief

You are designing the **Space Channel as a full tab within the Space** — woven into the Space experience itself. When a member is working in a Space — reading posts, browsing the knowledge base, checking subspaces — the Chat tab is always one click away. This is the heartbeat of the Space: ambient, persistent, and low-friction.

**Why a tab**: A tab gives the channel full-page real estate, making it a first-class part of the Space experience. It signals that conversation is as important as posts, community, or knowledge. It keeps the Space's information architecture clean and predictable — users already know how tabs work.

**How it works alongside the Messaging Hub**: The Hub is for *triage* — scanning across all conversations. The tab is for *engagement* — being present in the Space conversation in context. Same channel, same messages, same state — two entry points.

**Key Elements**:

1. **Tab Position & Behavior**
   - Added to the existing horizontal tab bar: HOME | COMMUNITY | SUBSPACES | KNOWLEDGE BASE | **CHAT**
   - Unread badge (dot or count) when there are new messages
   - Chat/speech-bubble icon + "CHAT" label (consistent with other tabs)
   - If admin has disabled the channel, the CHAT tab does not appear

2. **Chat Layout** (when CHAT tab is active)
   - Full-width main content area (same width as Home feed or Knowledge Base)
   - **Left sidebar**: Same Space left sidebar as other tabs (welcome callout, subspaces list, etc.) — maintains spatial consistency
   - **Chat area** (right of sidebar, main content region):
     - Full-height message thread (header to composer)
     - No cards, no grids — just the conversation stream

3. **Channel Header** (top of chat area, below tab navigation)
   - Space name + "Channel" label (e.g., "Climate Action NL — Channel")
   - Member count (e.g., "24 members")
   - Quick actions (right-aligned):
     - 🔍 Search within channel (filter messages by keyword)
     - 👥 View Members (read-only, same data as Community tab)
     - ⚙️ Channel Settings (admin-only): Links to Space Settings for history retention, enable/disable
   - No "Manage Members" or "Leave" — membership is the Space's membership

4. **Message Thread** (main scrollable area)
   - Same chat bubble pattern as Group Chats (Section 3) — sender avatar + name
   - Rich text, attachments, reactions, reply-to, edit (own), emoji, @mentions
   - Date separators, message grouping, "Load more" at top
   - **Key UX enhancement**: Full-width view means wider bubbles, more generous margins, larger inline image previews
   - History depth controlled by admin setting (30 days / 90 days / 1 year / Forever)

5. **Message Composer** (fixed at bottom of chat area)
   - Same composer as all other chat views
   - Full-width within chat area — wider and more comfortable than Hub panel version
   - Rich text toolbar, attachments, emoji picker, @mentions, send on Enter

6. **Channel Search** (triggered by 🔍 in header)
   - Inline search bar below header
   - Filters messages by keyword; results highlighted and scrolled-to
   - Close search (×) returns to full thread

7. **Notification & Mute Controls**
   - Per-user mute (via three-dot menu or header)
   - DND scheduling
   - @mention override: notifies even if muted (configurable)

**Visual Requirements**:
- The chat tab feels **native to the Space** — same sidebar, same tab bar, same visual language
- Message thread uses full available width (minus sidebar) — wider and more readable than Hub panel
- Low-traffic design: generous whitespace, large text, clear date separators
- Subtle differentiated background in the chat area (slight shade or thin top border) to signal "conversation mode"
- Composer visually grounded at bottom (subtle top border/shadow) — always visible
- Inline images/attachments at comfortable sizes (viewable without clicking)
- Reactions as small pills below messages

**Empty State** (no messages):
- Centered illustration + text: "This is the [Space Name] channel. Say hello to your team! 👋"
- Subtitle: "Messages here are visible to all [X] members of this Space."
- Optional quick prompts: "👋 Say hello" / "📋 Share an update" — pre-fill composer

**Admin-Disabled State**:
- CHAT tab does not appear
- Direct URL navigation shows: "The chat channel for this Space is currently disabled. Contact a Space admin to enable it."

**Edge States**:
- User joins Space → access to channel; sees history per admin setting
- User leaves Space → loses access; disappears from Hub list; tab inaccessible
- Admin changes retention → affects visible history
- Space deleted → channel deleted

**Responsive Behavior**:
- **Desktop (1024px+)**: Full tab layout with sidebar + chat area (~70% horizontal space for chat)
- **Tablet (768–1023px)**: Sidebar collapses; chat area full width; composer fixed bottom
- **Mobile (<768px)**: Full-screen chat (sidebar via hamburger); scrollable tab row; feels like native mobile messaging

**Accessibility**:
- Tab keyboard-selectable from tab bar
- Message thread is a live region (announces new messages)
- Composer labeled "Message [Space Name]"
- Search triggers keyboard-accessible
- Opening tab focuses composer (ready to type)

**Personas**:
- **Contributor**: Opens Chat tab while browsing — asks a quick question, coordinates with teammates, shares a link. Doesn't leave the Space context.
- **Facilitator**: Primary coordination tool within the Space — announces schedule changes, answers questions, shares quick updates that don't warrant a formal Post. Keeps the Space's pulse alive.
- **Portfolio Owner**: Visits Chat tab to sense activity levels and team health — passive but valuable ambient signal.

---

## Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Space Channel integration | Full tab in Space | First-class citizen; full-page real estate; clean IA |
| Panel vs. page for Hub | Sliding panel from right | Keeps user in context |
| Filter tabs in Hub | All / Direct / Groups / Spaces | Low categories; fast to scan |
| Group avatar shape | Rounded square | Visual differentiation |
| Space Channel entry points | Hub + Space tab | Hub for triage, tab for engagement |
| Chat tab position | After Knowledge Base | Least disruptive; supplementary to structured content |
| Message deletion UI | Deferred | v1 focus on communication |
| Moderation UI | Deferred | Framework in data model; UI later |
| Status Updates vs. Channel | Separate for v1 | Future convergence via pinned messages |
| History retention UI | In Space Settings | Admin concern |
| Message pace | Low traffic | Generous whitespace, "Load more" |
| Notification strategy | In-app + push; no email | Push covers urgency |

---

## Appendix: Notification Model (v1)

| Event | In-App | Push | Override if Muted |
|-------|--------|------|-------------------|
| New DM message | ✓ | ✓ | No |
| New Group message | ✓ | ✓ | No |
| New Space Channel message | ✓ | ✓ | No |
| @mention (any context) | ✓ | ✓ | **Yes** — always notifies |
| Reaction on your message | ✓ | ✗ | No |
| Added to a group | ✓ | ✓ | No |
| Removed from a group | ✓ | ✗ | No |

---

## Appendix: Figma Make Prototype Guidance

Suggested screen sequence for this variant:

1. **Screen M1**: Top-nav chat icon with unread badge (closed)
2. **Screen M2**: Messaging Hub open — conversation list
3. **Screen M3**: Hub → DM chat view
4. **Screen M4**: Hub → Group chat view
5. **Screen M5**: Hub → Space Channel view
6. **Screen M6**: Space Home — CHAT tab visible with unread badge
7. **Screen M7**: Space CHAT tab active — full-page chat experience (sidebar + chat area)
8. **Screen M8**: New Group creation flow

Smart Animate transitions:
- M1 → M2: Panel slides in from right
- M2 → M3/M4/M5: Conversation list slides left, chat slides in
- M6 → M7: Tab switch (horizontal slide or instant swap)

Use the platform's standard design system (`design-system-page.md`).
