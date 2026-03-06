# Feature Specification: Group Chats

**Feature Branch**: `017-group-chats`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Create and manage group chats — multi-party conversations accessible from the messaging flow, with member management, real-time updates, and conversation lifecycle support."

**References**:

- Server feature issue: [alkem-io/server#5713](https://github.com/alkem-io/server/issues/5713)
- Client API adaptation issue: [alkem-io/client-web#9373](https://github.com/alkem-io/client-web/issues/9373)
- Figma designs: [User-to-User Messaging — Group Chats](https://www.figma.com/design/44zLTs7qQLFGesxmRbtw9N/User-to-User-Messaging?node-id=118-98&p=f&t=0qOGoQ5NHSsFYtx9-0)

## Context

The platform currently supports direct (1-on-1) conversations between users and with virtual contributors. The server API is being refactored to unify conversations under a single model that supports both **direct** and **group** conversation types. This specification covers the client-side work to:

1. Adapt to the restructured conversation API (breaking changes to how conversations are queried, created, and categorized).
2. Build the group chat user experience on top of the new API capabilities.

### API Model (assumed)

The following API shape is assumed based on the server-side work in progress. The client should be built against this contract:

- **Conversation** has a `members` list of `Actor` objects (replacing the previous `user` / `virtualContributor` fields). Each actor has a `type` (USER, VIRTUAL_CONTRIBUTOR) and a `profile`.
- **All conversations** (direct + group) are returned in a flat `conversations` list (replacing the previous `users` / `virtualContributors` split).
- **Creating a conversation** uses `memberIDs` (array) + `type` (DIRECT or GROUP).
- **Group management mutations**: `addConversationMember`, `removeConversationMember`, `leaveConversation`.
- **Real-time events**: `CONVERSATION_CREATED`, `CONVERSATION_DELETED`, `MEMBER_ADDED`, `MEMBER_REMOVED`, `MESSAGE_RECEIVED`, `MESSAGE_REMOVED`, `READ_RECEIPT_UPDATED`.
- Group conversations **auto-delete** when the last member leaves.

## Clarifications

### Session 2026-03-06

- Q: Is there a maximum group member limit? → A: No limit — any number of platform users can be added to a group chat.
- Q: Can group name and avatar be edited after creation? → A: Yes — any member can edit the group name and avatar. This is done in the same "Manage members" dialog (which combines group details editing and member management in a single view).
- Q: Should destructive group actions (leave, remove member) require confirmation? → A: Confirmation dialog required only for leaving a group. Removing a member is immediate (no confirmation).

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Adapt Conversation List to Unified API (Priority: P1)

As a user, I want my existing direct conversations to continue working seamlessly after the API restructure, so that the messaging experience is uninterrupted.

**Why this priority**: This is a prerequisite for everything else. The existing messaging UI must not break when the server deploys the new API. Without this, both direct and group chats fail.

**Independent Test**: Can be fully tested by opening the messages screen and verifying that all existing 1-on-1 conversations (with users and VCs) load, display correctly, and allow sending/receiving messages.

**Acceptance Scenarios**:

1. **Given** the server has deployed the unified conversation API, **When** I open my messages screen, **Then** I see all my existing direct conversations listed correctly with the other participant's name and avatar.
2. **Given** I have a conversation with a virtual contributor, **When** I view my conversation list, **Then** the VC conversation is identified and displayed with the appropriate VC indicator (determined by inspecting member types).
3. **Given** I want to start a new direct conversation, **When** I use the "New Message" flow and select a single user, **Then** a direct conversation is created using the new API format.
4. **Given** I receive a message in an existing conversation, **When** I am on the messages screen, **Then** the message appears in real-time via subscription events.

---

### User Story 2 — Create a Group Chat (Priority: P1)

As a user, I want to create a group chat with multiple people so that we can have a shared conversation in one place.

**Why this priority**: This is the core new functionality. Without group creation, no other group features are useful.

**Independent Test**: Can be fully tested by initiating the group creation flow, selecting members, setting a name and avatar, confirming creation, and verifying the group chat appears and is functional.

**Acceptance Scenarios**:

1. **Given** I am on the "New Message" screen, **When** I see the available options, **Then** I see a "Start group chat" button (or equivalent entry point).
2. **Given** I tap "Start group chat", **When** the user selection dialog opens, **Then** I can search across all platform users and select one or more users to add.
3. **Given** I have selected at least one user, **When** I proceed to the next step, **Then** I see a dialog to set a group name (required) and choose a group avatar (optional, with a default provided).
4. **Given** I have entered a group name and optionally chosen an avatar, **When** I confirm creation, **Then** the group chat is created, I am navigated to the new group chat, and all selected members are part of it.
5. **Given** I have not selected any members, **When** I try to proceed, **Then** I am prevented from continuing (at least one member besides myself is required).
6. **Given** I have not entered a group name, **When** I try to confirm creation, **Then** I see a validation error indicating the name is required.

---

### User Story 3 — Display Group Conversations in the List (Priority: P1)

As a user, I want to see my group conversations alongside my direct conversations so that I can easily access all my chats from one place.

**Why this priority**: Without proper display, created group chats would be inaccessible from the main messaging interface.

**Independent Test**: Can be tested by creating a group chat and verifying it appears in the conversation list with correct visual differentiation from direct chats.

**Acceptance Scenarios**:

1. **Given** I am a member of one or more group chats, **When** I open my messages screen, **Then** I see group conversations in the same list as direct conversations.
2. **Given** a group chat is displayed in my list, **When** I look at its entry, **Then** I see the group name, group avatar, and a visual indicator or layout that distinguishes it from a direct conversation (e.g., multiple member avatars or a group icon).
3. **Given** a new message is sent in a group chat I belong to, **When** I view my conversation list, **Then** the group chat shows the latest message preview and updates its position/timestamp accordingly.

---

### User Story 4 — Manage Group Details and Members (Priority: P2)

As a group chat member, I want to edit the group name, avatar, and manage members from a single dialog so that I can keep the group organized.

**Why this priority**: Essential for ongoing group management, but requires an existing group chat (depends on Story 2).

**Independent Test**: Can be tested on an existing group by opening the management dialog, editing the group name/avatar, adding a new member, and removing an existing member.

**Acceptance Scenarios**:

1. **Given** I have a group chat open, **When** I access the group options menu (three-dots or equivalent), **Then** I see a "Manage group" option (or equivalent).
2. **Given** I open the management dialog, **When** it loads, **Then** I see the group avatar (with an edit option), the group name (editable field), an "Add members" action, and a list of current group members with remove options.
3. **Given** the management dialog is open, **When** I change the group name and/or avatar, **Then** the changes are saved and reflected across all members' views.
4. **Given** the management dialog is open, **When** I search for a platform user who is not yet in the group, **Then** I can select and add them to the group.
5. **Given** I add a new member to the group, **When** the addition is confirmed, **Then** the new member immediately appears in the member list and can access the group chat including full message history.
6. **Given** the management dialog is open, **When** I choose to remove a member, **Then** the member is removed and no longer receives new messages or appears in the member list.
7. **Given** a user is already a member of the group, **When** I search for users to add, **Then** that user is filtered out from the search results (or visually indicated as already a member).
8. **Given** all members of a group have the same management rights, **When** any member opens the management dialog, **Then** they can edit group details and add/remove members (no special creator/admin role in V1).

---

### User Story 5 — Leave a Group Chat (Priority: P2)

As a user, I want to leave a group chat I no longer wish to participate in, so that it no longer clutters my conversation list.

**Why this priority**: Supports user autonomy over their messaging experience. Required for a complete group lifecycle.

**Independent Test**: Can be tested by a user leaving a group, verifying the chat disappears from their list, and verifying it remains active for other members.

**Acceptance Scenarios**:

1. **Given** I am a member of a group chat, **When** I choose "Leave group" from the group options, **Then** I see a confirmation dialog asking me to confirm. **When** I confirm, **Then** the group chat is immediately removed from my conversation list.
2. **Given** I have left a group chat, **When** other members view the group, **Then** the group chat remains active and functional for them.
3. **Given** I am the last member in a group chat, **When** I leave the group, **Then** the group conversation is automatically deleted (no orphan groups persist).
4. **Given** I have left a group chat, **When** another member adds me back, **Then** I can see the full message history including messages sent while I was absent.

---

### User Story 6 — Real-Time Group Updates (Priority: P2)

As a user, I want to see group membership changes and new messages in real-time so that my view stays current without refreshing.

**Why this priority**: Real-time updates are essential for a responsive chat experience but can be built incrementally after the core flows work.

**Independent Test**: Can be tested by having two users view the same group, one makes a change (adds member, sends message), the other verifies instant UI update.

**Acceptance Scenarios**:

1. **Given** I am viewing a group chat, **When** another member adds a new person to the group, **Then** I see the updated member list in real-time without refreshing.
2. **Given** I am viewing a group chat, **When** a member is removed or leaves, **Then** I see the updated member list in real-time.
3. **Given** I am a member of a group chat, **When** the group is deleted (last member left), **Then** the conversation is removed from my list in real-time.
4. **Given** I am on the conversation list, **When** someone creates a new group that includes me, **Then** the new group appears in my list in real-time.

---

### Edge Cases

- **Empty member selection**: The system prevents proceeding with group creation if no members (besides the creator) are selected.
- **Empty group name**: The system shows a validation error; group name is mandatory.
- **Duplicate member addition**: Users already in the group are filtered out of the search/add dialog.
- **Deleted user account**: If a member's account is deleted, they are removed from the group (V2 — out of scope for initial release).
- **Self-removal**: When a member removes themselves via "Manage members", it behaves the same as "Leave group".
- **Last member leaves**: The group conversation is automatically deleted; mutations return null.
- **Conversion restriction**: There is no way to convert an existing 1-on-1 direct conversation into a group chat. Groups must be created as new entities.
- **VC restriction**: Only human users can be invited to group chats in V1; virtual contributors cannot be added to groups.
- **Concurrent member operations**: If two members simultaneously add/remove users, the final state should be consistent (server-authoritative).

## Requirements _(mandatory)_

### Functional Requirements

#### API Adaptation (Breaking Changes)

- **FR-001**: System MUST replace the previous conversation type-based categorization (`USER_USER` / `USER_VC` enum) with member-based categorization by inspecting each conversation's `members` list and their actor types.
- **FR-002**: System MUST retrieve all conversations from a single unified list instead of separate user/VC conversation endpoints.
- **FR-003**: System MUST determine "the other participant" in direct conversations by filtering the `members` list to exclude the current user.
- **FR-004**: System MUST identify virtual contributor conversations by checking if any member has a VC actor type.
- **FR-005**: System MUST create direct conversations using the new input format (single member ID + DIRECT type).

#### Group Chat Creation

- **FR-006**: System MUST provide an entry point for creating a group chat from the "New Message" flow.
- **FR-007**: System MUST allow searching across all platform users when selecting group members.
- **FR-008**: System MUST require at least one member (besides the creator) to be selected before allowing group creation. There is no upper limit on the number of members.
- **FR-009**: System MUST require a non-empty group name before allowing group creation.
- **FR-010**: System MUST allow selecting an avatar image for the group chat.
- **FR-011**: System MUST provide a default avatar if the user does not select one.
- **FR-012**: System MUST create group conversations using the new input format (multiple member IDs + GROUP type).

#### Group Display

- **FR-013**: System MUST display group conversations in the same conversation list as direct conversations.
- **FR-014**: System MUST visually distinguish group conversations from direct conversations (e.g., group name, group avatar, member count).
- **FR-015**: System MUST show message previews and timestamps for group conversations in the list.

#### Group Management (Details + Members)

- **FR-016**: System MUST provide a "Manage group" option accessible from the group chat view that opens a single combined dialog for editing group details and managing members.
- **FR-017**: System MUST display the group avatar (with edit option), group name (editable field), an "Add members" action, and a list of current group members with remove options — all within this single dialog.
- **FR-018**: System MUST allow any group member to edit the group name.
- **FR-019**: System MUST allow any group member to edit the group avatar.
- **FR-020**: System MUST allow any group member to add new users to the group.
- **FR-021**: System MUST allow any group member to remove other members from the group.
- **FR-022**: System MUST filter out users who are already group members from the add-member search results.
- **FR-023**: System MUST grant newly added members access to the full message history.

#### Leaving & Lifecycle

- **FR-024**: System MUST allow any member to voluntarily leave a group chat. A confirmation dialog MUST be shown before the leave action is executed.
- **FR-025**: System MUST immediately remove a left/removed group chat from the affected user's conversation list.
- **FR-026**: System MUST keep the group chat active for remaining members when a member leaves or is removed.
- **FR-027**: System MUST handle auto-deletion of group conversations when the last member leaves (null response from mutation).

#### Real-Time Updates

- **FR-028**: System MUST handle `MEMBER_ADDED` subscription events to update the member list in real-time.
- **FR-029**: System MUST handle `MEMBER_REMOVED` subscription events to update the member list in real-time.
- **FR-030**: System MUST handle `CONVERSATION_CREATED` subscription events to add new group chats to the conversation list.
- **FR-031**: System MUST handle `CONVERSATION_DELETED` subscription events to remove deleted groups from the conversation list.

#### Restrictions

- **FR-032**: System MUST NOT allow converting existing direct conversations into group chats.
- **FR-033**: System MUST restrict group member invitations to human users only (no virtual contributors in V1).

### Key Entities

- **Conversation**: A communication channel between two or more participants. Attributes: unique identifier, room (containing messages), members list, conversation kind (direct vs. group). For group conversations, also includes: name, avatar.
- **Actor / Member**: A participant in a conversation. Attributes: unique identifier, type (user or virtual contributor), profile (display name, avatar). Represents the unified model for all conversation participants.
- **Conversation Event**: A real-time notification about a change to a conversation. Types: conversation created, conversation deleted, member added, member removed, message received, message removed, read receipt updated.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a group chat with selected members in under 60 seconds (from tapping "Start group chat" to seeing the group chat open).
- **SC-002**: 100% of selected members gain immediate access to the group chat upon creation or addition, including full message history.
- **SC-003**: Existing direct conversations (user-to-user and user-to-VC) continue to function without any regressions after the API adaptation.
- **SC-004**: Group membership changes (add, remove, leave) are reflected in all connected members' UIs within 3 seconds via real-time updates.
- **SC-005**: Users can successfully find and add any platform user to a group chat via the search functionality.
- **SC-006**: Users who leave a group chat no longer see it in their conversation list and no longer receive notifications from it.

## Assumptions

- All platform users are discoverable and can be added to group chats (V1). A future V2 may introduce opt-out settings.
- Group chats persist as long as at least one member remains. When the last member leaves, the conversation is automatically deleted by the server.
- Newly added members can see the full message history of the group, including messages sent before they joined.
- There is no creator/admin/owner role distinction in V1 — all members have equal rights to manage the group.
- Message deletion within group chats follows the same rules as direct chats (users can delete their own messages; deletion is visible to all participants).
- The server handles the conversation lifecycle (auto-deletion, membership consistency); the client reacts to server events.
- The notification `contributor` field has been renamed to `actor` in `InAppNotificationPayloadVirtualContributor`, and the client must adapt to this rename.
