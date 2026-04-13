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
