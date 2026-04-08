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
