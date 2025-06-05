# Collaborative Markdown Editor Integration

## Overview
Successfully integrated a collaborative markdown editor into the CalloutForm component using Y.js and Hocuspocus for real-time collaboration.

## Architecture

### Components
- **CollaborativeMarkdownInput**: Main collaborative editor component with TipTap + Y.js
- **FormikCollaborativeMarkdownField**: Formik wrapper for collaborative editor
- **CalloutForm**: Integration point where collaborative editor is used

### Key Features
- ✅ Real-time collaborative editing with Y.js
- ✅ User awareness (shows active users with colors)
- ✅ Connection status indicator
- ✅ Proper initialization timing to prevent race conditions
- ✅ Error handling and user notifications
- ✅ Consistent user color generation based on user ID

## Technical Implementation

### Files Modified
1. **`/src/core/ui/forms/MarkdownInput/CollaborativeMarkdownInput.tsx`**
   - Fixed Y.js document initialization timing issue
   - Added awareness tracking for active users
   - Proper error handling and connection status

2. **`/src/domain/collaboration/callout/CalloutForm.tsx`**
   - Replaced `FormikMarkdownField` with `FormikCollaborativeMarkdownField`
   - Added user context and color generation
   - Configured collaboration settings

### Files Created
1. **`/src/core/ui/forms/MarkdownInput/utils/userColorGenerator.ts`**
   - Utility for generating consistent user colors based on user ID
   - Hash-based color assignment from predefined palette

## Configuration

### Server Setup
- **Hocuspocus Server**: Running on `localhost:4001`
- **Client App**: Running on `localhost:3002`

### User Configuration
```typescript
const collaborativeUserInfo = {
  name: currentUser?.profile.displayName || 'Anonymous',
  userId: currentUser?.user.id || 'anonymous',
  color: generateUserColor(currentUser?.user.id || 'anonymous')
};
```

### Document ID
- For existing callouts: Based on callout ID
- For new callouts: Timestamp-based unique ID

## Testing the Integration

### 1. Basic Functionality Test
1. Navigate to any callout form in the application
2. Verify the editor loads with "Connected" status indicator
3. Type in the editor and verify content updates

### 2. Real-time Collaboration Test
1. Open the same callout form in multiple browser tabs/windows
2. Type in one tab and verify changes appear immediately in other tabs
3. Check that active users are displayed with colored avatars
4. Verify cursor positions are synchronized

### 3. Connection Status Test
1. Stop the Hocuspocus server (`kill -9 <pid>`)
2. Verify the editor shows "Disconnected" status
3. Restart the server and verify reconnection

## Key Technical Fixes Applied

### 1. Y.js Document Timing Issue
**Problem**: TipTap editor was being created before Y.js document was ready, causing null reference errors.

**Solution**:
```typescript
// Always create a valid editor, but conditionally add collaboration extensions
const editorOptions = useMemo(() => {
  const baseExtensions: any[] = [
    StarterKit.configure({ history: false }),
    ImageExtension, Link, Highlight, Iframe,
  ];

  // Only add collaboration when Y.js is ready
  if (isInitialized && ydocRef.current && providerRef.current) {
    try {
      baseExtensions.push(
        Collaboration.configure({ document: ydocRef.current }),
        CollaborationCursor.configure({ provider: providerRef.current, user: userInfo })
      );
    } catch (error) {
      console.warn('Failed to configure collaboration extensions:', error);
    }
  }

  return { extensions: baseExtensions, content: '' };
}, [isInitialized, userInfo]);
```

### 2. Awareness Tracking
**Problem**: Active users weren't being tracked or displayed.

**Solution**: Added `onAwarenessUpdate` callback to Hocuspocus provider to track user states.

### 3. Type Safety
**Problem**: TypeScript errors with editor options typing.

**Solution**: Use `undefined` instead of `null` for conditional editor initialization.

## Dependencies
- `@tiptap/react`
- `@tiptap/extension-collaboration`
- `@tiptap/extension-collaboration-cursor`
- `yjs`
- `@hocuspocus/provider`

## Status: ✅ COMPLETE
The collaborative markdown editor is fully integrated and ready for testing. The implementation resolves all known timing issues and provides a robust real-time collaborative editing experience.
