# GraphQL Operations Contract: Group Chats

**Feature**: 017-group-chats
**Date**: 2026-03-06

This document defines the GraphQL operations that need to be created or updated.

## Updated Operations

### UserConversations Query

```graphql
query UserConversations {
  me {
    conversations {
      conversations {
        id
        room {
          id
          displayName # Group name (null for direct)
          unreadCount
          messagesCount
          lastMessage {
            id
            message
            timestamp
            sender {
              id
              type
              profile {
                id
                displayName
                avatar: visual(type: AVATAR) {
                  id
                  uri
                }
              }
            }
            reactions {
              id
              emoji
              timestamp
              sender {
                id
                profile {
                  id
                  displayName
                }
              }
            }
          }
        }
        members {
          id
          type
          profile {
            id
            displayName
            url
            avatar: visual(type: AVATAR) {
              id
              uri
            }
          }
        }
      }
    }
  }
}
```

### CreateConversation Mutation

```graphql
mutation CreateConversation($conversationData: CreateConversationInput!) {
  createConversation(conversationData: $conversationData) {
    id
    room {
      id
      displayName
    }
    members {
      id
      type
      profile {
        id
        displayName
        url
        avatar: visual(type: AVATAR) {
          id
          uri
        }
      }
    }
  }
}
```

**Input changed from:**

```graphql
{ userID: UUID! }
```

**To:**

```graphql
{ memberIDs: [UUID!]!, type: ConversationCreationType! }
```

### ConversationEvents Subscription

```graphql
subscription ConversationEvents {
  conversationEvents {
    eventType
    conversationCreated {
      conversation {
        id
        room {
          id
          displayName
          unreadCount
          messagesCount
          lastMessage {
            ...MessageFields
          }
        }
        members {
          ...MemberFields
        }
      }
      message {
        ...MessageFields
      }
    }
    conversationDeleted {
      conversationID
    }
    memberAdded {
      conversation {
        id
        members {
          ...MemberFields
        }
      }
      addedMember {
        ...MemberFields
      }
    }
    memberRemoved {
      conversation {
        id
        members {
          ...MemberFields
        }
      }
      removedMemberID
    }
    messageReceived {
      roomId
      message {
        ...MessageFields
      }
    }
    messageRemoved {
      roomId
      messageId
    }
    readReceiptUpdated {
      roomId
      lastReadEventId
    }
  }
}
```

### ConversationWithGuidanceVc Query

```graphql
query ConversationWithGuidanceVc {
  me {
    conversations {
      conversations {
        id
        room {
          id
        }
        members {
          id
          type
          profile {
            id
            displayName
          }
        }
      }
    }
  }
}
# Client-side: filter for conversation where member.type == VIRTUAL_CONTRIBUTOR
# and matches well-known CHAT_GUIDANCE VC
# OR: use a dedicated server-side lookup if available after codegen
```

## New Operations

### AddConversationMember Mutation

```graphql
mutation AddConversationMember($memberData: AddConversationMemberInput!) {
  addConversationMember(memberData: $memberData) {
    id
    members {
      id
      type
      profile {
        id
        displayName
        url
        avatar: visual(type: AVATAR) {
          id
          uri
        }
      }
    }
  }
}
```

### RemoveConversationMember Mutation

```graphql
mutation RemoveConversationMember($memberData: RemoveConversationMemberInput!) {
  removeConversationMember(memberData: $memberData) {
    id
    members {
      id
      type
      profile {
        id
        displayName
        url
        avatar: visual(type: AVATAR) {
          id
          uri
        }
      }
    }
  }
}
```

**Note:** Returns `null` if conversation was auto-deleted (last member removed).

### LeaveConversation Mutation

```graphql
mutation LeaveConversation($leaveData: LeaveConversationInput!) {
  leaveConversation(leaveData: $leaveData) {
    id
  }
}
```

**Note:** Returns `null` if conversation was auto-deleted (last member left).

## Fragment Candidates

Consider extracting shared fragments to reduce duplication:

```graphql
fragment ConversationMemberFields on Actor {
  id
  type
  profile {
    id
    displayName
    url
    avatar: visual(type: AVATAR) {
      id
      uri
    }
  }
}

fragment ConversationMessageFields on Message {
  id
  message
  timestamp
  sender {
    id
    type
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        id
        uri
      }
    }
  }
  reactions {
    id
    emoji
    timestamp
    sender {
      id
      profile {
        id
        displayName
      }
    }
  }
}
```

## Notification Fragment Update

The `InAppNotificationPayloadVirtualContributor` fragment already uses `actor` field (no change needed — confirmed in current codebase).
