# Data Gap Analysis: 1:1 Prototype vs. Alkemio API

**Date**: March 2026  
**Source**: Cross-reference of 1:1 UI prototype components against Alkemio Data Briefing

---

## RED — UI shows data that does NOT exist in the API

| # | Component | UI Element | Why it's missing |
|---|-----------|-----------|-----------------|
| 1 | PostCard / SpaceFeed | **Like count** ("24 Likes") | The API has no likes/reactions on Posts. `message.reactions[]` exists on Room messages, but Posts themselves don't have a like count field |
| 2 | PostCard / SpaceFeed | **Share button/action** | No share/forward mechanism in the API |
| 3 | RecentSpaces | **"Last visited 2h ago"** | The API has no `lastVisited` timestamp on Spaces or memberships. No user-visit tracking exists |
| 4 | UserMembershipPage | **"Last active" timestamp** ("2 hours ago") | No `lastActive` field on memberships. `authenticatedAt` exists on user auth but not per-Space |
| 5 | UserMembershipPage | **Plan name per membership** ("Premium", "Standard") | Licensing uses entitlement-based system, not named tiers. Exact plan name labels not confirmed |
| 6 | UserAccountPage | **Capacity counters** ("12 / 20 spaces used") | API has `license.entitlements` but no `capacity.used/total` numeric counters |
| 7 | SpaceSettingsStorage | **Storage breakdown** (47 Documents = 12.4 GB) | No storage metrics, file counts, or per-type breakdowns in the API |
| 8 | SpaceSettingsStorage | **Individual asset list** (name, size, uploadedBy) | References exist in profiles but don't have file size or uploader metadata |
| 9 | MessagesPage / UserProfileHeader | **Online status** (green dot) | No online/presence status in the API |
| 10 | MessagesPage | **Read receipts** (✓ / ✓✓) | No read status on messages |
| 11 | MessagesPage | **Unread message count** per contact | No unread count per conversation. `me.notifications` has read/unread but for notifications, not messages |
| 12 | AdminPage | **Platform Uptime** ("99.9%") | No uptime metric in the API |
| 13 | AdminPage | **Active Sessions** ("342") | No session tracking in the API |
| 14 | AdminPage | **Stat change percentages** ("+12%", "+8%") | No historical comparison / trend data |
| 15 | SpaceSettingsCommunity | **"Suspended" status** | No suspended state in the community model |
| 16 | SpaceSettingsCommunity | **"Pending" / "Invited" in member table** | Applications/invitations exist separately (`ContributorRoles.applications/.invitations`) but are admin-only and not a member status field |
| 17 | PostCard | **Author role badge** ("Facilitator", "City Planner") | API has community roles (Member/Lead/Admin) only. Descriptive labels would need to come from user profile tags |
| 18 | SubspacePage | **Channels with counts** ("STRATEGY DOCS (5)") | Callouts (contribution boards) exist with `contributionsCount`, but aren't called "channels" |
| 19 | NotificationsPage | **"reaction" notification type** | May not be a notification trigger — needs API verification |
| 20 | PostCard | **Comment count** ("5 Comments") | Available via `room.messagesCount` on Callout comment rooms — exists but needs different query path. Borderline AMBER |

---

## AMBER — Data exists but needs transformation or has access caveats

| # | Component | UI Element | Status |
|---|-----------|-----------|--------|
| 1 | SpaceMembers | User bio | Available as `profile.description` — unused in current queries but exists |
| 2 | SpaceMembers | Join date | `createdDate` exists on user. Per-Space join date needs activity feed (member joined event) |
| 3 | SpaceMembers | Organization member count | Not direct — count `rolesOrganization` memberships |
| 4 | SpaceHeader | Member avatar list + "+24" | Get members from community query, fetch avatars individually |
| 5 | BrowseSpacesPage | Space leads | Available via Lead role community members |
| 6 | SpaceSettingsAccount | Host information | Available as `account.host` — exists but unused |
| 7 | SpaceCard | Member count | Available via `about.metrics` NVP — needs verification |
| 8 | UserAccountPage | Virtual Contributors list | Available via `virtualContributor` but list-all is admin-only |
| 9 | PostCard | Post type (text/whiteboard/collection) | Maps to Callout types (Post, Whiteboard, Link, Memo) — close but not 1:1 |
| 10 | NotificationsPage | Notification space context | `me.notifications` exists but field structure needs verification |

---

## GREEN — Data confirmed available in the API

| Component | UI Element | API Source |
|-----------|-----------|-----------|
| SpaceHeader, SpaceCard | Space name, description, tagline | `space.profile.*` |
| SpaceHeader | Space banner image | `space.profile.visual` |
| SpaceCard, BrowseSpaces | Space tags | `space.profile.tagset` |
| SpaceCard | Space privacy mode | `space.settings.privacy.mode` |
| BrowseSpaces filters | Space visibility | `space.visibility` |
| All member displays | User name, avatar | `user.profile.displayName`, `user.profile.visual` |
| UserProfile, SpaceMembers | User location | `user.profile.location` |
| SpaceMembers, OrgCard | Organization name, avatar, website | `organization.profile.*` |
| SpaceMembers, Settings | Roles (Member/Lead/Admin) | Community roles API |
| ActivityFeed, Dashboard | Activity feed events | `activityFeed` / `activityFeedGrouped` |
| SpaceHeader | Breadcrumb (Space hierarchy) | Space parent/child relations |
| Settings | Space membership policy | `about.membership.policy` |
| TemplateLibrary | Template library | `platform.library` |
| Calendar (if implemented) | Calendar events | `collaboration.timeline.calendar.events` |

---

## Recommended Changes for Data-Accurate Prototype

### Remove entirely (no API equivalent):
- Like counts and Share buttons on posts
- Online status green dots
- Read receipts (✓/✓✓) on messages
- Storage settings breakdown (asset list, sizes, per-type counts)
- Platform Uptime and Active Sessions admin stats
- Trend percentage changes on admin stats
- "Suspended" member status
- "Last visited" on recent spaces

### Replace with available data:
- **Author role badges**: "Facilitator" → "Lead", "City Planner" → "Member" (use API roles)
- **"Last active"**: Remove or use Space `updatedDate` as "Updated X ago"
- **Channels**: Rename to "Callouts" or show Callout names directly
- **Plan names**: Show entitlement details or remove plan labels
- **Capacity counters**: Either compute from data or remove
- **Comment count**: Keep — available via `room.messagesCount` (query differently)

### Keep as-is (aspirational but clearly marked):
- Unread message counts (notifications system partially supports this)
- Pending/Invited member status (admin APIs exist, just different shape)
