# Alkemio Messaging System — Design Briefs

> **Scope**: Complete communication layer for the Alkemio platform  
> **Date**: February 12, 2026  
> **Status**: Draft — pending stakeholder review  
> **Related**: [server#5829](https://github.com/alkem-io/server/issues/5829) (Sub-Space Chat), [server#5713](https://github.com/alkem-io/server/issues/5713) (Group Chats), [alkemio#1741](https://github.com/alkem-io/alkemio/issues/1741) (Epic: Group Conversations)  
> **Protocol**: Matrix (all messaging powered by Matrix under the hood)

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

# Part 1: Unified Messaging System

> This part covers the **complete messaging experience** — a full rethink of how messaging works across the platform. It includes four sub-briefs that together form one coherent system.

## Design Principle: One Home, Two Entry Points

All conversations — 1:1 DMs, Group Chats, and Space Channels — live in **one unified messaging panel**. Users have a single place to see all their conversations, with filters to focus on what they need.

But Space Channels also have a **second entry point**: they appear as a tab within the Space itself (see Part 2). This dual-access pattern means:
- From the **messaging panel**: "I want to check all my conversations" — DMs, groups, and space channels are all here.
- From **inside a Space**: "I want to talk to my Space team without leaving" — the channel tab is right there, woven into the Space experience (Option B).

The experience is the same channel, the same messages, the same state — just accessed from two places.

---

## Brief 1A: The Messaging Hub (Unified Panel)

**Trigger**: Chat icon in the top navigation bar (replacing the current 1:1-only dialog)  
**Container**: Full-height sliding panel from right edge, or full-page modal — persistent across navigation  
**Audience**: All authenticated users

### Design Brief

You are designing the **Messaging Hub** — the central panel where all conversations live. This replaces the current 1:1 chat dialog with a richer, unified messaging experience. Think of this as Alkemio's answer to Slack's sidebar or Teams' chat panel — but lighter, calmer, and purpose-built for low-traffic coordination.

**Why this panel matters**: Users should never need to think "where do I find that conversation?" Whether it was a DM, a group chat, or a Space discussion — it's all here.

**Key Elements**:

1. **Panel Header**
   - Title: "Messages" or "Conversations"
   - "New Message" button (prominent) — starts the new conversation flow
   - Close button (×) to dismiss the panel
   - Panel can be resized (drag left edge) or has fixed/responsive widths

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
   - Each conversation item shows:
     - **Avatar**: User photo (DM), group avatar (group), Space avatar/thumbnail (Space channel)
     - **Name**: User name (DM), group name (group), Space name (Space channel)
     - **Type badge** (subtle): Small icon or label distinguishing DM / Group / Space — especially useful in "All" view
     - **Preview**: Last message snippet (truncated, ~60 chars)
     - **Timestamp**: Relative ("2m ago", "Yesterday", "Feb 10")
     - **Unread indicator**: Bold text + dot/badge for unread conversations
     - **Muted indicator** (if applicable): Subtle muted icon overlay
   - For Space channels: show Space avatar + Space name, with a subtle "Space" or channel icon to distinguish from group chats
   - For Group chats: show group avatar + group name
   - For DMs: show user avatar + user name
   - **Empty state**: "No conversations yet. Start a message to connect with your team."

4. **New Conversation Flow** (triggered by "New Message" button)
   - Step 1: Choose type — "Direct Message", "New Group", or (if applicable) browse your Space channels
   - For DM: Search and select a user → opens chat
   - For Group: Search and select multiple users → name the group → select avatar → create → opens chat
   - For Space channels: Not created here — they exist automatically. But the user can browse/pin them from this flow.

5. **Panel Behavior**
   - Clicking a conversation opens the **Chat View** (Brief 1B/1C/1D depending on type) inside the panel
   - Back arrow returns to the conversation list
   - Panel persists across page navigation (doesn't close when user clicks elsewhere)
   - Panel can be dismissed (×) and reopened; state is preserved
   - Unread badge on the top-nav chat icon reflects total unread across all conversation types

**Visual Requirements**:
- Clean, minimal list — no heavy borders or box shadows between items
- Clear visual hierarchy: Name > Preview > Timestamp
- Type badges should be subtle (icon-only or very small label) — the avatar shape/style should be the primary differentiator (circular for people, rounded-square for groups, Space avatar for channels)
- Unread conversations should feel distinct (bold, dot, or subtle background highlight) without being aggressive
- Smooth slide-in animation when opening the panel
- Scrollable list with "Load more" at bottom (not infinite scroll — low traffic means short lists)

**Responsive Behavior**:
- **Desktop (1024px+)**: Sliding panel from right edge (~380px wide), overlays content, doesn't push layout
- **Tablet (768–1023px)**: Full-width panel or side drawer (~50% width)
- **Mobile (<768px)**: Full-screen overlay, replaces current view with back navigation

**Accessibility**:
- Focus trapped in panel when open
- Keyboard: Tab through conversations, Enter to open, Escape to close panel
- Screen reader: Announce conversation type, name, last message, unread status
- Unread badge announced on chat icon

**Personas**:
- **Contributor**: Checks DMs and group chats for coordination; glances at Space channels for updates
- **Facilitator**: Uses Space channels to coordinate with members; uses groups for cross-space planning; DMs for private follow-ups
- **Portfolio Owner**: Monitors Space channels across portfolio; uses DMs to check in with Facilitators

---

## Brief 1B: 1:1 Direct Messages (Chat View)

**Context**: Opened from the Messaging Hub conversation list, or via the envelope icon on a user's profile  
**Container**: Inside the Messaging Hub panel (right side), replacing the conversation list when a DM is selected  
**Audience**: Any two authenticated users

### Design Brief

You are designing the **1:1 Direct Message chat view** — a simple, focused conversation between two people. This is the most intimate and personal communication layer on the platform.

**Why DMs matter**: Before group chats and channels, there's the fundamental need to reach one person directly. "Can you take a look?" "Are you free Thursday?" "I noticed your org works on X too." DMs are the glue that turns platform acquaintances into collaborators.

**Key Elements**:

1. **Chat Header** (top of chat view)
   - Back arrow (returns to conversation list)
   - User avatar (circular) + user name
   - Online/offline indicator (subtle dot — green/gray) — optional for v1
   - Three-dot menu:
     - View Profile
     - Mute Notifications
     - Set Do Not Disturb schedule (time picker: mute for 1h / until tomorrow / until I turn off)

2. **Message Thread** (scrollable, main area)
   - Messages displayed as chat bubbles:
     - **Own messages**: Right-aligned, primary brand color background, white text
     - **Their messages**: Left-aligned, light gray/neutral background, dark text
   - Each message shows:
     - Message content (plain text, rich text/Markdown rendering, or attachment)
     - Timestamp (subtle, below message or grouped by time blocks)
     - "Edited" tag (if message was edited)
     - Emoji reactions (row of small emoji badges below the message, with counts)
   - **Message grouping**: Consecutive messages from the same sender within a short time window (~2 min) are grouped (no repeated avatar/name)
   - **Date separators**: "Today", "Yesterday", "February 10, 2026" between message groups from different days
   - **Scroll behavior**: Opens at most recent message; scroll up for history; "Load more" at the very top for older messages (no infinite scroll — low traffic)

3. **Message Composer** (fixed at bottom)
   - Text input area (auto-expanding, multi-line)
   - Rich text formatting toolbar (appears on focus or via toggle):
     - Bold, italic, strikethrough, code, link
     - Markdown shortcuts supported (typing `**bold**` renders bold)
   - Action icons (right side of composer):
     - 📎 Attach file (images, audio, video, documents — industry-standard formats)
     - 😀 Emoji picker
     - Send button (arrow icon) — also triggered by Enter (Shift+Enter for new line)
   - @mentions: Typing `@` in the composer triggers a user search dropdown (in DM context, only the other participant — but useful for future group/channel context)

4. **Message Interactions** (on hover or long-press on mobile)
   - **React**: Emoji picker (quick-react row of 5–6 common emojis + "more" for full picker)
   - **Reply**: Quote the message and focus the composer (reply-to threading)
   - **Edit**: Own messages only — replaces message content in composer; message shows "Edited" after save
   - Delete: **Not in v1** (later design phase)

5. **Attachments**
   - Inline image preview (expandable to full size)
   - Audio/video: Playback controls inline
   - Documents: File icon + filename + size, click to download
   - File size limits: Industry best practice (suggest 25MB per file)

6. **Notification Preferences** (per-conversation, via three-dot menu)
   - Mute conversation (no notifications, but messages still appear)
   - Do Not Disturb schedule
   - Mention-based notifications (in future group/channel context)

**Visual Requirements**:
- Chat bubbles with soft rounded corners, generous padding
- Clear visual distinction between own messages and theirs (color, alignment)
- Reactions render as small pill badges below the message (emoji + count)
- Reply-to shows a quoted preview (indented, lighter background) above the new message
- Attachments are inline, not in a separate panel
- Composer is always visible (fixed bottom), never scrolls away
- Low-traffic design: generous whitespace between message groups, large readable text

**Empty State**: "This is the start of your conversation with [User Name]. Say hello! 👋"

**Responsive Behavior**:
- Inside the Messaging Hub panel on desktop (same width as panel)
- Full-screen on mobile with native-feeling back navigation
- Composer adapts: on mobile, emoji picker is a bottom sheet; attach is a system file picker

**Accessibility**:
- Messages are announced by screen reader with sender, content, time
- Reactions can be added via keyboard (Tab to reaction button, Enter to open picker)
- Reply-to creates a visible link between the quoted message and the reply
- Composer is a standard textarea with aria-label

---

## Brief 1C: Group Chats (Chat View)

**Context**: Opened from the Messaging Hub conversation list, or created via "New Message" → "New Group"  
**Container**: Inside the Messaging Hub panel, same position as DM chat view  
**Audience**: Any platform users who are members of the group

### Design Brief

You are designing the **Group Chat view** — an ad-hoc conversation between multiple people, created by any user. Groups are self-organizing: any member can add or remove others. This is the "let's loop in a few people" layer.

**Why Group Chats matter**: Not every conversation belongs in a Space. Sometimes three people from different Spaces need to plan something. Sometimes a facilitator wants a private back-channel with two co-leads. Group chats fill the gap between DMs (too private) and Space Channels (too broad).

**Key Elements**:

1. **Chat Header** (top of chat view)
   - Back arrow (returns to conversation list)
   - Group avatar (rounded-square, custom image or auto-generated) + group name
   - Member count subtitle (e.g., "4 members")
   - Three-dot menu:
     - **Manage Members** → opens member management dialog
     - **Group Info** → shows group name, avatar, created by, member list
     - Mute Notifications
     - Set Do Not Disturb schedule
     - **Leave Group** → confirmation dialog: "Leave [Group Name]? The group will continue without you."

2. **Message Thread**
   - Same chat bubble pattern as 1:1 DMs (Brief 1B)
   - **Key difference**: Each message from another member shows their avatar + name above the bubble (or on first message in a group of consecutive messages)
   - All message features from 1B apply: rich text, attachments, reactions, reply-to, edit (own), emoji
   - @mentions: Typing `@` shows a dropdown of all group members; mentioned users receive a notification even if they've muted the group

3. **Message Composer**
   - Identical to 1:1 DM composer (Brief 1B)
   - @mentions dropdown shows group members

4. **Member Management Dialog** (triggered from three-dot menu → "Manage Members")
   - **Current members list**: Avatar + name for each member, with "Remove" option per member
   - **Add member**: Search input at top — searches all platform users; selecting a user adds them to the group
   - Users already in the group are filtered out of search results
   - Any member can add or remove any other member (no special permissions in v1)
   - Minimum group size: 2 members (+ creator). If a user tries to create a group with 0 others, show validation error.
   - When a member is added: They get access immediately and can see full message history
   - When a member is removed: They lose access immediately; chat disappears from their list

5. **Group Creation Flow** (from Messaging Hub → "New Message" → "New Group")
   - **Step 1**: Search and select users (multi-select with pills/tags showing selected users)
   - **Step 2**: Enter group name (required field) + select group avatar (optional — default auto-generated from initials or member avatars)
   - **Step 3**: "Create" button → group created, user lands in the new group chat view
   - Cannot convert a 1:1 DM into a group chat — groups are always created fresh

6. **Leave Group Behavior**
   - When a user leaves: The chat disappears from their conversation list immediately (no banner, no "you left" state)
   - The group continues for remaining members
   - If the user is re-added later, they can see the full message history (including messages sent while they were away)

**Visual Requirements**:
- Group avatar uses a rounded-square shape (vs. circular for individuals) — this is the visual cue that it's a group
- Member avatars are shown in the header area (stacked, up to 4 visible + "+N" for overflow)
- Message bubbles show sender identity (avatar + name) for messages from others
- Same low-traffic, generous whitespace approach as DMs
- Member management dialog is a simple, clean list — not a complex admin panel

**Empty State** (new group): "Welcome to [Group Name]! Start the conversation. 💬"

**Responsive Behavior**: Same as DM view (Brief 1B)

**Accessibility**:
- Group name announced in header region
- Member management dialog is keyboard-navigable (Tab through members, Enter to remove/add)
- "Leave group" has a confirmation step to prevent accidental exits

**Personas**:
- **Contributor**: Creates or joins groups for cross-space coordination with a few collaborators
- **Facilitator**: Uses groups for back-channel planning with co-leads, private coordination outside the Space channel
- **Portfolio Owner**: Creates groups with facilitators across their portfolio for strategic alignment

---

## Brief 1D: (Sub)-Space Channel (In Messaging Hub)

**Context**: Appears in the Messaging Hub conversation list alongside DMs and Groups; clicking opens the channel chat view within the Hub panel  
**Container**: Inside the Messaging Hub panel, same position as DM and Group chat views  
**Audience**: All members of the (Sub)-Space

### Design Brief

You are designing the **Space Channel as it appears inside the Messaging Hub** — the "Option A" view. This is how a user interacts with a Space's team conversation from the unified messaging panel, without needing to navigate to the Space itself.

**Why this view matters**: A facilitator managing 3 Spaces doesn't want to navigate into each Space to check the channel. From the Hub, they can see all their Space conversations alongside DMs and groups — triaging, replying, and context-switching efficiently.

**Key Elements**:

1. **In the Conversation List** (how it appears in the Hub list)
   - Space avatar (the Space's own avatar/thumbnail image)
   - Space name (e.g., "Climate Action NL")
   - Subtle type indicator: Channel icon (📢 or `#` symbol) to distinguish from group chats
   - Last message preview + timestamp + unread badge (same as DMs/Groups)
   - If it's a Subspace channel: Show "in: [Parent Space Name]" as secondary text below the Space name

2. **Chat Header** (when channel is open)
   - Back arrow (returns to conversation list)
   - Space avatar + Space name
   - "Space Channel" subtitle or channel icon
   - Member count (matches Space membership)
   - Three-dot menu:
     - **View Space** → navigates to the Space Home page (opens in main content area, not in the panel)
     - **View Members** → shows the Space member list (read-only — membership is managed in Space Settings, not here)
     - Mute Notifications
     - Set Do Not Disturb schedule
   - Note: **No "Leave" option** — channel membership is tied to Space membership. Leaving the Space removes you from the channel.

3. **Message Thread**
   - Same chat bubble pattern as Group Chats (Brief 1C) — each message shows sender avatar + name
   - All message features apply: rich text, attachments, reactions, reply-to, edit (own), emoji, @mentions
   - @mentions dropdown shows all Space members
   - **Admin actions**: Space admins can delete any message (v1 — but deletion UI is in later design phase; for now, the capability exists in the data model but no UI is needed)
   - **History**: Controlled by Admin via Space Settings (30 days / 90 days / 1 year / Forever). New members see history based on the admin's setting.

4. **Message Composer**
   - Identical to Group Chat composer (Brief 1C)
   - @mentions dropdown shows Space members

5. **Channel Lifecycle** (automatic, no user action needed)
   - Channel is created automatically when a Space is created
   - Channel is deleted when a Space is deleted
   - Privacy matches the Space privacy level (public Space = public channel, private Space = private channel)
   - Admin can enable/disable the channel in Space Settings — if disabled, it disappears from the Hub list

**Visual Requirements**:
- Space avatar is the primary visual identifier — it should match the Space's avatar/thumbnail used across the platform
- The channel icon (📢 or `#`) is subtle but present — it's the cue that this is a Space-managed channel, not a user-created group
- No "Manage Members" option in the menu — to reinforce that membership follows the Space
- "View Space" link is prominent — this is the bridge between the Hub view and the in-Space view (Brief Part 2)
- Same low-traffic design principles apply

**Empty State**: "[Space Name] channel is ready. Start a conversation with your Space team! 🚀"

**Responsive Behavior**: Same as DM and Group views

**Accessibility**: Same patterns as Group Chat view. "View Space" link clearly announced as navigation to the Space.

**Personas**:
- **Contributor**: Checks Space channel for coordination messages without leaving their current workflow
- **Facilitator**: Triages across multiple Space channels from one place; responds to member questions; coordinates
- **Portfolio Owner**: Monitors channels across Spaces for ambient awareness of activity levels

---

# Part 2: Space Channel Tab (Embedded in Space)

> This is a **separate design brief** for the Space Channel experienced **inside the Space** — as a full tab alongside Home, Community, Subspaces, and Knowledge Base. This is the "Option B" view.

## Brief 2: Space Channel Tab

**Route**: `/space/[space-slug]/chat` (or `/space/[space-slug]/channel`)  
**Position**: New tab in the Space's horizontal tab navigation: HOME | COMMUNITY | SUBSPACES | KNOWLEDGE BASE | **CHAT**  
**Audience**: All members of the (Sub)-Space  
**Primary Use**: Real-time lightweight coordination among Space members, experienced in-context alongside the Space's structured content

### Design Brief

You are designing the **Space Channel as a full tab within the Space** — woven into the Space experience itself. When a member is working in a Space — reading posts, browsing the knowledge base, checking subspaces — the Chat tab is always one click away. This is the heartbeat of the Space: ambient, persistent, and low-friction.

**Why a tab (not a sidebar or widget)**: A tab gives the channel full-page real estate, making it a first-class part of the Space experience. It signals that conversation is as important as posts, community, or knowledge. It also avoids the complexity of floating widgets or collapsible sidebars that can interfere with the content layout. The tab approach keeps the Space's information architecture clean and predictable.

**Why this matters alongside the Hub view (Brief 1D)**: The Hub view is for *triage* — scanning across all your conversations. The tab view is for *engagement* — being present in the Space, seeing the conversation in the context of the work. Same channel, same messages, same state — two optimized entry points for two different modes.

**Key Elements**:

1. **Tab Position & Behavior**
   - Added to the existing horizontal tab navigation bar: HOME | COMMUNITY | SUBSPACES | KNOWLEDGE BASE | **CHAT**
   - Tab shows an unread badge (dot or count) when there are unread messages since the user's last visit
   - Tab uses a chat/speech-bubble icon + "CHAT" label (consistent with other tabs' icon+label pattern)
   - If admin has disabled the channel, the CHAT tab does not appear at all

2. **Chat Layout** (when CHAT tab is active)
   - Full-width main content area (same width as the Home feed or Knowledge Base tab)
   - **Left sidebar**: Same Space left sidebar as other tabs (welcome callout, subspaces list, etc.) — maintains spatial consistency. The sidebar is the same whether you're on Home, Community, or Chat.
   - **Chat area** (right of sidebar, main content region):
     - Full-height message thread (from header to composer)
     - No cards, no grids — just the conversation stream

3. **Channel Header** (top of chat area, below the tab navigation)
   - Space name + "Channel" label (e.g., "Climate Action NL — Channel")
   - Member count (e.g., "24 members")
   - Quick actions (right-aligned):
     - 🔍 Search within channel (filter messages by keyword)
     - 👥 View Members (opens member list — read-only, same data as Community tab)
     - ⚙️ Channel Settings (admin-only): Links to Space Settings where admin configures history retention, enable/disable
   - No "Manage Members" or "Leave" controls — membership is the Space's membership

4. **Message Thread** (main scrollable area)
   - Identical message experience to Brief 1D (Hub view):
     - Chat bubbles with sender avatar + name
     - Rich text, attachments, reactions, reply-to, edit (own), emoji, @mentions
     - Date separators between days
     - Message grouping for consecutive same-sender messages
     - "Load more" at the top for older messages
   - **Key UX enhancement for tab view**: Because this view has more horizontal space than the Hub panel, messages can breathe more — wider bubbles, more generous margins, inline image previews at a larger size
   - History depth controlled by admin setting (30 days / 90 days / 1 year / Forever)

5. **Message Composer** (fixed at bottom of chat area)
   - Same composer as all other chat views (Briefs 1B/1C/1D)
   - Rich text toolbar, attachments, emoji picker, @mentions, send on Enter
   - Full-width within the chat area (wider than Hub panel version — more comfortable for typing)

6. **Channel Search** (triggered by 🔍 in channel header)
   - Inline search bar appears below the header
   - Filters messages containing the keyword
   - Results highlighted in the thread (scroll-to and highlight matching messages)
   - Close search (×) returns to full thread view

7. **Notification & Mute Controls**
   - Per-user mute: Via three-dot menu or channel header settings
   - Do Not Disturb: Scheduling option (mute for 1h / until tomorrow / until I turn off)
   - @mention override: Even if muted, @mentions send a notification (configurable)

**Visual Requirements**:
- The chat tab should feel **native to the Space** — same left sidebar, same tab bar, same visual language. It shouldn't feel like a different app or an embedded widget.
- Message thread uses the full available width (minus sidebar) — wider and more readable than the Hub panel version
- Low-traffic design: generous whitespace, large text, clear date separators. This is a coordination channel, not a Twitch chat.
- The chat area has a subtle, differentiated background (very slightly different shade or a thin top border) to visually separate it from the tab bar — so users know they're "in the conversation" rather than looking at a content feed
- Composer is visually grounded at the bottom (subtle top border or shadow) — always visible, never scrolls
- Inline images and attachments render at comfortable sizes (not thumbnails — users should be able to read/view without clicking)
- Reactions are small pills below messages (same as DM/Group views)

**Empty State** (no messages yet):
- Centered illustration + text: "This is the [Space Name] channel. Say hello to your team! 👋"
- Subtitle: "Messages here are visible to all [X] members of this Space."
- Optional: Quick prompt buttons — "👋 Say hello" / "📋 Share an update" — that pre-fill the composer

**Admin-Disabled State** (channel turned off by admin):
- The CHAT tab does not appear in the tab navigation
- If a user navigates to the URL directly (`/space/[slug]/chat`), show: "The chat channel for this Space is currently disabled. Contact a Space admin to enable it."

**Edge States**:
- User joins the Space → automatically has access to the channel; sees history based on admin retention setting
- User leaves the Space → loses channel access; channel disappears from their Hub list and the tab is no longer accessible
- Admin changes retention policy → affects what history is visible going forward (messages already delivered are subject to the new policy)
- Space is deleted → channel is deleted; conversations are gone

**Responsive Behavior**:
- **Desktop (1024px+)**: Full tab layout with left sidebar + chat area. Chat area gets ~70% of horizontal space.
- **Tablet (768–1023px)**: Sidebar collapses or becomes a top toggle; chat area takes full width. Composer remains fixed bottom.
- **Mobile (<768px)**: Full-screen chat view (sidebar hidden, accessible via hamburger). Tab navigation becomes a scrollable row. Chat feels like a native mobile messaging app.

**Accessibility**:
- Tab is keyboard-selectable from the tab navigation bar
- Message thread is a live region that announces new messages
- Composer is a standard textarea with clear label ("Message [Space Name]")
- Search triggers are keyboard-accessible
- Focus management: Opening the tab focuses the composer (ready to type)

**Personas**:
- **Contributor**: Opens the Chat tab while browsing the Space — asks a quick question about a post, coordinates with teammates, shares a link. Doesn't leave the Space context.
- **Facilitator**: Uses the Chat tab as their primary coordination tool within the Space — announces schedule changes, answers questions, shares quick updates that don't warrant a formal Post. Keeps the Space's pulse alive.
- **Portfolio Owner**: Occasionally visits a Space's Chat tab to get a feel for activity levels and team health — is the conversation flowing? Are people engaged? A passive but valuable ambient signal.

---

# Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Panel vs. page for Messaging Hub | Sliding panel from right | Keeps user in their current context; consistent with "don't leave your Space" principle |
| Filter tabs in Hub | All / Direct / Groups / Spaces | Low number of categories; pills are fast to scan |
| Group avatar shape | Rounded square | Visual differentiation from circular individual avatars |
| Space Channel in Hub vs. Tab | Both (dual access) | Hub for triage, Tab for engagement — same data, two modes |
| Chat tab position | After Knowledge Base | Least disruptive addition; chat is supplementary to structured content |
| Message deletion UI | Deferred to later phase | Keeps v1 focused on communication, not administration |
| Moderation UI | Deferred to later phase | Framework exists in data model; UI comes when policies are defined |
| Status Updates vs. Channel | Separate for v1 | Different interaction models (1-to-many vs. many-to-many); future convergence via pinned messages |
| History retention UI | In Space Settings, not in chat | Admin concern, not a daily-use UI element |
| Message pace expectation | Low traffic (few/day) | Drives generous whitespace, no infinite scroll, "Load more" pattern |
| Online/presence indicators | Optional for v1 | Low traffic means presence is less critical; can add later |
| Notification strategy | In-app + push; no email | Email is too heavy for coordination chat; push covers urgency |

---

# Appendix: Notification Model (v1)

| Event | In-App | Push | Override if Muted |
|-------|--------|------|-------------------|
| New DM message | ✓ | ✓ | No |
| New Group message | ✓ | ✓ | No |
| New Space Channel message | ✓ | ✓ | No |
| @mention (any context) | ✓ | ✓ | **Yes** — always notifies |
| Reaction on your message | ✓ | ✗ | No |
| Added to a group | ✓ | ✓ | No |
| Removed from a group | ✓ | ✗ | No |

Per-conversation mute and Do Not Disturb schedule override all non-mention notifications.

---

# Appendix: Figma Make Prototype Guidance

When prototyping these screens in Figma Make, consider this sequence:

1. **Screen M1**: Messaging Hub (closed state — just the top-nav chat icon with unread badge)
2. **Screen M2**: Messaging Hub (open state — panel with conversation list, "All" filter active, showing a mix of DMs, groups, and Space channels)
3. **Screen M3**: Messaging Hub → DM chat view (1:1 conversation open)
4. **Screen M4**: Messaging Hub → Group chat view (group conversation open, showing member avatars in header)
5. **Screen M5**: Messaging Hub → Space Channel view (Space channel open, showing "View Space" in menu)
6. **Screen M6**: Space Home with CHAT tab visible in tab bar (unread badge on tab)
7. **Screen M7**: Space CHAT tab active — full chat experience inside the Space
8. **Screen M8**: New Group creation flow (3-step: select users → name + avatar → created)

For Smart Animate transitions:
- M1 → M2: Panel slides in from right
- M2 → M3/M4/M5: Conversation list slides left, chat view slides in from right (back arrow appears)
- M6 → M7: Tab switch (horizontal slide or instant swap)

Use the platform's standard design system for all components (see `design-system-page.md`).
