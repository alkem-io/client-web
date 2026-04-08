# Brief 2: Unified Messaging System — Persistent Resizable Drawer

> **Integration Pattern**: Space Channel accessed via a **persistent drawer that can be resized** (like Slack's thread panel)  
> **Scope**: Complete messaging system — 1:1 DMs, Group Chats, Space Channels + Messaging Hub  
> **Date**: February 12, 2026  
> **Status**: Draft — design option 2 of 4  
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

## What Makes This Brief Unique: The Persistent Resizable Drawer

This brief uses a **persistent drawer** for the Space Channel when accessed from inside a Space. Think of how Slack shows a thread panel — it docks to the right side of the layout, pushes the main content to the left, and the user can drag its edge to resize it. The drawer persists as the user navigates between Space tabs.

**Why this pattern:**
- The drawer is **persistent** — it doesn't close when you switch from Home to Knowledge Base. The conversation stays visible across your Space workflow.
- User controls how much space the chat takes — drag the left edge to make it wider (more conversation focus) or narrower (more content focus)
- Both content and chat are fully visible and interactive simultaneously — no overlap, no hidden content
- Feels like a **split-screen workspace** — content on the left, conversation on the right

**Trade-offs:**
- Pushes the Space content narrower — on smaller screens, the content may feel cramped
- More complex layout management (responsive concerns, minimum widths)
- The persistent nature means it's always taking space once opened — may feel heavy for users who rarely use chat
- Resizable handle adds interaction complexity

---

## Design Principle: One Home, Two Entry Points

All conversations — 1:1 DMs, Group Chats, and Space Channels — live in **one unified Messaging Hub**. Users have a single place to see all their conversations, with filters to focus on what they need.

But Space Channels also have a **second entry point**: a persistent drawer within the Space. This dual-access pattern means:
- From the **Messaging Hub**: "I want to check all my conversations" — DMs, groups, and space channels are all here.
- From **inside a Space**: "I want to talk to my Space team while working" — the drawer opens beside the content and stays open.

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
   - Each conversation item shows:
     - **Avatar**: User photo (DM), group avatar (group), Space avatar/thumbnail (Space channel)
     - **Name**: User name (DM), group name (group), Space name (Space channel)
     - **Type badge** (subtle): Small icon or label distinguishing DM / Group / Space — especially useful in "All" view
     - **Preview**: Last message snippet (truncated, ~60 chars)
     - **Timestamp**: Relative ("2m ago", "Yesterday", "Feb 10")
     - **Unread indicator**: Bold text + dot/badge for unread conversations
     - **Muted indicator** (if applicable): Subtle muted icon overlay
   - For Space channels: show Space avatar + Space name, with a subtle channel icon (📢 or `#`)
   - For Group chats: show group avatar + group name
   - For DMs: show user avatar + user name
   - **Empty state**: "No conversations yet. Start a message to connect with your team."

4. **New Conversation Flow** (triggered by "New Message" button)
   - Step 1: Choose type — "Direct Message", "New Group", or browse your Space channels
   - For DM: Search and select a user → opens chat
   - For Group: Search and select multiple users → name the group → select avatar → create → opens chat
   - For Space channels: Not created here — they exist automatically. User can browse/pin them.

5. **Panel Behavior**
   - Clicking a conversation opens the **Chat View** (Sections 2/3/4) inside the panel
   - Back arrow returns to the conversation list
   - Panel persists across page navigation
   - Panel can be dismissed (×) and reopened; state is preserved
   - Unread badge on the top-nav chat icon reflects total unread across all conversation types

**Visual Requirements**:
- Clean, minimal list — no heavy borders or box shadows between items
- Clear visual hierarchy: Name > Preview > Timestamp
- Avatar shape as primary differentiator (circular for people, rounded-square for groups, Space avatar for channels)
- Unread conversations: bold + dot or subtle background highlight
- Smooth slide-in animation when opening
- "Load more" at bottom

**Responsive Behavior**:
- **Desktop (1024px+)**: Sliding panel from right edge (~380px wide), overlays content
- **Tablet (768–1023px)**: Full-width panel or side drawer (~50% width)
- **Mobile (<768px)**: Full-screen overlay with back navigation

**Accessibility**:
- Focus trapped in panel when open
- Keyboard: Tab through conversations, Enter to open, Escape to close
- Screen reader: Announce conversation type, name, last message, unread status

**Personas**:
- **Contributor**: Checks DMs and group chats; glances at Space channels
- **Facilitator**: Triages Space channels, groups, and DMs from one place
- **Portfolio Owner**: Monitors Space channels across portfolio

---

## Section 2: 1:1 Direct Messages (Chat View)

**Context**: Opened from the Messaging Hub conversation list, or via the envelope icon on a user's profile  
**Container**: Inside the Messaging Hub panel, replacing the conversation list when a DM is selected  
**Audience**: Any two authenticated users

### Design Brief

You are designing the **1:1 Direct Message chat view** — a simple, focused conversation between two people.

**Why DMs matter**: Before group chats and channels, there's the fundamental need to reach one person directly. "Can you take a look?" "Are you free Thursday?" DMs are the glue that turns platform acquaintances into collaborators.

**Key Elements**:

1. **Chat Header** (top of chat view)
   - Back arrow (returns to conversation list)
   - User avatar (circular) + user name
   - Online/offline indicator (subtle dot) — optional for v1
   - Three-dot menu: View Profile, Mute Notifications, Set Do Not Disturb schedule

2. **Message Thread** (scrollable, main area)
   - Chat bubbles:
     - **Own messages**: Right-aligned, primary brand color background, white text
     - **Their messages**: Left-aligned, light gray/neutral background, dark text
   - Each message: content, timestamp, "Edited" tag (if edited), emoji reactions (pill badges)
   - **Message grouping**: Consecutive messages from same sender within ~2 min grouped
   - **Date separators**: "Today", "Yesterday", "February 10, 2026"
   - **Scroll**: Opens at most recent; "Load more" at top for history

3. **Message Composer** (fixed at bottom)
   - Auto-expanding text input
   - Rich text toolbar: Bold, italic, strikethrough, code, link; Markdown shortcuts
   - Action icons: 📎 Attach, 😀 Emoji picker, Send (Enter; Shift+Enter for new line)
   - @mentions trigger user search dropdown

4. **Message Interactions** (hover or long-press)
   - React (quick-react row + full picker), Reply (quote), Edit (own only)
   - Delete: **Not in v1**

5. **Attachments**: Inline image preview, audio/video playback, document download (25MB limit)

6. **Notification Preferences** (per-conversation via menu): Mute, DND schedule

**Visual Requirements**:
- Soft rounded corners, generous padding on bubbles
- Clear own/theirs distinction (color + alignment)
- Reactions as small pills below messages
- Reply-to as quoted preview above new message
- Inline attachments; composer always fixed at bottom
- Low-traffic: generous whitespace, large readable text

**Empty State**: "This is the start of your conversation with [User Name]. Say hello! 👋"

**Responsive**: Panel width on desktop; full-screen on mobile

**Accessibility**: Screen reader announces sender/content/time; keyboard reactions; aria-label on composer

---

## Section 3: Group Chats (Chat View)

**Context**: Opened from Messaging Hub, or created via "New Message" → "New Group"  
**Container**: Inside the Messaging Hub panel  
**Audience**: Group members

### Design Brief

You are designing the **Group Chat view** — an ad-hoc conversation between multiple people. Groups are self-organizing: any member can add or remove others.

**Why Group Chats matter**: Not every conversation belongs in a Space. Group chats fill the gap between DMs (too private) and Space Channels (too broad).

**Key Elements**:

1. **Chat Header**
   - Back arrow, group avatar (rounded-square) + group name, member count
   - Three-dot menu: Manage Members, Group Info, Mute, DND, Leave Group (with confirmation)

2. **Message Thread**
   - Same as DMs (Section 2) but each message shows sender avatar + name
   - @mentions dropdown shows group members; mentioned users notified even if muted

3. **Message Composer**: Identical to DMs; @mentions show group members

4. **Member Management Dialog**
   - Current members list with "Remove" per member
   - Add member search (all platform users; existing members filtered out)
   - Any member can add/remove (no special permissions in v1)
   - Minimum 2 members + creator; added members see full history; removed members lose access immediately

5. **Group Creation Flow** (3 steps: select users → name + avatar → create)
   - Cannot convert 1:1 DM to group

6. **Leave Group**: Chat disappears from list; group continues; re-added users see full history

**Visual Requirements**: Rounded-square group avatars; stacked member avatars in header; sender identity on messages; clean member management dialog

**Empty State**: "Welcome to [Group Name]! Start the conversation. 💬"

**Responsive / Accessibility**: Same patterns as DMs

**Personas**:
- **Contributor**: Cross-space coordination with a few collaborators
- **Facilitator**: Back-channel with co-leads
- **Portfolio Owner**: Strategic alignment groups across portfolio

---

## Section 4: (Sub)-Space Channel — Persistent Resizable Drawer

**Context**: Accessed from a **chat icon in the Space UI** — opens a persistent drawer docked to the right side that pushes the Space content left  
**Container**: Right-docked drawer panel, resizable by dragging its left edge  
**Also accessible via**: The Messaging Hub (where it appears in the conversation list)  
**Audience**: All members of the (Sub)-Space

### Design Brief

You are designing the **Space Channel as a persistent, resizable drawer** docked to the right side of the Space layout. Think of Slack's thread panel: it opens beside the main content, pushes the content left to make room, and the user can drag the divider to allocate space between content and conversation. The drawer **stays open** as the user switches between Space tabs (Home, Community, Subspaces, Knowledge Base).

**Why a persistent drawer**: This pattern treats chat as a **co-equal workspace panel**, not a temporary overlay. The user's layout says: "I'm doing two things — working on Space content AND having a conversation." The resize handle gives users control over the balance. The persistence across tabs means the conversation is always present without needing to re-open it.

**How it works alongside the Messaging Hub**: Same dual-access as other briefs:
1. In the **Messaging Hub** — as a conversation in the unified list
2. In the **Space** — as this persistent drawer

Same channel, same messages, same state.

**Key Elements**:

1. **Trigger** (how users open the drawer from within a Space)
   - **Chat icon** in the Space's top navigation area (near settings, share, activity icons)
   - Icon shows an unread badge when there are new messages
   - Clicking the icon opens the drawer — the Space content area shrinks to accommodate
   - Clicking again (or ×) closes the drawer — content returns to full width
   - The chat icon is visible on all Space tabs

2. **Drawer Container**
   - Docked to the right side of the Space layout (below the top navigation bar, beside the Space content)
   - **Pushes content left** — the Space's main content area (posts, cards, knowledge base) reflows to a narrower width
   - **Resizable**: A draggable divider (left edge of drawer) allows the user to resize
     - Default width: ~350px
     - Minimum width: ~300px (below this, content becomes unreadable)
     - Maximum width: ~50% of viewport (beyond this, Space content is too cramped)
     - Drag handle: Subtle vertical line or dots on the divider; cursor changes to `col-resize` on hover
   - **Persistent across tab navigation**: Opening the drawer on the Home tab keeps it open when switching to Community, Subspaces, or Knowledge Base. Only closing the drawer (×) or leaving the Space hides it.
   - **State remembered**: If the user closes the drawer and reopens it, it returns to the last width

3. **Drawer Header**
   - Space name + "Chat" label (e.g., "Climate Action NL — Chat")
   - Member count (e.g., "24 members")
   - Close button (×) — closes the drawer, content returns to full width
   - Three-dot menu:
     - **View in Messages** → opens this channel in the Messaging Hub
     - **View Members** → Space member list (read-only)
     - 🔍 **Search in chat** → filter messages by keyword
     - Mute Notifications
     - Set Do Not Disturb schedule
   - Note: **No "Leave" or "Manage Members"** — membership follows the Space

4. **Message Thread**
   - Same chat bubble pattern as Group Chats (Section 3) — sender avatar + name
   - All message features: rich text, attachments, reactions, reply-to, edit (own), emoji, @mentions
   - @mentions dropdown shows all Space members
   - **History**: Controlled by Admin via Space Settings (30 days / 90 days / 1 year / Forever)
   - Date separators, message grouping, "Load more" — identical to other views
   - Messages and attachments adapt to the drawer's current width (images scale, text wraps)

5. **Message Composer** (fixed at bottom of drawer)
   - Same composer as all other chat views
   - Width adapts to drawer width — wider drawer = more comfortable typing area
   - On narrow widths (~300px), the rich text toolbar collapses to an icon-only row

6. **Channel Lifecycle** (automatic)
   - Created automatically when Space is created
   - Deleted when Space is deleted
   - Privacy matches Space privacy level
   - Admin can enable/disable in Space Settings — if disabled, chat icon disappears

7. **Layout Interaction: Drawer + Space Content**
   - The Space content area (posts, cards, grids) **reflows** when the drawer opens:
     - Card grids reduce column count (e.g., 4 → 3 columns, or 3 → 2)
     - Activity feed posts shrink width but remain readable
     - Knowledge base content wraps to narrower layout
   - The left sidebar (if present) stays at its normal width — only the main content area shrinks
   - **Minimum content width**: If the drawer + sidebar would leave less than ~400px for content, the drawer cannot be expanded further (max constraint hit)
   - **Responsive reflow is smooth** — no jarring jumps; content transitions as the drawer resizes (use CSS Grid or Flexbox)

**Visual Requirements**:
- Drawer feels like a **docked panel** — part of the layout, not floating over it
- Clear divider line between content and drawer (1px border or subtle shadow)
- Drag handle is subtle but discoverable — visible on hover, cursor changes to `col-resize`
- Drawer background matches platform surface color (same as the main content area)
- Chat styling inside the drawer is identical to all other chat views — consistent experience regardless of width
- When content reflows around the drawer, it should feel natural — no content truncation, no horizontal scrolling
- Transition: Opening/closing the drawer uses a smooth width animation (200–300ms)

**Empty State**: "This is the [Space Name] channel. Start a conversation with your Space team! 👋"

**Edge States**:
- User joins Space → access to channel; sees history per admin setting
- User leaves Space → loses access; drawer is no longer available
- Admin disables channel → chat icon disappears; drawer unavailable
- Admin changes retention → affects visible history
- Space deleted → channel deleted
- Very narrow viewport → drawer cannot open (falls back to full-screen overlay behavior)

**Responsive Behavior**:
- **Desktop (1024px+)**: Full persistent drawer experience with resize handle. Default ~350px, content reflows.
- **Tablet (768–1023px)**: Drawer takes ~40% width; no resize handle (fixed width to avoid layout complexity on touch). Content area gets ~60%.
- **Mobile (<768px)**: Drawer is NOT persistent. Instead, opening chat switches to a full-screen chat view (back button returns to Space). Persistent drawer doesn't work at mobile widths.

**Accessibility**:
- Drag handle is keyboard-accessible (arrow keys to resize, Enter/Space to toggle)
- Announce drawer open/close state
- Content reflow does not disrupt screen reader flow
- All chat accessibility patterns from Sections 2/3 apply
- Drawer close button (×) is reachable via keyboard

**Personas**:
- **Contributor**: Opens the drawer while browsing posts. Resizes it narrow to keep most of the screen for content. Asks a quick question, gets an answer, continues working.
- **Facilitator**: Keeps the drawer open at ~40% width while managing the Space. Monitors the conversation between task switches. The persistent nature means they never lose the chat context.
- **Portfolio Owner**: Opens the drawer briefly to scan conversation activity. Closes it when done. Values the ability to see both content and chat simultaneously.

---

## Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Space Channel integration | Persistent resizable drawer | True split-screen; user controls space allocation; chat persists across tabs |
| Panel vs. page for Hub | Sliding panel from right | Keeps user in current context |
| Filter tabs in Hub | All / Direct / Groups / Spaces | Low number of categories |
| Group avatar shape | Rounded square | Visual differentiation |
| Space Channel entry points | Hub + Space drawer | Hub for triage, drawer for co-working |
| Drawer default width | ~350px | Balance between chat readability and content space |
| Drawer persistence | Stays open across Space tabs | Chat is a workspace companion, not a one-shot interaction |
| Message deletion UI | Deferred | v1 focus on communication |
| Moderation UI | Deferred | Framework exists; UI later |
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
6. **Screen M6**: Space Home — chat icon in utility bar (drawer closed, full-width content)
7. **Screen M7**: Space Home — drawer open (~350px), content reflows to narrower width
8. **Screen M8**: Space Home — drawer resized wider (~45%), content narrower
9. **Screen M9**: Space Knowledge Base tab — drawer still open (persistent)
10. **Screen M10**: New Group creation flow

Smart Animate transitions:
- M6 → M7: Content area shrinks, drawer slides in from right edge
- M7 → M8: Divider moves left, drawer widens, content shrinks (drag animation)
- M7 → M9: Tab switch — drawer stays open, content area swaps

Use the platform's standard design system (`design-system-page.md`).
