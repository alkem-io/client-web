# Quickstart Guide: Default Post Template for Flow Steps

**Feature Branch**: `001-flow-post-template` | **Date**: 2026-01-09
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Overview

This guide provides quick setup and testing instructions for the default post template feature. Use this to verify the feature works end-to-end after implementation.

## Prerequisites

### Backend Requirements

✅ **Backend changes are DONE**. Ensure your backend is up-to-date with:

- `InnovationFlowState.defaultCalloutTemplate` field
- `setDefaultCalloutTemplateOnInnovationFlowState` mutation
- `removeDefaultCalloutTemplateOnInnovationFlowState` mutation

**Verify backend schema**:

```bash
# The backend should be running at localhost:3000
# GraphQL endpoint should be at localhost:4000/graphql
pnpm codegen
# This regenerates types and should include defaultCalloutTemplate fields
```

### Development Environment

1. **Node version**: ≥20.19.0 (check with `node --version`)
2. **pnpm version**: ≥10.17.1 (check with `pnpm --version`)
3. **Backend running**: Alkemio server at `localhost:3000`
4. **Branch**: `001-flow-post-template` (or develop after merge)

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate GraphQL Types

```bash
# Ensure backend is running first
pnpm codegen
```

**Expected output**:

- Updated `src/core/apollo/generated/apollo-hooks.ts`
- Updated `src/core/apollo/generated/graphql-schema.ts`
- Should include:
  - `InnovationFlowStatesFragment` with `defaultCalloutTemplate` field
  - `useTemplateContentLazyQuery` hook (after member flow implementation)
  - `useSetDefaultCalloutTemplateOnInnovationFlowStateMutation` hook
  - `useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation` hook

### 3. Start Development Server

```bash
pnpm start
```

**Server will run at**: `http://localhost:3001`

### 4. Run Linter (Optional)

```bash
pnpm lint
```

Should pass with no errors.

## Testing the Feature

### Admin Flow: Set Default Template

#### Step 1: Navigate to Layout Settings

1. Log in as a Space admin
2. Navigate to any Space you have admin access to
3. Go to **Settings → Layout** (or use direct URL: `/spaces/{spaceId}/settings/layout`)

#### Step 2: Open Flow State Menu

1. In the Layout Settings page, you'll see innovation flow states displayed as cards (e.g., "Ideation", "Development", "Testing")
2. Click the **three-dot menu** (⋮) on any flow state card

**Expected**: Menu opens with options including:

- Set as Current State (if not already current)
- Add State After
- Edit State
- **Set Default Post Template** ← NEW OPTION
- Delete State (if allowed)

#### Step 3: Select Template

1. Click **"Set Default Post Template"**
2. Dialog opens titled: **"Template Library: Collaboration Tool Template"**

**Expected dialog content**:

- Subtitle: "No default template set. Select a template to pre-fill posts in this flow state." (if no template set)
- OR: "Current template: [Template Name]" (if template already set)
- List of CALLOUT templates from space library and platform library
- Each template shows: Title, description, preview button

3. Browse and select a template by clicking on it
4. Confirm selection (dialog has "Select" button)

**Expected behavior**:

- Dialog closes
- Template is set for this flow state
- No error messages

#### Step 4: Verify Template is Set

1. Reopen the three-dot menu on the same flow state
2. Click **"Set Default Post Template"** again

**Expected**: Dialog shows "Current template: [Template Name]" at the top

#### Step 5: Test Duplicate Prevention

1. With the dialog still open showing the current template
2. Click on the **same template** again (the one shown as current)

**Expected behavior**:

- ❌ Dialog does NOT close
- ❌ No API request is made (check Network tab in DevTools)
- ✅ "Select" button is disabled for the current template
- User can close dialog manually or select a different template

#### Step 6: Change Template

1. With the dialog open, select a **different template**
2. Confirm selection

**Expected behavior**:

- Dialog closes
- Template is updated for this flow state
- Network tab shows API request for `setDefaultCalloutTemplateOnInnovationFlowState`

#### Step 7: Remove Template

1. Reopen the template dialog for the flow state
2. Look for **"Remove Template"** button (should be visible when a template is set)
3. Click "Remove Template"

**Expected behavior**:

- Dialog closes
- Template is removed (set to null)
- Next time dialog opens, shows "No default template set"
- Network tab shows API request for `removeDefaultCalloutTemplateOnInnovationFlowState`

### Member Flow: Create Post with Template

**Note**: This section applies AFTER the member-facing flow is implemented.

#### Step 1: Navigate to Flow Step with Template

1. Log in as a Space member (non-admin role is fine)
2. Navigate to a Space with innovation flow
3. Find a callout that is classified by a flow step with a default template set

**How to verify**:

- The callout should be in a specific flow step (e.g., "Ideation")
- Admin should have set a template for that flow step (see Admin Flow above)

#### Step 2: Open Post Creation Dialog

1. Click **"Add Post"** button on the callout

**Expected behavior**:

- Post creation dialog opens immediately (non-blocking)
- Dialog shows loading state briefly (skeleton or spinner)
- Dialog form pre-fills with template content:
  - Description field has markdown text from template
  - Any other fields configured in template

**Performance check**:

- Dialog should open within 200ms
- Template content should load within 500ms
- No UI blocking

#### Step 3: Edit and Create Post

1. Edit the pre-filled content (change text, add/remove sections)
2. Fill in required fields (title, etc.)
3. Click **"Create Post"**

**Expected behavior**:

- Post is created successfully
- Post content matches your edited version (not original template)
- Post is NOT linked to template (editing template later won't affect this post)

#### Step 4: Verify Fallback Behavior

1. Navigate to a callout in a flow step **without** a default template
2. Click **"Add Post"**

**Expected behavior**:

- Dialog opens with empty description field
- OR: Dialog uses callout-level `contributionDefaults.postDescription` if set
- No errors, no broken behavior

### Edge Case Testing

#### Test: Template Deleted After Set as Default

1. Set a template as default for a flow state
2. Delete that template from the template library (Space Settings → Templates)
3. Go back to Layout Settings for that flow state

**Expected behavior**:

- Flow state's template dialog shows "No default template set"
- No errors, no broken references
- Members creating posts see empty form

#### Test: Multiple Flow Steps with Same Template

1. Set the same template as default for 2+ different flow steps
2. Verify each flow step shows the template in its dialog
3. Remove template from one flow state

**Expected behavior**:

- Other flow states still have the template set
- Removing/changing template is per-flow-state (independent)

#### Test: Flow with No Templates

1. Create a new flow or use one without any templates set
2. Navigate through the space as member
3. Create posts in callouts

**Expected behavior**:

- No errors or broken behavior
- Post creation works as before (empty form or callout defaults)

## Verification Checklist

### Admin Flow ✓

- [ ] "Set Default Post Template" menu item appears
- [ ] Dialog shows CALLOUT templates only (no POST, WHITEBOARD, etc.)
- [ ] Dialog shows "Current template: X" when template is set
- [ ] Selecting same template = no API call, dialog stays open
- [ ] Selecting different template updates successfully
- [ ] Remove template button works
- [ ] Multiple flow states can have different templates

### Member Flow ✓ (After Implementation)

- [ ] Post dialog pre-fills with template content
- [ ] Template content loads in <500ms
- [ ] User can edit pre-filled content
- [ ] Created post is independent of template
- [ ] Flow steps without templates show empty form
- [ ] No UI blocking during template load

### Performance ✓

- [ ] Admin dialog opens in <500ms
- [ ] Member dialog opens immediately (non-blocking)
- [ ] Template content loads in <500ms
- [ ] No console errors or warnings

### Edge Cases ✓

- [ ] Deleted template handled gracefully (no errors)
- [ ] Multiple flow steps can share same template
- [ ] Flow state name changes don't break template mapping

## Troubleshooting

### Issue: GraphQL codegen fails

**Symptom**: `pnpm codegen` fails with schema errors

**Solution**:

1. Ensure backend is running at `localhost:4000/graphql`
2. Verify backend has latest schema changes
3. Check GraphQL endpoint is accessible: `curl http://localhost:4000/graphql -H "Content-Type: application/json" -d '{"query":"{ __schema { types { name } } }"}'`

### Issue: "Set Default Post Template" menu item not showing

**Symptom**: Menu item missing from flow state three-dot menu

**Possible causes**:

1. Not logged in as admin (requires UPDATE privilege on innovation flow)
2. UI code not deployed (check branch is correct)
3. Component not updated with new menu item

**Debug**:

- Check `InnovationFlowStateMenu.tsx` has the new menu item
- Verify user has admin role (check Space permissions)

### Issue: Template content not loading in post dialog

**Symptom**: Post dialog opens empty even when template is set

**Possible causes** (after member flow implementation):

1. Flow state name doesn't match callout classification
2. Template content query failing
3. Component prop flow broken

**Debug**:

- Open React DevTools, inspect `CreateContributionButtonPost` props
- Check if `flowStateDefaultTemplateId` prop is present and correct
- Open Apollo DevTools, check if `TemplateContent` query fires
- Check Network tab for GraphQL errors

### Issue: Duplicate prevention not working

**Symptom**: Selecting same template closes dialog or makes API call

**Debug**:

- Check `SetDefaultTemplateDialog.tsx` has duplicate check: `if (template.id === currentTemplate?.id) return;`
- Inspect current template ID in React DevTools
- Verify `currentTemplate` prop is passed correctly from parent

### Issue: TypeScript errors after codegen

**Symptom**: `pnpm lint` or `tsc` fails with type errors

**Solution**:

1. Ensure all GraphQL documents are syntactically correct
2. Run `pnpm codegen` again
3. Check for type mismatches in component props
4. Use type assertions if needed: `(state as any)?.defaultCalloutTemplate`

## Performance Profiling

### Measure Template Loading Time

1. Open Chrome DevTools → Performance tab
2. Start recording
3. Click "Add Post" in a flow step with template
4. Stop recording after dialog fully loads

**Check**:

- Time from click to dialog open: <200ms
- Time from dialog open to content displayed: <500ms
- No long tasks blocking main thread

### Measure Bundle Impact

```bash
pnpm analyze
```

Opens interactive bundle visualization at `build/stats.html`.

**Check**:

- New components added to domain chunks
- No unexpected large dependencies
- Total bundle size increase <10KB (gzipped)

## Next Steps After Testing

### If Tests Pass ✅

1. Run full test suite: `pnpm vitest run --reporter=basic`
2. Run linter: `pnpm lint`
3. Commit changes with descriptive message
4. Create pull request against `develop` branch

### If Tests Fail ❌

1. Document specific failing scenarios
2. Check troubleshooting section above
3. Review implementation against plan.md
4. Check browser console and Network tab for errors
5. Ask for help with specific error messages

## Useful Development Commands

```bash
# Start dev server with hot reload
pnpm start

# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm vitest run --reporter=basic

# Type checking
pnpm tsc --noEmit

# Lint and fix
pnpm lint --fix

# Format code
pnpm format

# Build for production
pnpm build

# Bundle analysis
pnpm analyze
```

## Related Documentation

- **Feature Spec**: [spec.md](./spec.md) - Full requirements
- **Implementation Plan**: [plan.md](./plan.md) - Detailed implementation steps
- **Research Notes**: [research.md](./research.md) - Architecture decisions
- **Data Model**: [data-model.md](./data-model.md) - Entity relationships
- **GraphQL Contracts**: [contracts/](./contracts/) - GraphQL operations

## Support

For issues or questions:

1. Check CLAUDE.md in repo root for general guidance
2. Review plan.md for implementation details
3. Check browser console and Network tab for errors
4. Review Apollo DevTools for GraphQL issues
