# Messaging System — Design Q&A Log

> **Purpose**: Audit trail of the strategic questions discussed and decisions made before writing the 5 messaging design briefs.  
> **Date**: February 12, 2026  
> **Participants**: Jeroen Nijkamp + AI design assistant  
> **Output**: 5 design briefs in `messaging-briefs/`

---

## Context

Before writing any design briefs, 13 strategic questions were explored to understand the *why*, *scope*, *UX integration*, and *behavioral expectations* of the messaging system. The questions were derived from analyzing:

- [server#5829 — Sub-Space Chat](https://github.com/alkem-io/server/issues/5829) (attached spec: `Sub-.Space.Chat._.Channel.md`)
- [server#5713 — Group Chats](https://github.com/alkem-io/server/issues/5713)
- [alkemio#1741 — Parent epic](https://github.com/alkem-io/alkemio/issues/1741)

The answers below drove every design decision in the briefs.

---

## Q1: Why does Alkemio need messaging at all?

**Question**: What's the strategic driver? Is this a feature request, a competitive gap, or something deeper?

**Answer**: The primary driver is **Big Tech migration** — organizations are moving away from Slack, Teams, and other Big Tech communication tools toward platforms that align with their values (open, self-sovereign, integrated). Alkemio needs to become a **complete collaboration + communication platform** so users don't need Alkemio *and* Slack. If people leave the platform to talk, the conversation context is lost and Alkemio is only half the story.

---

## Q2: What problem are we solving for each persona?

**Question**: How does the lack of messaging hurt Facilitators, Contributors, and Portfolio Owners specifically?

**Answer**:
- **Facilitators** answer the same coordination questions repeatedly because there's no persistent shared channel; they resort to email or WhatsApp and lose that context inside the platform.
- **Contributors** who want to quickly ask "can you look at this?" leave the platform entirely — that conversation never comes back.
- **Portfolio Owners** want to feel the pulse of a collaboration but have to read through formal posts; there's no lightweight, ambient signal of how a Space is doing.

---

## Q3: What are the conversation types?

**Question**: Are we building one chat feature or multiple conversation types? What's the taxonomy?

**Answer**: Three distinct conversation types:

| Type | Membership | Control |
|------|-----------|---------|
| **1:1 DMs** | Two users | The two participants |
| **Group Chats** | Ad-hoc, any user can create | Any group member can add/remove |
| **(Sub)-Space Channels** | Tied to Space membership | Admin enables/disables; membership follows the Space |

---

## Q4: Should the Space Channel be a separate tab, or woven into the Space?

**Question**: Where does the Space Channel live in the Space UI? A new tab? A panel? Something else?

**Answer**: This question generated the most discussion. The conclusion was to **explore multiple integration patterns** and present them as separate design options for stakeholder review. This became the 5-brief structure:

1. Side panel overlay (like Figma comments)
2. Persistent resizable drawer (like Slack thread panel)
3. Full tab (alongside Community, Subspaces, KB)
4. Floating collapsible widget (like Intercom)
5. Space Channel only — no Hub/DMs/Groups (standalone minimum scope)

Briefs 1–4 use the same full messaging system (Hub + DMs + Groups) and differ only in the Space Channel integration. Brief 5 is a standalone option.

---

## Q5: Should there be a unified inbox / Messaging Hub?

**Question**: If we have DMs, Groups, and Space Channels — do users need one place to see all conversations?

**Answer**: **Yes** — a **Messaging Hub** (sliding panel from the right, triggered by a chat icon in the top nav) serves as the unified inbox. It replaces the current 1:1-only chat dialog. Filter tabs: All / Direct / Groups / Spaces. This applies to Briefs 1–4. Brief 5 has no Hub (not needed without DMs/Groups).

---

## Q6: What's the expected communication pace?

**Question**: Is this real-time high-throughput (like Slack/Discord) or low-traffic coordination?

**Answer**: **Low-traffic, coordination-style** — a few messages a day, not dozens per hour. This is meaningful, purposeful communication. The UI should be designed for clarity and readability with generous whitespace, not for high-throughput real-time streaming. Messages are worth reading individually.

---

## Q7: How does the Space Channel relate to Space membership?

**Question**: Can users join/leave the channel independently of the Space?

**Answer**: **No** — membership follows the Space. When a user joins a Space, they automatically have access to the channel. When they leave, they lose access immediately. There's no separate join/leave for the channel. The admin can enable/disable the channel, but cannot manage channel membership independently of Space membership.

---

## Q8: What about message history for new members?

**Question**: When someone joins a Space, how much chat history do they see?

**Answer**: Controlled by **admin-configurable retention** in Space Settings. Options: 30 days / 90 days / 1 year / Forever. New members see history within the configured retention window. This means different Spaces can have different retention policies based on their needs.

---

## Q9: How do Group Chats work?

**Question**: Who can create them? Who manages membership? How do they differ from Space Channels?

**Answer**:
- **Any user** can create a Group Chat
- **Any group member** can add or remove members (not just the creator)
- Minimum: 2 members + creator
- Added members see **full history**; removed members lose access immediately
- No conversion from 1:1 DM to Group Chat (start fresh)
- Leaving a group: chat disappears from your list, group continues; re-added = full history restored
- Key difference from Space Channel: Group Chats are ad-hoc (any user creates), Space Channels are auto-created with the Space

---

## Q10: What's NOT in scope for v1?

**Question**: What features are explicitly excluded from the first version?

**Answer**:
- ❌ Moderation UI (flagging, review, audit trail) — framework in data model, no UI
- ❌ Message deletion UI (admin delete, user delete)
- ❌ Read receipts
- ❌ Typing indicators
- ❌ Email notifications for messages
- ❌ Voice/video integration (Jitsi)
- ❌ AI agents/bots in chat
- ❌ Multiple channels per Space (one channel per Space)
- ❌ Blocking users
- ❌ Message threads/sub-threads (reply-to with quoting is in scope, but not threaded conversations)

---

## Q11: How do Status Updates relate to the Space Channel?

**Question**: Leads already post Status Updates in Spaces. Does the Space Channel replace, complement, or conflict with Status Updates?

**Answer**: **Separate for v1**. Status Updates are one-to-many (from Leads), while the Space Channel is many-to-many (all members). They coexist independently. In a future version, a Status Update could become a **pinned message** in the Space Channel — but that convergence is deferred. For now, they serve different purposes.

---

## Q12: What's the notification strategy?

**Question**: How should notifications work across the three conversation types?

**Answer**:
- **In-app notifications**: ✓ for all message types
- **Push notifications**: ✓ for DMs, Groups, and Space Channel messages
- **@mentions**: Always notify, **even if the channel is muted** (override)
- **Reactions on your message**: In-app only, no push
- **Email notifications**: ❌ not in v1
- **Per-conversation mute** + **Do Not Disturb schedule** available
- Unread badges on the chat icon (Hub) and on the CHAT tab (Space)

---

## Q13: What are the role-based permissions for the Space Channel?

**Question**: What can Admins, Leads, and Members do in the Space Channel?

**Answer**:

| Action | Admin | Lead | Member |
|--------|-------|------|--------|
| Send / edit own / react / reply / @mention / attach | ✓ | ✓ | ✓ |
| Enable/disable channel | ✓ | ✗ | ✗ |
| Set history retention | ✓ | ✗ | ✗ |
| Delete any message | Deferred (v2) | ✗ | ✗ |
| Delete own message | Deferred (v2) | Deferred (v2) | Deferred (v2) |
| Pin messages | Future | Future | ✗ |
| Manage moderation | Future | ✗ | ✗ |

All three roles have equal messaging capabilities (send, edit own, react, reply, @mention, upload). Only Admins can manage channel settings. Deletion and moderation are deferred.

---

## Summary of Key Design Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Why messaging? | Big Tech migration + keep users on platform | Strategic — Alkemio must be complete |
| 2 | Persona impact | Facilitators, Contributors, Portfolio Owners all underserved | Direct platform gap |
| 3 | Conversation types | DMs + Groups + Space Channels | Three distinct needs |
| 4 | Space Channel integration | 5 options explored as separate briefs | No premature commitment |
| 5 | Unified inbox | Messaging Hub (sliding panel) | Single triage point |
| 6 | Communication pace | Low-traffic, coordination | Few messages/day |
| 7 | Channel membership | Follows Space membership | Zero configuration |
| 8 | History for new members | Admin-configurable retention | Flexible per-Space |
| 9 | Group Chat management | Any member manages | Low-friction, ad-hoc |
| 10 | v1 exclusions | No moderation UI, deletion, receipts, email, Jitsi, bots | Ship fast, iterate |
| 11 | Status Updates | Separate for v1 | Future convergence via pins |
| 12 | Notifications | In-app + push; @mention overrides mute; no email | Push covers urgency |
| 13 | Permissions | Equal messaging; admin-only settings; deletion deferred | Simple, role-appropriate |

---

## How This Fed Into the Briefs

These answers were applied consistently across all 5 briefs:

- **Briefs 1–4** use the full system (Q1–Q13) and differ only in the Space Channel integration pattern (Q4)
- **Brief 5** uses Q1–Q2, Q6–Q8, Q10–Q13 (Space Channel only — no Hub, DMs, or Groups)
- The decision log appendix in each brief traces back to these answers
- Every [NEEDS CLARIFICATION] marker was resolved before writing

---

*This document can be attached to the GitHub ticket for auditability.*
