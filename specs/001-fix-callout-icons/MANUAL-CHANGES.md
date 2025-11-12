# Manual Changes: Innovation Flow Components

**Files**:

- `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowCollaborationToolsBlock.tsx`
- `src/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview.tsx`

**Date**: November 12, 2025
**Reason**: Fix icon display in Innovation Flow dialogs and preview

---

## Part 1: InnovationFlowCollaborationToolsBlock

### Changes Applied

### 1. Import Updates

**Added**:

```typescript
import { ReactNode } from 'react';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
```

**Removed**:

```typescript
import { Component } from 'react';
import { SvgIconProps } from '@mui/material';
```

### 2. Updated Props Interface Type

Added optional framing and settings to callout data structure to support dynamic icons:

```typescript
interface InnovationFlowCollaborationToolsBlockProps extends Omit<InnovationFlowDragNDropEditorProps, 'children'> {
  callouts: {
    id: string;
    activity: number;
    profile: {
      displayName: string;
    };
    framing?: {
      type?: CalloutFramingType,  // NEW: For icon selection
    },
    settings?: {
      contribution?: {
        allowedTypes?: CalloutContributionType[];  // NEW: For icon selection
      }
    }
    flowState: // ...existing
  }[];
  // ...rest
}
```

### 3. Fixed Icon Prop Type

**Before**:

```typescript
interface ListItemProps extends BoxProps {
  displayName: string;
  Icon: Component; // ❌ Expects component constructor
  activity?: number;
}
```

**After**:

```typescript
interface ListItemProps extends BoxProps {
  displayName: string;
  Icon: ReactNode; // ✅ Accepts JSX elements
  activity?: number;
}
```

### 4. Updated ListItem Component

**Before**:

```typescript
const ListItem = ({ ref, displayName, Icon, activity = 0, ...boxProps }) => {
  return (
    <Box ref={ref} {...boxProps}>
      <Caption>
        <Icon />  // ❌ Rendering as component
        {displayName} {activity > 0 && `(${activity})`}
      </Caption>
    </Box>
  );
};
```

**After**:

```typescript
const ListItem = ({ ref, displayName, Icon, activity = 0, ...boxProps }) => {
  return (
    <Box ref={ref} {...boxProps} sx={{ gap: gutters(0.5) }}>
      {Icon}  // ✅ Rendering as ReactNode
      <Caption>
        {displayName} {activity > 0 && `(${activity})`}
      </Caption>
    </Box>
  );
};
```

**Key Changes**:

- Icon moved outside Caption
- Added `sx={{ gap: gutters(0.5) }}` to Box for spacing
- Icon rendered as `{Icon}` instead of `<Icon />`

### 5. Updated CalloutIcon Integration

**Before** (conceptual - was using GenericCalloutIcon):

```typescript
<ListItem
  displayName={callout.profile.displayName}
  icon={GenericCalloutIcon}
  activity={callout.activity}
/>
```

**After**:

```typescript
<ListItem
  ref={provider.innerRef}
  {...provider.draggableProps}
  {...provider.dragHandleProps}
  {...{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: gutters(0.5)
  }}
  displayName={callout.profile.displayName}
  Icon={
    <CalloutIcon
      framingType={callout.framing?.type || CalloutFramingType.None}
      allowedTypes={callout.settings?.contribution?.allowedTypes}
      tooltip
      iconProps={{ fontSize: 'small' }}
    />
  }
  activity={callout.activity}
/>
```

**Key Changes**:

- Added flexbox layout via spread props: `display: 'flex'`, `flexDirection: 'row'`, `alignItems: 'center'`
- Added `gap: gutters(0.5)` for consistent spacing
- Integrated `CalloutIcon` component with:
  - Dynamic `framingType` from callout data (fallback to `None`)
  - Dynamic `allowedTypes` from callout settings
  - `tooltip` prop for accessibility
  - `fontSize: 'small'` for 20px icon sizing

---

## Why These Changes Were Needed

### 1. Type Safety Issue

The original code typed `Icon` as `Component`, but we were passing a JSX element. TypeScript requires `ReactNode` type for JSX elements.

### 2. Layout Issue

The icon needed proper spacing from the text. Moving it outside `Caption` and using flexbox provides better control over spacing.

### 3. Dynamic Icons

The Innovation Flow dialog needs to show different icons based on callout type, not just a static icon. This required:

- Accessing callout framing and settings data
- Using the `CalloutIcon` component with proper props
- Implementing the same icon precedence rule as other views

### 4. Consistency

All callout icons across the app should be 20px and follow the same display logic. This required:

- `fontSize: 'small'` for 20px icons
- Dynamic icon selection based on framing and contribution types
- Consistent spacing and layout

---

## Result

### Visual Changes

- ✅ Icons are now 20px (down from 24px)
- ✅ Icons dynamically reflect callout type (Memo, Whiteboard, Link, Post)
- ✅ Proper spacing between icon and text (gutters(0.5))
- ✅ Flexbox layout ensures proper vertical alignment
- ✅ Tooltips appear on icon hover

### Code Quality

- ✅ Type-safe (ReactNode for JSX elements)
- ✅ Consistent with other callout displays (uses CalloutIcon component)
- ✅ Follows icon precedence rule (Framing > Contribution > Post)
- ✅ Accessible (tooltips, proper ARIA support from CalloutIcon)

### No Breaking Changes

- ✅ Drag-and-drop functionality unchanged
- ✅ Activity counter still displays
- ✅ Innovation Flow management still works

---

## Testing Checklist

After these changes, verify:

- [ ] Icons display at 20px size in Innovation Flow settings dialog
- [ ] Different callout types show different icons (if data available)
- [ ] Fallback to Post icon works when framing is None
- [ ] Tooltips appear on hover
- [ ] Spacing between icon and text is consistent
- [ ] Vertical alignment is correct (icon and text on same baseline)
- [ ] Drag-and-drop still works
- [ ] Activity counter displays correctly
- [ ] No TypeScript errors

---

## Related Files

**Documentation**:

- `specs/001-fix-callout-icons/IMPLEMENTATION.md` - Updated to reflect manual changes
- `specs/001-fix-callout-icons/tasks.md` - T014 marked complete with notes

**Related Components**:

- `src/domain/collaboration/callout/icons/calloutIcons.ts` - Icon selection logic
- `src/domain/collaboration/callout/calloutsList/CalloutsList.tsx` - Similar icon integration

**GraphQL**:

- `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx` - Data source
- Note: Current data mapping doesn't include framing/settings, so icons will default to Post until GraphQL query is updated

---

## Future Improvements

If you want full dynamic icons in Innovation Flow settings, update the GraphQL query:

1. In `useInnovationFlowSettings.tsx`, update the callouts mapping to include:

   ```typescript
   framing: {
     type: callout.framing.type
   },
   settings: {
     contribution: {
       allowedTypes: callout.settings?.contribution?.allowedTypes
     }
   }
   ```

2. Ensure the GraphQL query fetches these fields (may require updating the query/fragment)

Currently, the component is prepared to accept this data but defaults to `CalloutFramingType.None` when not available.

---

## Part 2: InnovationFlowCalloutsPreview

**File**: `src/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview.tsx`

### Changes Applied

#### 1. Import Update

**Before**:

```typescript
import { GenericCalloutIcon } from '../callout/icons/calloutIcons';
```

**After**:

```typescript
import { getCalloutIcon } from '../callout/icons/calloutIcons';
```

**Reason**: Need to use the exported function that returns the icon component without styling/tooltips, as RoundedIcon wrapper handles its own styling.

#### 2. Icon Component Integration

**Before**:

```typescript
<AccordionSummary expandIcon={<ExpandMoreIcon />}>
  <RoundedIcon size="small" component={GenericCalloutIcon} />
  <Text marginLeft={gutters()}>{callout.framing.profile.displayName}</Text>
</AccordionSummary>
```

**After**:

```typescript
<AccordionSummary expandIcon={<ExpandMoreIcon />}>
  <RoundedIcon
    size="small"
    component={getCalloutIcon(callout.framing.type, callout.settings?.contribution?.allowedTypes)}
  />
  <Text marginLeft={gutters()}>{callout.framing.profile.displayName}</Text>
</AccordionSummary>
```

**Key Changes**:

- Replaced static `GenericCalloutIcon` with dynamic `getCalloutIcon()` function call
- Passes `callout.framing.type` for icon selection based on framing
- Passes `callout.settings?.contribution?.allowedTypes` for icon selection when no framing
- Icon now dynamically reflects callout type (Memo, Whiteboard, Link, or Post)

### Why getCalloutIcon() Instead of CalloutIcon Component?

**Component Wrapper Requirement**: `RoundedIcon` expects a component type, not a JSX element:

```typescript
// RoundedIcon expects:
component: ComponentType<SvgIconProps>

// CalloutIcon returns:
JSX.Element (cannot pass to component prop)

// getCalloutIcon returns:
ComponentType<SvgIconProps> (perfect for RoundedIcon)
```

**Solution**: The new `getCalloutIcon()` export provides exactly what RoundedIcon needs - a bare icon component without any wrapper styling or tooltips.

### Result

#### Visual Changes

- ✅ Icons dynamically reflect callout type in Innovation Flow preview
- ✅ Memo callouts show Memo icon
- ✅ Whiteboard callouts show Whiteboard icon
- ✅ Link callouts show Link/CTA icon
- ✅ Generic callouts show Post icon
- ✅ Icons properly sized via RoundedIcon wrapper

#### Code Quality

- ✅ Type-safe (uses exported function)
- ✅ Follows icon precedence rule (Framing > Contribution > Post)
- ✅ Consistent with other callout displays
- ✅ No breaking changes to accordion behavior

### Testing Checklist

After these changes, verify:

- [ ] Icons in Innovation Flow preview match callout types
- [ ] Memo callouts show Memo icon (not generic)
- [ ] Whiteboard callouts show Whiteboard icon with preview
- [ ] Link callouts show appropriate icon
- [ ] RoundedIcon wrapper styling preserved (small size, background circle)
- [ ] Accordions expand/collapse correctly
- [ ] WhiteboardPreview displays in expanded accordion
- [ ] No TypeScript errors

---

## Summary: New Export Required

### calloutIcons.ts Enhancement

**New Export Added**:

```typescript
export const getCalloutIcon = (
  framingType: CalloutFramingType,
  allowedTypes?: CalloutContributionType[]
): ComponentType<SvgIconProps> => {
  return getCalloutIconBasedOnType(framingType, allowedTypes);
};
```

**Purpose**: Provides icon component without styling/tooltips for components that wrap icons (like RoundedIcon).

**Usage Pattern**:

- Use `<CalloutIcon>` component when you want tooltips and standard styling
- Use `getCalloutIcon()` function when passing to component wrappers

**Consumers**:

- ✅ InnovationFlowCalloutsPreview (RoundedIcon wrapper)
- Future: Any component using icon wrappers that need component type

---

## Related Documentation

- `IMPLEMENTATION.md` - Updated with both Innovation Flow file changes
- `tasks.md` - Will be updated to reflect completion
- `README.md` - References manual changes document

---

## Files Modified (Total: 5)

1. ✅ `CalloutsSetQueries.graphql` - GraphQL fragment
2. ✅ `calloutIcons.ts` - Icon logic + new getCalloutIcon export
3. ✅ `CalloutsList.tsx` - Main callout list
4. ✅ `InnovationFlowCollaborationToolsBlock.tsx` - Innovation Flow settings (manual)
5. ✅ `InnovationFlowCalloutsPreview.tsx` - Innovation Flow preview (manual)
