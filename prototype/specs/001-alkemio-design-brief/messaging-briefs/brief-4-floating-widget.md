# Brief 4: Unified Messaging System — Floating Collapsible Widget

> **Integration Pattern**: Space Channel accessed via a **floating, collapsible widget** (like Intercom or a support chat bubble)  
> **Scope**: Complete messaging system — 1:1 DMs, Group Chats, Space Channels + Messaging Hub  
> **Date**: February 12, 2026  
> **Status**: Draft — design option 4 of 4  
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

## What Makes This Brief Unique: The Floating Collapsible Widget

This brief uses a **floating chat widget** — a persistent bubble anchored to the bottom-right corner of the Space — that expands into a chat window when clicked. Think Intercom, Drift, or a support chat bubble, but for internal team communication.

**Why this pattern:**
- **Always available** — the bubble is visible on every Space tab, every scroll position, always reachable
- **Zero layout impact** — the widget floats above the content; it never pushes, narrows, or interferes with the Space layout
- **Familiar metaphor** — users have seen this pattern thousands of times on websites; zero learning curve
- **Minimal visual weight** — collapsed, it's just a small bubble. It's present but unobtrusive.
- **Quick interactions** — expand, type a message, collapse. No tab switching, no navigation.

**Trade-offs:**
- The expanded widget has **limited real estate** — smaller than a panel, much smaller than a tab. Long conversations or rich content (images, attachments) feel cramped.
- Floats over content — may obscure bottom-right corner elements (CTAs, scroll-to-top, FAB buttons)
- Can feel "support-tool-ish" — some users may associate the bubble with customer support rather than team communication
- Less discoverable for first-time users who don't associate the bubble with team chat
- The widget is **not** a first-class part of the Space IA — it's an overlay, which may signal "secondary" importance

---

## Design Principle: One Home, Two Entry Points

All conversations — 1:1 DMs, Group Chats, and Space Channels — live in **one unified Messaging Hub**. Users have a single place to see all their conversations, with filters to focus on what they need.

But Space Channels also have a **second entry point**: a floating widget within the Space. This dual-access pattern means:
- From the **Messaging Hub**: "I want to check all my conversations" — DMs, groups, and space channels are all here.
- From **inside a Space**: "I want to quickly message my Space team" — the bubble is right there, one click away.

Same channel, same messages, same state. Two entry points.

---

## Section 1: The Messaging Hub (Unified Panel)

**Trigger**: Chat icon in the top navigation bar (replacing the current 1:1-only dialog)  
**Container**: Full-height sliding panel from right edge — persistent across navigation  
**Audience**: All authenticated users

### Design Brief

You are designing the **Messaging Hub** — the central panel where all conversations live. This replaces the current 1:1 chat dialog with a richer, unified messaging experience. Lighter, calmer, and purpose-built for low-traffic coordination.

**Key Elements**:

1. **Panel Header**: Title ("Messages"), "New Message" button, close (×)

2. **Filter / Segment Bar**: Pills — All / Direct / Groups / Spaces. Active filter highlighted; unread counts. Search input.

3. **Conversation List**: Sorted by recency. Each item: Avatar, Name, Type badge, Preview (~60 chars), Timestamp, Unread indicator, Muted indicator. Space channels show channel icon (📢 or `#`). Groups show rounded-square avatar. DMs show circular avatar. Empty state: "No conversations yet."

4. **New Conversation Flow**: Choose type → DM search, Group creation (3-step), or browse Space channels.

5. **Panel Behavior**: Opens chat views inside panel; back arrow returns; persists across navigation; dismissible; unread badge on top-nav icon.

**Visual**: Clean minimal list; avatar shape as differentiator; smooth slide-in; "Load more"

**Responsive**: Desktop ~380px panel → Tablet ~50% → Mobile full-screen

**Accessibility**: Focus trap, keyboard nav, screen reader

**Personas**: Contributor (checks DMs/groups), Facilitator (triages all), Portfolio Owner (monitors channels)

---

## Section 2: 1:1 Direct Messages (Chat View)

**Context**: Opened from Hub or via envelope icon on user profile  
**Container**: Inside Messaging Hub panel  
**Audience**: Two users

### Design Brief

**Key Elements**:

1. **Chat Header**: Back arrow, user avatar (circular) + name, optional online dot, three-dot menu (View Profile, Mute, DND)

2. **Message Thread**: Own messages right-aligned (brand color), theirs left-aligned (gray). Content, timestamp, "Edited" tag, emoji reactions. Message grouping (~2 min), date separators, "Load more" at top.

3. **Composer** (fixed bottom): Auto-expanding input, rich text toolbar, 📎 Attach, 😀 Emoji, Send (Enter). @mentions.

4. **Interactions** (hover/long-press): React, Reply (quote), Edit (own). Delete: not in v1.

5. **Attachments**: Inline images, audio/video playback, documents (25MB)

6. **Notifications**: Per-conversation mute, DND schedule

**Visual**: Soft bubbles, generous padding, inline attachments, fixed composer, low-traffic whitespace

**Empty State**: "This is the start of your conversation with [User Name]. Say hello! 👋"

**Responsive**: Panel on desktop; full-screen mobile

---

## Section 3: Group Chats (Chat View)

**Context**: Opened from Hub, or created via "New Message" → "New Group"  
**Container**: Inside Messaging Hub panel  
**Audience**: Group members

### Design Brief

**Key Elements**:

1. **Header**: Back arrow, group avatar (rounded-square) + name, member count, three-dot menu (Manage Members, Group Info, Mute, DND, Leave Group)

2. **Thread**: Same as DMs + sender avatar/name. @mentions show group members (notified even if muted).

3. **Composer**: Same as DMs; @mentions show group members

4. **Member Management**: Members list with "Remove"; add search (all users, existing filtered); any member manages; min 2+creator; added = full history; removed = immediate loss

5. **Creation** (3 steps): Select users → name + avatar → create. No 1:1 conversion.

6. **Leave**: Chat disappears; group continues; re-added = full history

**Visual**: Rounded-square avatar; stacked member avatars; sender identity on messages

**Empty State**: "Welcome to [Group Name]! Start the conversation. 💬"

---

## Section 4: (Sub)-Space Channel — Floating Collapsible Widget

**Context**: A floating chat bubble anchored to the bottom-right corner of the Space, visible on all Space tabs  
**Container**: Collapsed = small floating bubble; Expanded = floating chat window (~360×500px)  
**Also accessible via**: The Messaging Hub (where it appears in the conversation list)  
**Audience**: All members of the (Sub)-Space

### Design Brief

You are designing the **Space Channel as a floating, collapsible widget** — a persistent chat bubble anchored to the bottom-right corner of every Space page. When collapsed, it's a small circle with an unread badge. When expanded, it opens into a compact chat window floating above the Space content. Think Intercom, Drift, or a support chat bubble — but for team communication.

**Why a floating widget**: The chat is **always within reach** without any layout changes. The Space content stays at full width. The widget floats above everything — no tab switches, no panels, no drawers. It's the lightest-touch integration pattern.

**How it works alongside the Messaging Hub**: Same dual-access:
1. In the **Messaging Hub** — as a conversation in the unified list
2. In the **Space** — as this floating widget

Same channel, same messages, same state.

**Key Elements**:

1. **Collapsed State** (floating bubble)
   - **Position**: Bottom-right corner of the viewport, fixed/sticky (stays visible on scroll)
   - **Offset**: ~24px from right edge, ~24px from bottom edge (avoid overlapping with scrollbar or footer)
   - **Size**: ~56px circular button (or 48–64px depending on design system)
   - **Appearance**: 
     - Chat/speech-bubble icon centered in the circle
     - Space's brand/accent color as background, or platform primary color
     - Subtle drop shadow (elevation level 3) to float above content
   - **Unread badge**: Small red/orange dot or count badge on the top-right of the bubble
   - **Hover**: Slight scale-up (1.05x) + tooltip: "Space Chat"
   - **Click**: Expands to the chat window
   - **Visibility**: Appears on all Space tabs (Home, Community, Subspaces, Knowledge Base)
   - **If admin disabled the channel**: The bubble does not appear at all

2. **Expanded State** (floating chat window)
   - **Position**: Anchored to bottom-right, same corner as the bubble (bubble becomes the close/minimize button)
   - **Size**: ~360px wide × ~500px tall (fixed, not resizable in v1)
   - **Elevation**: Floats above all Space content (z-index above page content, below modals)
   - **Border**: Rounded corners (12–16px), subtle drop shadow (elevation level 4)
   - **Background**: Solid platform surface color (white/light gray)

3. **Chat Window Header** (top of expanded window)
   - Space name + "Chat" label (e.g., "Climate Action NL — Chat")
   - Member count (e.g., "24 members")
   - **Minimize button** (–) — collapses back to bubble state
   - **Expand button** (↗) — opens this channel in the Messaging Hub (full panel view for a richer experience)
   - Three-dot menu:
     - **View Space** → navigates to Space Home (if user is on a different tab)
     - **View Members** → Space member list (read-only)
     - Mute Notifications
     - Set Do Not Disturb schedule
   - Note: **No "Leave" or "Manage Members"** — membership follows the Space

4. **Message Thread** (scrollable area within the widget)
   - Same chat bubble pattern as Group Chats (Section 3) — sender avatar + name
   - All message features: rich text, attachments, reactions, reply-to, edit (own), emoji, @mentions
   - @mentions dropdown shows all Space members
   - **History**: Controlled by Admin via Space Settings (30 days / 90 days / 1 year / Forever)
   - Date separators, message grouping, "Load more" at top
   - **Compact adjustments for widget size**:
     - Messages use slightly smaller font and tighter padding than the Hub view
     - Inline images show as thumbnails (click to view full size in a lightbox)
     - Attachments show as compact cards (icon + filename, click to download)
     - Reactions render in a condensed row

5. **Message Composer** (fixed at bottom of widget)
   - Same composer as other views but **compact**:
     - Single-line input that auto-expands to max 3 lines
     - Rich text toolbar hidden by default — toggle via a formatting icon (⚙ or Aa)
     - Action icons: 📎 Attach, 😀 Emoji, Send
     - @mentions supported
   - Width: Full widget width (~360px) — compact but functional

6. **Channel Lifecycle** (automatic)
   - Created with Space; deleted with Space
   - Privacy matches Space
   - Admin enable/disable in Space Settings → bubble appears/disappears

7. **Widget + Space Content Interaction**
   - The widget floats **above** the Space content — no layout changes to the page
   - Space content remains scrollable and clickable behind the widget
   - The widget may obscure content in the bottom-right corner — acceptable trade-off; users can minimize
   - On pages with FAB (floating action button) or scroll-to-top button: widget should stack above those, or FAB should shift left when widget is present
   - Clicking outside the widget (on Space content) does **NOT** close/minimize it — the widget stays open until explicitly minimized

**Visual Requirements**:
- **Collapsed bubble**: Clean, circular, branded. Should look like a native part of the platform, not an embedded third-party widget. Use the platform's primary color, not generic blue.
- **Expanded window**: Card-like appearance with rounded corners and shadow. Should feel like a floating "mini-app" — self-contained, with clear boundaries.
- Chat bubbles inside the widget use the same styling as other views but at compact scale
- The minimize/expand buttons are clear and discoverable — minimize (–) collapses, expand (↗) opens in Hub
- Transition: Bubble expands into the window with a smooth scale/fade animation (200–300ms). Collapsing reverses.
- The widget should **not** look like customer support chat — avoid "How can we help?" copy, support-green colors, or bot-conversation patterns

**Empty State**: "This is the [Space Name] chat. Say hello to your team! 👋" (compact version, no illustration — space is limited)

**Edge States**:
- User joins Space → bubble appears; sees history per admin setting
- User leaves Space → bubble disappears; channel gone from Hub
- Admin disables channel → bubble disappears
- Admin changes retention → affects visible history
- Space deleted → channel deleted, bubble gone
- Multiple Spaces open in different tabs → each shows its own Space's widget (independent state)

**Responsive Behavior**:
- **Desktop (1024px+)**: Floating bubble + expanded window as described. Widget at bottom-right.
- **Tablet (768–1023px)**: Same bubble; expanded window may be slightly narrower (~320px). Same position.
- **Mobile (<768px)**: Floating bubble at bottom-right (smaller, ~44px). Tapping opens a **full-screen chat view** (not a floating window — too small at mobile widths). Back button returns to Space. The bubble minimizes to its collapsed state when the full-screen chat is closed.

**Accessibility**:
- Bubble has aria-label: "Open Space chat" (with unread count)
- Bubble is keyboard-focusable (Tab reaches it)
- Expanded window has focus trap
- Minimize/expand buttons have clear labels
- Escape closes (minimizes) the widget
- All chat accessibility from Sections 2/3 apply within the widget
- Screen reader announces when widget opens/closes

**Personas**:
- **Contributor**: Sees the bubble while browsing the Space. Clicks it to ask a quick question. Types a message, gets an answer later. Minimizes it. The bubble's badge tells them when there's a reply.
- **Facilitator**: Keeps the widget expanded while reviewing content. Quickly answers member questions between tasks. Appreciates that it doesn't rearrange the page layout.
- **Portfolio Owner**: Glances at the bubble badge to sense activity. Might expand briefly to scan recent messages. Minimizes and moves on. The lightest-touch check possible.

---

## Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Space Channel integration | Floating collapsible widget | Lightest touch; zero layout impact; always reachable |
| Widget position | Bottom-right, fixed | Standard convention; out of the way |
| Widget size (expanded) | ~360×500px | Compact but readable; doesn't dominate the screen |
| Resizable widget | No (v1) | Simplicity; fixed size reduces complexity |
| Click-outside behavior | Widget stays open | Intentional — chat is a companion, not a transient popup |
| Panel vs. page for Hub | Sliding panel from right | Keeps user in context |
| Filter tabs in Hub | All / Direct / Groups / Spaces | Low categories; fast scan |
| Group avatar shape | Rounded square | Visual differentiation |
| Space Channel entry points | Hub + floating widget | Hub for triage, widget for quick interactions |
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
6. **Screen M6**: Space Home — floating bubble visible (collapsed, with unread badge)
7. **Screen M7**: Space Home — widget expanded (floating chat window, Space content visible behind)
8. **Screen M8**: Space Knowledge Base tab — widget still expanded (persistent across tabs)
9. **Screen M9**: Widget minimized (back to bubble state)
10. **Screen M10**: New Group creation flow

Smart Animate transitions:
- M1 → M2: Panel slides in from right
- M2 → M3/M4/M5: Conversation list slides left, chat slides in
- M6 → M7: Bubble scales up / morphs into expanded window (smooth scale+fade)
- M7 → M9: Window morphs back down into bubble (reverse)
- M7 → M8: Tab switch — widget stays expanded, Space content swaps

Use the platform's standard design system (`design-system-page.md`).
