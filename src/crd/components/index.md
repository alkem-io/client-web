# CRD Components

Brief descriptions of each component in this directory.

## common/

### AlkemioLogo (`common/AlkemioLogo.tsx`)

SVG rendering of the Alkemio brand logo. Accepts `className` for sizing.

### StackedAvatars (`common/StackedAvatars.tsx`)

Displays one or two avatars in a stacked arrangement. When `secondary` is provided,
renders a smaller avatar behind and a larger avatar in front — used for showing
parent-child entity relationships (e.g. a subspace within its parent space). Falls
back to a single avatar when no secondary is given. Supports image or initials
fallback with dynamic background colors.

### PollVoterAvatars (`common/PollVoterAvatars.tsx`)

Stacked row of voter avatars for poll options. Shows up to `maxVisible` (default 10) small
avatars with hover-expand spacing. Overflow renders a "+N" circle with tooltip. Uses Avatar
and Tooltip primitives.

### ExpandableDescription (`common/ExpandableDescription.tsx`)

Truncated text with expand/collapse toggle.

### MarkdownContent (`common/MarkdownContent.tsx`)

Renders sanitized HTML with Tailwind prose classes.

### ContentBlock (`common/ContentBlock.tsx`)

Generic block with optional accent border, title, actions slot, and children.

## dialogs/

### ConfirmationDialog (`dialogs/ConfirmationDialog.tsx`)

Generic confirmation dialog built on the AlertDialog primitive. Accepts title, description,
confirm/cancel labels, confirm callback, optional `variant: 'destructive'` for red confirm
button, and `loading` state (disables buttons + aria-busy). Default cancel label from i18n.

## callout/

### CalloutPoll (`callout/CalloutPoll.tsx`)

Full-featured poll display component supporting single-choice (RadioGroup) and multi-choice
(Checkbox) voting, results overlay with progress bars and vote counts/percentages, voter
avatars per option (via PollVoterAvatars), custom option input row, status messages with
progress indicator, vote removal link, closed/anonymous labels, and min/max constraint
helper text. All state management (debounce, optimistic updates, subscriptions) happens in
the connector — this component is purely presentational.

### CalloutDetailDialog (`callout/CalloutDetailDialog.tsx`)

Full-screen dialog for callout details: sticky header with title/author and share/options/close
buttons, scrollable body with title, author, description, optional poll slot, reactions bar,
optional contributions section, discussion section with comments slot, and sticky comment
input footer.

## space/

### SpaceCard (`space/SpaceCard.tsx`)

Card component for displaying a space summary: banner image with gradient overlay,
privacy badge (public/private), stacked avatars, name, parent indicator, description,
tags (capped at 3 + overflow count), and lead avatars. Includes a `SpaceCardSkeleton`
for loading states. All navigation (card click, parent click) is handled via prop
callbacks.

### SpaceExplorer (`space/SpaceExplorer.tsx`)

Full-page space listing with tag-based search, sort dropdown (recent/alpha/active),
multi-section filters (membership: server-side; privacy and type: client-side), active
filter chips, responsive card grid, "Load More" pagination, and empty state. Receives
space data and callbacks from the consumer; all data fetching is external.

---

## whiteboard/

### WhiteboardEditorShell (`whiteboard/WhiteboardEditorShell.tsx`)

Full-screen dialog shell for the whiteboard editor. Accepts `title`, `titleExtra`, `headerActions`, `children` (canvas slot), and `footer` as ReactNode props. Used by both multi-user (collaborative) and single-user (save mode) whiteboard contexts.

### WhiteboardDisplayName (`whiteboard/WhiteboardDisplayName.tsx`)

Inline-editable title with three modes: read-only (plain text), view (text + edit button), edit (input + save/cancel). Supports save loading state.

### WhiteboardCollabFooter (`whiteboard/WhiteboardCollabFooter.tsx`)

Multi-user editor footer with delete button, readonly reason message slot, restart collaboration button, guest contributions warning badge, and guest access badge slot.

### WhiteboardSaveFooter (`whiteboard/WhiteboardSaveFooter.tsx`)

Single-user editor footer with Delete (left) and Save (right, primary variant with loading spinner) buttons. Used for template editing and callout creation.

### PreviewSettingsDialog (`whiteboard/PreviewSettingsDialog.tsx`)

Preview mode selector dialog with 3 mode buttons (Auto, Custom, Fixed). Each rendered as a bordered card with lucide-react icon, title, and description. Selected mode highlighted with primary border.

### PreviewCropDialog (`whiteboard/PreviewCropDialog.tsx`)

Image crop/zoom/pan dialog using react-image-crop. Renders a canvas-exported Blob as an img, with aspect-ratio-constrained crop overlay, scroll-wheel zoom (1x-8x), and pointer-drag pan. Reset/Cancel/Confirm actions.

### JoinWhiteboardDialog (`whiteboard/JoinWhiteboardDialog.tsx`)

Guest name prompt dialog for public whiteboard access. Welcome text, name input with validation, "Join as Guest" primary button, "Sign In to Alkemio" outline button.

### WhiteboardErrorState (`whiteboard/WhiteboardErrorState.tsx`)

Centered error display with AlertCircle icon, title, message, and optional retry button. Used for 404 and 500 states on the public whiteboard page.

## forms/markdown/

### MarkdownEditor (`forms/markdown/MarkdownEditor.tsx`)

Tiptap-based rich text editor with markdown in/out. Bundles markdown ↔ HTML conversion
via the unified pipeline. CRD toolbar with lucide-react icons (bold, italic, headings,
lists, blockquote, code block, horizontal rule, table operations, link, emoji). Accepts
`value` (markdown string), `onChange`, `placeholder`, `maxLength`, `disabled`. Used as
the callout description field via `descriptionSlot` on `AddPostModal`.
