# Quickstart: Group Chats

**Feature**: 017-group-chats
**Branch**: `017-group-chats`

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- Alkemio server running locally at `localhost:3000` (Traefik reverse proxy). `pnpm codegen` expects the GraphQL endpoint at `http://localhost:4000/graphql` (direct server access). `pnpm start` serves the UI on `localhost:3001` via Vite, proxying API calls to `localhost:3000`.
- Server must have the group conversations API deployed (PR alkem-io/server#5891 or equivalent)

## Setup

```bash
git checkout 017-group-chats
pnpm install
```

## Step 1: Generate Updated Types

The server schema has changed. Regenerate types:

```bash
pnpm codegen
```

This will produce TypeScript errors because existing `.graphql` files reference removed fields. That's expected — fixing these errors is the first implementation task.

## Step 2: Fix Codegen Errors

After codegen, the generated types will reflect the new schema. Fix all `.graphql` documents:

1. **`src/main/userMessaging/graphql/UserConversations.graphql`** — Replace `users` → `conversations`, `user` → `members`
2. **`src/main/userMessaging/graphql/CreateConversation.graphql`** — Update input to use `memberIDs` + `type`
3. **`src/main/userMessaging/graphql/ConversationEvents.graphql`** — Replace `user` → `members`, add new event types
4. **`src/main/guidance/chatWidget/ChatWidgetQueries.graphql`** — Replace `virtualContributor(wellKnown:)` with new lookup

Re-run codegen after fixing documents:

```bash
pnpm codegen
```

## Step 3: Fix TypeScript Errors

With clean generated types, fix all TypeScript files:

1. **`useUserConversations.ts`** — Update data mapping for new `members`-based model
2. **`useConversationEventsSubscription.ts`** — Update cache handlers, add new event handlers
3. **`UserMessagingChatList.tsx`** — Update rendering for unified `displayName`/`avatarUri`
4. **`UserMessagingConversationView.tsx`** — Update header rendering
5. **`NewMessageDialog.tsx`** — Update create mutation input
6. **`useChatGuidanceCommunication.ts`** — Update VC conversation lookup
7. **`models.ts`** — Add `ConversationMember` type if needed

## Step 4: Verify Direct Conversations Still Work

```bash
pnpm start
```

Open the messaging dialog and verify:

- All existing direct conversations load
- Messages send and receive correctly
- VC conversations still work (chat widget)

## Step 5: Add Group Chat Features

New GraphQL documents to create:

```
src/main/userMessaging/graphql/
  AddConversationMember.graphql    (new)
  RemoveConversationMember.graphql (new)
  LeaveConversation.graphql        (new)
```

New/modified components:

```
src/main/userMessaging/
  GroupChatManagementDialog.tsx     (new - combined create + manage dialog)
  UserMessagingChatList.tsx         (modify - distinguish group vs direct)
  UserMessagingConversationView.tsx (modify - group header, three-dots menu)
  NewMessageDialog.tsx              (modify - add "Start group chat" button)
  useUserConversations.ts           (modify - handle group conversations)
  useConversationEventsSubscription.ts (modify - handle new event types)
```

## Step 6: Run Tests

```bash
pnpm vitest run
pnpm lint
```

## Development Server

```bash
pnpm start
# Runs on localhost:3001, expects backend at localhost:3000
```

## Key Files Reference

| Purpose             | Path                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Messaging UI        | `src/main/userMessaging/`                                                                               |
| GraphQL documents   | `src/main/userMessaging/graphql/`                                                                       |
| Chat widget (VC)    | `src/main/guidance/chatWidget/`                                                                         |
| Generated types     | `src/core/apollo/generated/graphql-schema.ts`                                                           |
| Generated hooks     | `src/core/apollo/generated/apollo-hooks.ts`                                                             |
| User search hook    | `src/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors.ts` |
| Avatar upload       | `src/core/ui/upload/VisualUpload/VisualUpload.tsx`                                                      |
| i18n strings        | `src/core/i18n/en/translation.en.json`                                                                  |
| Apollo cache config | `src/core/apollo/config/typePolicies.ts`                                                                |
