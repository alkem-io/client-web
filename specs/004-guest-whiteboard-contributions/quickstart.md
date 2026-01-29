# Quickstart Guide: Guest Whiteboard Contributions Toggle

**Feature**: Guest Whiteboard Contributions Toggle
**Estimated Implementation Time**: 2-3 days
**Prerequisites**: Backend schema update deployed

## Overview

This guide provides step-by-step instructions for implementing the Guest Whiteboard Contributions Toggle feature. The feature adds a **space-level admin setting** that controls whether whiteboard creators can share whiteboards publicly.

**Important**: This toggle is **admin-only**. Space members will NOT see this setting - they will only see a checkbox in the Share dialog (future implementation of checkbox) when this setting is enabled.

## Prerequisites Checklist

- [ ] Backend team has added `allowGuestContributions` field to `SpaceSettingsCollaboration` type
- [ ] Backend schema is deployed to development environment
- [ ] You have admin access to a test space for validation
- [ ] Node.js 20+ and pnpm 10+ installed

## Implementation Steps

### Step 1: Update GraphQL Schema (5 minutes)

1. **Update Space Settings Fragment**:

   ```bash
   # Edit src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql
   ```

   Add to the collaboration section:

   ```graphql
   collaboration {
     allowMembersToCreateCallouts
     allowMembersToCreateSubspaces
     inheritMembershipRights
     allowEventsFromSubspaces
     allowMembersToVideoCall
     allowGuestContributions  # ADD THIS LINE
   }
   ```

2. **Regenerate Types**:

   ```bash
   cd /path/to/alkemio/client-web
   pnpm run codegen
   ```

3. **Verify Generation**:
   Check that `SpaceSettingsCollaboration` type in `src/core/apollo/generated/graphql-schema.ts` includes the new field.

### Step 2: Update Data Models (10 minutes)

1. **Update TypeScript Interface**:

   ```typescript
   // Edit src/domain/space/settings/SpaceSettingsModel.ts
   interface SpaceSettingsCollaboration {
     allowMembersToCreateCallouts: boolean;
     allowMembersToCreateSubspaces: boolean;
     inheritMembershipRights: boolean;
     allowEventsFromSubspaces: boolean;
     allowMembersToVideoCall: boolean;
     allowGuestContributions: boolean; // ADD THIS LINE
   }
   ```

2. **Update Default Settings**:
   ```typescript
   // Edit src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx
   export const defaultSpaceSettings = {
     // ... existing sections
     collaboration: {
       allowMembersToCreateCallouts: true,
       allowMembersToCreateSubspaces: true,
       inheritMembershipRights: true,
       allowEventsFromSubspaces: true,
       allowMembersToVideoCall: false,
       allowGuestContributions: false, // ADD THIS LINE
     },
   };
   ```

### Step 3: Create Domain Façade Hook (15 minutes)

1. **Create Hook File**:

   ```bash
   touch src/domain/space/settings/useSpaceGuestContributions.ts
   ```

2. **Implement Hook**:

   ```typescript
   // src/domain/space/settings/useSpaceGuestContributions.ts
   import { useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
   import { ApolloError } from '@apollo/client';

   interface UseSpaceGuestContributionsResult {
     allowGuestContributions: boolean;
     loading: boolean;
     error?: ApolloError;
   }

   export const useSpaceGuestContributions = (spaceId: string): UseSpaceGuestContributionsResult => {
     const { data, loading, error } = useSpaceSettingsQuery({
       variables: { spaceId },
       skip: !spaceId,
     });

     return {
       allowGuestContributions: data?.lookup?.space?.settings?.collaboration?.allowGuestContributions ?? false,
       loading,
       error,
     };
   };
   ```

### Step 4: Add UI Toggle Component (30 minutes)

1. **Update Settings Page**:

   ```typescript
   // Edit src/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage.tsx

   // Add to handleUpdateSettings function parameters:
   allowGuestContributions = currentSettings?.collaboration?.allowGuestContributions ??
     defaultSpaceSettings.collaboration.allowGuestContributions,

   // Add to settingsVariable.collaboration object:
   collaboration: {
     ...currentSettings.collaboration,
     ...collaborationSettings,
     allowEventsFromSubspaces,
     allowMembersToCreateSubspaces,
     allowMembersToCreateCallouts,
     allowMembersToVideoCall,
     allowGuestContributions, // ADD THIS LINE
     inheritMembershipRights,
   } as SpaceSettingsCollaboration,
   ```

2. **Add Toggle UI**:
   Add this section in the Member Actions block:
   ```typescript
   <SwitchSettingsGroup
     options={{
       allowGuestContributions: {
         checked: currentSettings?.collaboration?.allowGuestContributions || false,
         label: (
           <Trans
             i18nKey="pages.admin.space.settings.memberActions.allowGuestContributions"
             components={{ b: <strong /> }}
           />
         ),
       },
     }}
     onChange={(setting, newValue) => handleUpdateSettings({ [setting]: newValue })}
   />
   ```

### Step 5: Add Translations (10 minutes)

1. **Add Translation Keys**:
   ```json
   // Add to public/locales/en/translation.json
   {
     "pages": {
       "admin": {
         "space": {
           "settings": {
             "memberActions": {
               "allowGuestContributions": "Allow admins and whiteboard creators to share whiteboards publicly"
             }
           }
         }
       }
     }
   }
   ```

### Step 6: Add React 19 Optimistic Updates (20 minutes)

1. **Import useOptimistic**:

   ```typescript
   // Add to imports in SpaceAdminSettingsPage.tsx
   import { useOptimistic, useTransition } from 'react';
   ```

2. **Add Optimistic State**:

   ```typescript
   // Add inside component function
   const [optimisticGuestContributions, setOptimisticGuestContributions] = useOptimistic(
     currentSettings?.collaboration?.allowGuestContributions ?? false,
     (currentState, newState) => newState
   );
   const [isPending, startTransition] = useTransition();
   ```

3. **Update Toggle Handler**:

   ```typescript
   const handleGuestContributionsToggle = (newValue: boolean) => {
     setOptimisticGuestContributions(newValue);
     startTransition(() => {
       handleUpdateSettings({ allowGuestContributions: newValue });
     });
   };
   ```

4. **Update UI to Use Optimistic State**:
   ```typescript
   <SwitchSettingsGroup
     options={{
       allowGuestContributions: {
         checked: optimisticGuestContributions,
         label: /* ... */,
       },
     }}
     onChange={(setting, newValue) => handleGuestContributionsToggle(newValue)}
   />
   ```

### Step 7: Add Error Handling (15 minutes)

1. **Update Mutation Options**:
   ```typescript
   const [updateSpaceSettings] = useUpdateSpaceSettingsMutation({
     onCompleted: () => {
       if (showNotification) {
         notify(t('pages.admin.space.settings.savedSuccessfully'), 'success');
       }
     },
     onError: error => {
       // Optimistic update automatically reverts
       notify(t('pages.admin.space.settings.updateError'), 'error');
       console.error('Failed to update space settings:', error);
     },
   });
   ```

### Step 8: Testing (30 minutes)

1. **Manual Testing**:

   ```bash
   # Start development server
   pnpm start

   # Navigate to space settings
   # Toggle the guest contributions setting
   # Verify persistence across page reloads
   # Test error scenarios (network offline)
   ```

2. **Unit Test**:

   ```typescript
   // Create test file: src/domain/space/settings/useSpaceGuestContributions.test.ts
   import { renderHook } from '@testing-library/react';
   import { MockedProvider } from '@apollo/client/testing';
   import { useSpaceGuestContributions } from './useSpaceGuestContributions';

   const mockQuery = {
     request: {
       query: SpaceSettingsDocument,
       variables: { spaceId: 'test-space-id' },
     },
     result: {
       data: {
         lookup: {
           space: {
             settings: {
               collaboration: {
                 allowGuestContributions: false,
               },
             },
           },
         },
       },
     },
   };

   test('returns default value false', async () => {
     const { result } = renderHook(
       () => useSpaceGuestContributions('test-space-id'),
       {
         wrapper: ({ children }) => (
           <MockedProvider mocks={[mockQuery]}>{children}</MockedProvider>
         ),
       }
     );

     expect(result.current.allowGuestContributions).toBe(false);
   });
   ```

## Verification Checklist

- [ ] Settings toggle appears in Space Settings → Allowed Actions section
- [ ] Toggle default state is OFF (false)
- [ ] Toggle state persists across page reloads
- [ ] **ONLY space admins** can see/change the toggle (members cannot see it)
- [ ] Optimistic updates provide immediate feedback
- [ ] Error handling reverts optimistic state
- [ ] Success/error notifications display correctly
- [ ] No console errors in browser dev tools
- [ ] TypeScript compilation succeeds
- [ ] Unit tests pass

## Common Issues & Solutions

### Issue: "Field not found" GraphQL Error

**Solution**: Backend schema not deployed yet. Verify with backend team.

### Issue: Types not generating correctly

**Solution**:

```bash
# Clear Apollo cache and regenerate
rm -rf node_modules/.cache
pnpm run codegen
```

### Issue: Toggle not appearing

**Solution**:

1. Check user has **admin privileges** on the test space
2. Verify you're testing with a space admin account, not a member
3. Members should NOT see this toggle - only admins should

### Issue: Optimistic updates not working

**Solution**: Verify React 19 is installed:

```bash
npm list react
# Should show version 19.x.x
```

### Issue: Settings not persisting

**Solution**: Check network tab for mutation errors. Verify space ID is correct.

## Performance Validation

1. **Mutation Timing**:
   - Open browser dev tools → Network tab
   - Toggle setting and verify mutation completes <500ms

2. **Memory Usage**:
   - Open dev tools → Memory tab
   - Toggle setting multiple times
   - Verify no memory leaks (heap should stabilize)

3. **Bundle Size**:
   - No significant increase expected (single boolean field)

## Next Steps

After implementation:

1. **Share Dialog Integration** (Future work):
   - Use `useSpaceGuestContributions(spaceId)` hook
   - Show/hide public sharing checkbox based on return value
   - **Note**: Space members (whiteboard creators) will see the checkbox here, not the admin toggle

2. **Public URL Implementation** (Future work):
   - Create public whiteboard pages
   - Validate space setting before serving content

3. **Analytics** (Optional):
   - Track toggle usage patterns
   - Monitor public sharing adoption

## Support

For questions or issues:

1. Check existing space settings implementation patterns
2. Review Apollo Client documentation for mutation patterns
3. Consult React 19 documentation for `useOptimistic` usage
4. Reach out to the backend team for schema-related questions

## Resources

- [Constitution](../.specify/memory/constitution.md) - Engineering principles
- [Apollo Client Docs](https://www.apollographql.com/docs/react/) - GraphQL integration
- [React 19 Docs](https://react.dev/blog/2024/04/25/react-19) - New concurrent features
- [MUI Switch Docs](https://mui.com/material-ui/react-switch/) - Toggle component
