# Brief 1: Unified Messaging System — Side Panel Overlay

> **Integration Pattern**: Space Channel accessed via a **side panel that overlays Space content** (like Figma's comment panel)  
> **Scope**: Complete messaging system — 1:1 DMs, Group Chats, Space Channels + Messaging Hub  
> **Date**: February 12, 2026  
> **Status**: Draft — design option 1 of 4  
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

## What Makes This Brief Unique: The Side Panel Overlay

This brief uses a **side panel overlay** for the Space Channel when accessed from inside a Space. Think of how Figma shows its comments panel — it slides in from the right, overlays the canvas, and you can interact with it while still seeing the underlying content.

**Why this pattern:**
- User stays in the Space context — they can see the posts, knowledge base, or subspaces behind the panel
- Quick access without full page navigation — one click to open, one click to close
- Feels lightweight and temporary — appropriate for a low-traffic coordination channel
- The panel can be opened from any Space tab (Home, Community, Subspaces, Knowledge Base)

**Trade-offs:**
- Panel overlays content — on smaller screens, the content behind is partially hidden
- Not a first-class citizen in the information architecture (no dedicated tab)
- Users may not discover it as easily as a tab
- Limited width for the chat experience (similar to the Hub panel)

---

## Design Principle: One Home, Two Entry Points

All conversations — 1:1 DMs, Group Chats, and Space Channels — live in **one unified Messaging Hub**. Users have a single place to see all their conversations, with filters to focus on what they need.

But Space Channels also have a **second entry point**: a side panel accessible from within the Space. This dual-access pattern means:
- From the **Messaging Hub**: "I want to check all my conversations" — DMs, groups, and space channels are all here.
- From **inside a Space**: "I want to talk to my Space team without leaving" — the panel slides in over the current Space content.

Same channel, same messages, same state — two optimized entry points for two modes.

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
   - For Space channels: show Space avatar + Space name, with a subtle channel icon (📢 or `#`) to distinguish from group chats
   - For Group chats: show group avatar + group name
   - For DMs: show user avatar + user name
   - **Empty state**: "No conversations yet. Start a message to connect with your team."

4. **New Conversation Flow** (triggered by "New Message" button)
   - Step 1: Choose type — "Direct Message", "New Group", or browse your Space channels
   - For DM: Search and select a user → opens chat
   - For Group: Search and select multiple users → name the group → select avatar → create → opens chat
   - For Space channels: Not created here — they exist automatically. But the user can browse/pin them from this flow.

5. **Panel Behavior**
   - Clicking a conversation opens the **Chat View** (Sections 2/3/4 depending on type) inside the panel
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

## Section 2: 1:1 Direct Messages (Chat View)

**Context**: Opened from the Messaging Hub conversation list, or via the envelope icon on a user's profile  
**Container**: Inside the Messaging Hub panel, replacing the conversation list when a DM is selected  
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
   - @mentions: Typing `@` in the composer triggers a user search dropdown

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

## Section 3: Group Chats (Chat View)

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
   - Same chat bubble pattern as 1:1 DMs (Section 2)
   - **Key difference**: Each message from another member shows their avatar + name above the bubble (or on first message in a group of consecutive messages)
   - All message features from Section 2 apply: rich text, attachments, reactions, reply-to, edit (own), emoji
   - @mentions: Typing `@` shows a dropdown of all group members; mentioned users receive a notification even if they've muted the group

3. **Message Composer**
   - Identical to 1:1 DM composer (Section 2)
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

**Responsive Behavior**: Same as DM view (Section 2)

**Accessibility**:
- Group name announced in header region
- Member management dialog is keyboard-navigable (Tab through members, Enter to remove/add)
- "Leave group" has a confirmation step to prevent accidental exits

**Personas**:
- **Contributor**: Creates or joins groups for cross-space coordination with a few collaborators
- **Facilitator**: Uses groups for back-channel planning with co-leads, private coordination outside the Space channel
- **Portfolio Owner**: Creates groups with facilitators across their portfolio for strategic alignment

---

## Section 4: (Sub)-Space Channel — Side Panel Overlay

**Context**: Accessed from a **chat icon or button within the Space UI** — slides in as a panel overlaying the current Space content  
**Container**: Right-aligned side panel (~380–420px wide), overlaying the Space's main content area  
**Also accessible via**: The Messaging Hub (where it appears in the conversation list alongside DMs and Groups)  
**Audience**: All members of the (Sub)-Space

### Design Brief

You are designing the **Space Channel as a side panel that overlays Space content** — like Figma's comment panel or Google Docs' chat sidebar. When a member is working in a Space — reading posts, browsing the knowledge base, checking subspaces — they can open the Space chat panel without leaving their current view. The content stays visible behind the panel, and the conversation slides in on top.

**Why a side panel overlay**: The user's primary task is the Space content — posts, knowledge, subspaces. The chat is a supporting layer, not the main event. By overlaying rather than replacing the content, we signal: "This is a quick conversation you can have while working." It respects the user's current context.

**How it works alongside the Messaging Hub**: The Space Channel appears in **two places**:
1. In the **Messaging Hub** (Section 1) — as a conversation in the unified list, accessed via the top-nav chat icon
2. In the **Space itself** — as this side panel, accessed via a chat icon in the Space UI

Same channel, same messages, same state. Two entry points.

**Key Elements**:

1. **Trigger** (how users open the panel from within a Space)
   - **Chat icon** in the Space's top navigation area (near the settings, share, and activity icons)
   - Icon shows an unread badge (dot or count) when there are new messages
   - Clicking the icon slides the panel in from the right edge
   - Clicking again (or ×) closes the panel
   - The chat icon is visible on all Space tabs (Home, Community, Subspaces, Knowledge Base)

2. **Panel Container**
   - Slides in from the right edge of the viewport
   - Width: ~380–420px (similar to Messaging Hub panel width)
   - Height: Full viewport height (below the top navigation bar)
   - **Overlays** the Space content — does NOT push the layout left
   - Semi-transparent backdrop behind the panel (subtle dim, ~10–15% opacity) — or no backdrop, just a shadow edge
   - Panel has a visible left edge (shadow or border) to separate it from the content underneath

3. **Panel Header**
   - Space name + "Channel" label (e.g., "Climate Action NL — Chat")
   - Member count (e.g., "24 members")
   - Close button (×) — closes the panel, returns to full Space view
   - Three-dot menu:
     - **View in Messages** → opens this channel in the Messaging Hub (switches context to the Hub panel)
     - **View Members** → shows the Space member list (read-only)
     - Mute Notifications
     - Set Do Not Disturb schedule
   - Note: **No "Leave" or "Manage Members"** — membership follows the Space

4. **Message Thread**
   - Same chat bubble pattern as Group Chats (Section 3) — each message shows sender avatar + name
   - All message features apply: rich text, attachments, reactions, reply-to, edit (own), emoji, @mentions
   - @mentions dropdown shows all Space members
   - **History**: Controlled by Admin via Space Settings (30 days / 90 days / 1 year / Forever). New members see history based on the admin's setting.
   - Date separators, message grouping, "Load more" — all identical to other chat views

5. **Message Composer** (fixed at bottom of panel)
   - Same composer as all other chat views (Sections 2/3)
   - Rich text toolbar, attachments, emoji picker, @mentions, send on Enter
   - Width matches panel width (~380px) — compact but functional

6. **Channel Lifecycle** (automatic)
   - Created automatically when a Space is created
   - Deleted when a Space is deleted
   - Privacy matches Space privacy level
   - Admin can enable/disable in Space Settings — if disabled, the chat icon disappears from the Space UI

7. **Panel + Space Content Interaction**
   - When the panel is open, users can still scroll the Space content behind it (on desktop, the content area is partially visible)
   - Clicking on Space content (a post, a link, a subspace card) while the panel is open:
     - Navigate as normal — the panel stays open through navigation within the Space
     - If navigation leaves the Space entirely, the panel closes
   - Users can work in the Space while keeping an eye on the chat

**Visual Requirements**:
- Panel feels like a **layer on top** — subtle shadow on the left edge, the Space content is visible but slightly dimmed behind it
- Panel background matches the platform's surface color (white or very light gray) — solid, not transparent
- Chat bubbles, composer, reactions — all identical styling to the Hub views (consistent experience)
- The chat trigger icon should be subtle but discoverable — near the existing Space utility icons (settings, share)
- Unread badge on the trigger icon uses the same badge styling as other notification indicators
- Transition: Smooth slide-in from right (200–300ms ease-out)

**Empty State**: "This is the [Space Name] channel. Start a conversation with your Space team! 👋"

**Edge States**:
- User joins the Space → automatically has access; sees history per admin retention setting
- User leaves the Space → loses access; channel disappears from Hub list and panel is no longer openable
- Admin disables channel → chat icon disappears from Space UI; channel disappears from Hub
- Admin changes retention policy → affects visible history going forward
- Space is deleted → channel deleted, conversations gone

**Responsive Behavior**:
- **Desktop (1024px+)**: Side panel overlays right ~380px, Space content partially visible behind. Panel can be opened on any Space tab.
- **Tablet (768–1023px)**: Panel takes ~50% width or full width with a back gesture
- **Mobile (<768px)**: Full-screen overlay (panel replaces the Space view). Back button returns to Space. Feels like opening a native chat screen.

**Accessibility**:
- Chat trigger icon has aria-label: "Open Space chat" (with unread count if applicable)
- Panel focus trap when open
- Escape closes the panel
- Screen reader announces panel open/close state
- All chat accessibility patterns from Sections 2/3 apply

**Personas**:
- **Contributor**: Sees the chat icon while browsing the Space. Opens the panel to ask a quick question about a post, then closes it and continues reading. Doesn't lose their scroll position.
- **Facilitator**: Keeps the panel open while reviewing posts or managing the knowledge base. Responds to member questions between tasks. The panel is their ambient communication window.
- **Portfolio Owner**: Opens the panel briefly to check conversation activity — is the team engaged? Then closes it to continue their strategic review.

---

## Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Space Channel integration | Side panel overlay | Preserves Space context; chat is a supporting layer, not primary content |
| Panel vs. page for Hub | Sliding panel from right | Keeps user in their current context |
| Filter tabs in Hub | All / Direct / Groups / Spaces | Low number of categories; pills are fast to scan |
| Group avatar shape | Rounded square | Visual differentiation from circular individual avatars |
| Space Channel entry points | Hub + Space side panel | Hub for triage, panel for in-context quick chat |
| Message deletion UI | Deferred to later phase | Keeps v1 focused on communication |
| Moderation UI | Deferred to later phase | Framework exists in data model; UI later |
| Status Updates vs. Channel | Separate for v1 | Future convergence via pinned messages |
| History retention UI | In Space Settings | Admin concern, not a daily-use element |
| Message pace expectation | Low traffic (few/day) | Generous whitespace, "Load more" pattern |
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

Per-conversation mute and Do Not Disturb schedule override all non-mention notifications.

---

## Appendix: Figma Make Prototype Guidance

Suggested screen sequence for this variant:

1. **Screen M1**: Top-nav chat icon with unread badge (closed state)
2. **Screen M2**: Messaging Hub open — conversation list with All filter, showing DMs + groups + Space channels
3. **Screen M3**: Hub → DM chat view open
4. **Screen M4**: Hub → Group chat view open (member avatars in header)
5. **Screen M5**: Hub → Space Channel view open (showing "View Space" in menu)
6. **Screen M6**: Space Home page — chat icon visible in Space utility bar (with unread badge)
7. **Screen M7**: Space Home page + side panel open — chat overlays Space content
8. **Screen M8**: New Group creation flow (3-step)

Smart Animate transitions:
- M1 → M2: Panel slides in from right
- M2 → M3/M4/M5: Conversation list slides left, chat slides in
- M6 → M7: Side panel slides in from right, Space content dims slightly
- M7 → M6: Panel slides out

Use the platform's standard design system (`design-system-page.md`).
