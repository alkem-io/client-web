# Brief 5: (Sub)-Space Channel Only — Full Chat Tab

> **Integration Pattern**: Space Channel as a **full-page tab** within the Space — no Messaging Hub, no DMs, no Group Chats  
> **Scope**: Space Channel ONLY — standalone real-time chat for Space members  
> **Date**: February 12, 2026  
> **Status**: Draft — standalone option (no unified messaging system)  
> **Related**: [server#5829](https://github.com/alkem-io/server/issues/5829), [alkemio#1741](https://github.com/alkem-io/alkemio/issues/1741)  
> **Protocol**: Matrix

---

## How This Brief Differs

Briefs 1–4 describe a **complete messaging system** (DMs, Group Chats, Space Channels, plus a unified Messaging Hub). This brief describes **only the (Sub)-Space Channel** — a single, dedicated chat tab added to each Space. No Hub, no DMs, no Group Chats.

This is the most focused, lowest-scope option. It adds one capability — team chat inside a Space — without building an entire messaging platform. It matches the approach described in the original [Sub-Space Chat specification](https://github.com/alkem-io/server/issues/5829).

**When to choose this option:**
- You want to ship chat quickly with minimal scope
- DMs and Group Chats can wait for a future phase
- The priority is team coordination within Spaces, not person-to-person messaging
- You want to validate the chat concept before investing in a full messaging system

**Trade-offs:**
- Users who want to message individuals must still leave the platform (no DMs)
- No central inbox — each Space Channel is only accessible from within that Space
- If a user is in 10 Spaces, they must visit each Space to check for messages
- No Group Chat capability (cross-Space ad-hoc conversations impossible)
- Future expansion to DMs/Groups/Hub would require additional design work

---

## Why This Exists

### The Problem

Alkemio Spaces are structured around **outputs** — Subspaces, Posts, Knowledge Base items — but have no tool for the **informal coordination** that makes collaboration work. Facilitators answer the same questions repeatedly via email; contributors leave the platform for Slack or WhatsApp when they just need to ask a quick question; portfolio owners have no ambient signal of how a Space is doing.

The result: critical context leaks out of the platform, conversations are scattered across external tools, and Alkemio is only half the collaboration story.

### The Vision

Each Space gets a **built-in chat channel** — a persistent, real-time conversation that lives alongside the Space's content. Members can coordinate, ask questions, share links, and stay aligned without leaving the platform. It's not a replacement for structured Posts or Knowledge Base items; it's the **informal layer** that makes the structured work flow.

### Expected Communication Pace

This is a **low-traffic, coordination-style** channel — a few messages a day, not dozens per hour. The UI should be designed for clarity, readability, and generous whitespace. Messages are meaningful, not ephemeral.

### What's NOT In Scope

- 1:1 Direct Messages (separate feature, future phase)
- Group Chats (separate feature, future phase)
- Messaging Hub / Unified Inbox (not needed without DMs/Groups)
- Moderation UI (flagging, review, audit trail) — data model supports it, UI later
- Message deletion UI — later phase
- Read receipts, typing indicators
- Email notifications for messages
- Voice/video integration (Jitsi)
- AI agents/bots in chat
- Multiple channels per Space (one channel per Space)
- Blocking users

### Relationship to Status Updates

Status Updates from Leads remain a **separate feature**. The Space Channel is many-to-many; Status Updates are one-to-many from Leads. In a future version, a Status Update could become a pinned message in the Space Channel — but for now, they coexist independently.

---

## The (Sub)-Space Channel — Full Chat Tab

**Location**: A new tab in the Space's horizontal tab bar:  
`HOME | COMMUNITY | SUBSPACES | KNOWLEDGE BASE | CHAT`

**Container**: Full-page area (same content zone as other Space tabs)  
**Audience**: All members of the (Sub)-Space  
**Membership**: Automatically follows Space membership — no separate join/leave  
**Lifecycle**: One channel per Space, created with the Space, deleted with the Space

### Design Brief

You are designing the **Chat tab** — a full-page chat experience integrated as a first-class tab within each Space. When a user clicks the CHAT tab, they see a persistent group conversation shared by all Space members. This is the Space's "team room" — always there, always available, zero setup.

**Key Elements**:

1. **Tab Bar Integration**
   - "CHAT" tab appears as the last item in the Space tab bar
   - If the Space admin has disabled the channel, the tab does not appear
   - Unread indicator (dot or count badge) on the CHAT tab when unread messages exist
   - Active tab state follows the same visual pattern as other tabs (underline, highlight, etc.)

2. **Page Layout** (when CHAT tab is active)
   - **Left sidebar**: Same Space sidebar as other tabs (Space navigation, Subspace tree, etc.)
   - **Main content area**: The chat experience fills the full content zone
   - Two-zone layout within the content area:
     - **Chat header** (top, fixed)
     - **Message thread** (scrollable, fills remaining height)
     - **Composer** (bottom, fixed)
   - No additional sidebars or panels needed — the chat IS the page

3. **Chat Header** (fixed at top of content area)
   - **Channel name**: Space name + "Chat" (e.g., "Climate Action NL — Chat")
   - **Member count**: "24 members" — clickable to view member list (read-only, links to Community tab)
   - **Channel info / three-dot menu**:
     - View Members → navigates to Community tab
     - Mute Notifications
     - Set Do Not Disturb schedule
   - **No "Leave" or "Manage Members"** — membership follows the Space
   - **No channel settings** — admin controls are in Space Settings (see below)

4. **Message Thread** (scrollable main area)
   - **Message alignment**: Left-aligned, full-width — not bubble-style. Each message is a card or row:
     - Sender avatar (circular, Space member)
     - Sender name (bold)
     - Timestamp (relative: "2h ago", absolute on hover)
     - Message body (rich text: bold, italic, links, lists, code blocks)
     - "Edited" tag if modified
     - Emoji reactions (row of reaction pills below message)
   - **Message grouping**: Consecutive messages from the same sender within ~2 minutes collapse (no repeated avatar/name)
   - **Date separators**: "Today", "Yesterday", "February 10, 2026"
   - **History loading**: "Load more" button at top of thread. Scrolling up reaches the boundary of retained history (per admin setting)
   - **@mentions**: `@username` styled as highlighted chip; triggering an @mention notifies the user even if they've muted the channel
   - **Reply-to / quoting**: Users can reply to a specific message. The quoted message appears above the reply as a compact preview with a vertical accent bar.
   - **Attachments**:
     - Images: Inline thumbnail, click to view full-size in lightbox
     - Documents: Card with icon + filename + size, click to download
     - Audio/Video: Inline player
     - Max file size: 25MB
   - **Reactions**: Click reaction pill to add/remove; hover to see who reacted; "+" to add a new emoji reaction
   - **Edit own messages**: Available via hover menu or long-press. Shows "Edited" tag. No deletion in v1.
   - **Scroll behavior**: On new messages: if user is near bottom, auto-scroll; if scrolled up, show "New messages ↓" toast

5. **Message Composer** (fixed at bottom)
   - **Input field**: Auto-expanding textarea (1–5 lines visible, then scrolls)
   - **Rich text toolbar**: Bold, italic, strikethrough, link, code, bulleted list, numbered list. Visible by default (full-tab has room).
   - **Action buttons**: 📎 Attach file, 😀 Emoji picker, Send (arrow icon or Enter key)
   - **@mentions**: Typing `@` opens autocomplete dropdown showing Space members (avatar + name)
   - **Send**: Enter to send; Shift+Enter for newline
   - **Keyboard shortcuts**: Standard rich text shortcuts (Cmd+B, Cmd+I, etc.)

6. **Channel Lifecycle & Membership**
   - **Auto-created**: When a Space is created, its channel is created automatically
   - **Auto-deleted**: When a Space is deleted, its channel and all messages are deleted
   - **Membership follows Space**: When a user joins the Space, they can see the channel. When they leave, they lose access immediately.
   - **Privacy matches Space**: Public Space → channel visible to all members (not non-members); Private Space → channel visible only to members
   - **New member history**: When a user joins, they see message history per the admin-configured retention window (not full history from before they joined, unless admin sets "Forever")
   - **Admin enable/disable**: Space Admin can enable or disable the channel in Space Settings. Disabled = CHAT tab hidden, messages preserved (re-enable shows history)

7. **Space Settings: Channel Configuration** (for Admins)
   - Located in: Space Settings → Communication (or similar)
   - **Enable/Disable Channel**: Toggle on/off
   - **Message History Retention**: Dropdown — 30 days / 90 days / 1 year / Forever
   - **Moderation**: Framework exists in data model but no UI in v1. Future: auto-flag, manual review.

8. **Roles & Permissions**

   | Action | Admin | Lead | Member |
   |--------|-------|------|--------|
   | Send messages | ✓ | ✓ | ✓ |
   | Edit own messages | ✓ | ✓ | ✓ |
   | React to messages | ✓ | ✓ | ✓ |
   | Reply to messages | ✓ | ✓ | ✓ |
   | @mention members | ✓ | ✓ | ✓ |
   | Upload attachments | ✓ | ✓ | ✓ |
   | View member list | ✓ | ✓ | ✓ |
   | Enable/disable channel | ✓ | ✗ | ✗ |
   | Set history retention | ✓ | ✗ | ✗ |
   | Delete any message | Deferred (v2) | ✗ | ✗ |
   | Delete own message | Deferred (v2) | Deferred (v2) | Deferred (v2) |
   | Pin messages | Future | Future | ✗ |
   | Manage moderation | Future | ✗ | ✗ |

**Visual Requirements**:
- The CHAT tab should look and feel like a native part of the Space — same sidebar, same header, same design system
- Full-page width for messages gives generous reading space (unlike cramped panels or widgets)
- Message layout: left-aligned card rows, not chat bubbles. This communicates "team channel" not "personal chat"
- Generous whitespace between messages — low traffic means each message is worth reading
- Color: Sender names in brand color or neutral bold; own messages may have subtle background highlight but not right-aligned bubbles
- The page should feel calm and purposeful, not like a busy real-time chat room
- Use the platform's standard type scale, color palette, and component library (`design-system-page.md`)

**Empty State**: 
- When channel is enabled but no messages: "Welcome to [Space Name] chat! This is a shared conversation for all Space members. Start the discussion. 💬"
- Optional: Prompt suggestions — "Introduce yourself", "Share what you're working on"

**Edge States**:
- User joins Space → CHAT tab appears; sees history per retention setting
- User leaves Space → CHAT tab disappears; loses access
- Admin disables channel → CHAT tab hidden; messages preserved
- Admin re-enables channel → CHAT tab reappears; history intact
- Admin changes retention → older messages beyond new window are purged (soft delete)
- Space deleted → channel deleted
- No network connection → "Connection lost. Messages will be sent when you're back online." (queue locally)

**Responsive Behavior**:
- **Desktop (1024px+)**: Full-page layout as described. Sidebar + content area. Generous message width.
- **Tablet (768–1023px)**: Sidebar may collapse to hamburger menu. Content area takes full width.
- **Mobile (<768px)**: CHAT tab accessible from mobile tab bar. Full-screen chat view with compact header. Composer fixed at bottom with keyboard-aware positioning. Back button returns to Space.

**Accessibility**:
- CHAT tab is keyboard-navigable via tab bar
- Message thread is a live region for screen readers (ARIA live)
- Each message has accessible structure (sender, timestamp, content)
- Composer has clear label and role
- @mention autocomplete is keyboard-navigable
- Reactions are accessible via keyboard
- "Load more" button is focusable
- Focus management: entering CHAT tab places focus on composer or last message

**Notifications** (v1):
- **In-app**: Unread badge on CHAT tab; platform notification bell
- **Push**: New messages trigger push notification (unless muted)
- **@mention**: Always notifies, even if channel is muted
- **No email notifications** in v1
- Per-channel mute + Do Not Disturb schedule

**Personas**:
- **Contributor**: Opens the CHAT tab to ask a quick question: "Has anyone tested the new integration?" Gets an answer without creating a formal Post. Uses it alongside Knowledge Base research.
- **Facilitator**: Monitors the CHAT tab to stay aware of team conversations. Answers coordination questions. Uses @mentions to pull specific members into discussion. The full-page layout gives them room to read through history.
- **Portfolio Owner**: Clicks the CHAT tab occasionally to skim recent messages and sense how the Space is doing. The low-traffic pace means they can catch up quickly. Doesn't post often but reads regularly.

---

## Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Space Channel only | Smallest viable scope; validate chat before building full system |
| Integration pattern | Full tab in Space | First-class real estate; clean IA; no overlay complexity |
| Tab position | Last tab (after Knowledge Base) | Non-disruptive addition; easy to find |
| Message layout | Left-aligned rows, not bubbles | "Team channel" feel, not "personal chat" |
| One channel per Space | Yes | Simplicity; avoid channel sprawl |
| Membership model | Follows Space | Zero configuration; no separate join/leave |
| History retention | Admin-configurable | Different Spaces have different needs |
| Admin enable/disable | Yes | Not all Spaces need chat |
| No DMs or Group Chats | Correct | Separate future phase; out of scope |
| No Messaging Hub | Correct | Not needed without DMs/Groups |
| Moderation | Data model ready; no UI | Ship fast, add moderation UI later |
| Message deletion | Deferred to v2 | Simplifies v1; moderation handles edge cases later |
| Status Updates vs. Channel | Separate | Future convergence via pinned messages |
| Notification strategy | In-app + push; no email | Push covers urgency without email noise |

---

## Appendix: Notification Model (v1)

| Event | In-App | Push | Override if Muted |
|-------|--------|------|-------------------|
| New Space Channel message | ✓ | ✓ | No |
| @mention in channel | ✓ | ✓ | **Yes** — always notifies |
| Reaction on your message | ✓ | ✗ | No |

---

## Appendix: Future Expansion Path

If this brief is implemented first, the platform can expand to a full messaging system later:

1. **Phase 2**: Add 1:1 Direct Messages (see Briefs 1–4, Section 2)
2. **Phase 3**: Add Group Chats (see Briefs 1–4, Section 3)
3. **Phase 4**: Add Messaging Hub to unify all conversation types (see Briefs 1–4, Section 1)
4. **Phase 5**: Converge Status Updates into the Channel via pinned messages

Each phase is additive — the Space Channel built here remains unchanged.

---

## Appendix: Figma Make Prototype Guidance

Suggested screen sequence for this variant:

1. **Screen C1**: Space Home tab — CHAT tab visible in tab bar with unread badge
2. **Screen C2**: CHAT tab active — full-page chat view, empty state
3. **Screen C3**: CHAT tab — conversation with messages, attachments, reactions
4. **Screen C4**: CHAT tab — @mention autocomplete open
5. **Screen C5**: CHAT tab — reply-to a message (quoted message visible)
6. **Screen C6**: Space Settings → Communication → channel enable/disable + retention dropdown
7. **Screen C7**: Mobile view — CHAT tab full-screen

Smart Animate transitions:
- C1 → C2: Tab switch (CHAT tab becomes active, content swaps)
- C2 → C3: Messages appear (could be instant or animated entry)
- C3 → C4: @mention dropdown slides in from composer
- C3 → C5: Reply quote appears above composer

Use the platform's standard design system (`design-system-page.md`).
