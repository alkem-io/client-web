# GraphQL Contract Changes: Callout Collapse/Expand

**Feature Branch**: `020-callout-collapse`
**Date**: 2026-03-11

## Fragment Changes

### SpaceSettings Fragment (`SpaceSettings.graphql`)

```diff
 fragment SpaceSettings on SpaceSettings {
   privacy {
     mode
     allowPlatformSupportAsAdmin
   }
   membership {
     policy
     trustedOrganizations
     allowSubspaceAdminsToInviteMembers
   }
   collaboration {
     allowMembersToCreateCallouts
     allowMembersToCreateSubspaces
     inheritMembershipRights
     allowEventsFromSubspaces
     allowMembersToVideoCall
     allowGuestContributions
   }
   sortMode
+  layout {
+    calloutDescriptionDisplayMode
+  }
 }
```

### UpdateSpaceSettings Mutation Response (`UpdateSpaceSettings.graphql`)

```diff
 mutation UpdateSpaceSettings($settingsData: UpdateSpaceSettingsInput!) {
   updateSpaceSettings(settingsData: $settingsData) {
     id
     settings {
       privacy { ... }
       membership { ... }
       collaboration { ... }
       sortMode
+      layout {
+        calloutDescriptionDisplayMode
+      }
     }
   }
 }
```

## New Query (for callout rendering contexts)

A lightweight query or fragment to fetch the display mode where callouts are rendered. Can piggyback on existing space queries or be a standalone lookup:

```graphql
fragment SpaceLayoutSettings on SpaceSettings {
  layout {
    calloutDescriptionDisplayMode
  }
}
```

## Server-Provided Types (after codegen)

```graphql
enum CalloutDescriptionDisplayMode {
  COLLAPSED
  EXPANDED
}

type SpaceSettingsLayout {
  calloutDescriptionDisplayMode: CalloutDescriptionDisplayMode!
}

input UpdateSpaceSettingsLayoutInput {
  calloutDescriptionDisplayMode: CalloutDescriptionDisplayMode
}
```

## Mutation Input

```graphql
input UpdateSpaceSettingsEntityInput {
  privacy: UpdateSpaceSettingsPrivacyInput
  membership: UpdateSpaceSettingsMembershipInput
  collaboration: UpdateSpaceSettingsCollaborationInput
  sortMode: SpaceSortMode
  layout: UpdateSpaceSettingsLayoutInput # NEW
}
```

## Cache Behavior

The mutation response includes `layout.calloutDescriptionDisplayMode`, which updates the Apollo normalized cache for the space entity. Any active query watching `settings.layout.calloutDescriptionDisplayMode` will reactively re-render — satisfying FR-011 (no full page reload).
