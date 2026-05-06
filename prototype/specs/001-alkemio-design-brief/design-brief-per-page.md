# Alkemio Design Briefs — Per-Page Prompts for Figma Make

## Page 1: Dashboard (Home)

**Route**: `/` (post-login)  
**Audience**: All authenticated users  
**Primary Use**: Central hub for space discovery and activity awareness

### Design Brief

You are designing the homepage/dashboard for Alkemio, a collaborative innovation platform. This is the first page users see after logging in.

**Key Elements**:

1. **Header Section**
   - Welcome message (e.g., "Welcome, Jeroen!")
   - Tagline (e.g., "Ready to make some impact?")
   - Decorative background image (from Unsplash; see Image Sourcing below)
   - Background: Full-width, high-resolution image with overlay to ensure text readability
   - **Image Sourcing**: Pull from Unsplash search terms: "people collaborating", "innovation", "teamwork", "office collaboration", "creative team". Choose vibrant, inspiring imagery that conveys connection and innovation. Use a semi-transparent overlay (40-50% opacity) over the image to ensure text visibility.

2. **Recent Spaces Cards** (horizontal scrolling row)
   - Show 4 most recent spaces user visited
   - Each card: Space thumbnail image (high-quality, from Unsplash; see Image Sourcing below), name, lock icon (if private), color/avatar
   - "Explore all your Spaces" link → full spaces directory
   - Clicking card navigates to space
   - **Image Sourcing**: Pull diverse images from Unsplash related to: "collaboration", "teamwork", "innovation", "design thinking", "workshops", "brainstorming". Each card should have a unique, relevant image. Use 16:9 aspect ratio.

3. **Activity Feeds** (two-column layout, equal width)
   - **Left**: "Latest Activity in my Spaces" (activity from spaces user belongs to)
   - **Right**: "My Latest Activity" (activity user created)
   - Per-activity item: User avatar, action description (e.g., "Posted to..."), timestamp, "Show more" button

4. **Left Sidebar Navigation**
   - Invitations (pending)
   - Tips & Tricks (help modal)
   - My Account (profile/settings)
   - Create my own Space (wizard)
   - Activity View toggle (on/off)
   - Resources list (spaces/orgs user has access to)

5. **Top Navigation Bar**
   - Search input (left-aligned, searchable spaces/content)
   - Notifications icon with badge count
   - Profile menu (dropdown): avatar + name + role

**Visual Requirements**:
- Card-based layout for spaces
- Soft shadows and subtle hover effects
- Icons for actions (invites, tips, account, create)
- Responsive: on mobile, stack columns and hide sidebar (hamburger)

**Personas**: All (Contributor, Facilitator, Portfolio Owner)

---

## Page 2: Space Home

**Route**: `/space/[space-slug]`  
**Audience**: Space members (Contributors, Facilitators)  
**Primary Use**: Central hub for collaboration within a space

### Design Brief

You are designing the space homepage (Space Home tab), the main activity feed view for a space. This is where members see posts, updates, and engage with content.

**Key Elements**:

1. **Top Navigation Tabs** (horizontal pill buttons)
   - HOME (current page)
   - COMMUNITY
   - SUBSPACES
   - KNOWLEDGE BASE
   - Right-side icons: Activity logs, video calls, sharing, settings (admin-only)

2. **Activity Feed / Posts** (main content area)
   - Vertical stack of post cards
   - Post types: text posts, posts with embedded whiteboards, posts with collections
   - Each post shows: Author avatar/name, title, snippet, timestamp, embedded content preview
   - Response/collection types: Comments (if enabled), whiteboards (embedded), collections (grid preview)
   - "Show more" pagination

3. **Left Sidebar** (context panel)
   - Welcome/onboarding callout (customizable)
   - Subspaces list (child spaces with names/icons)
   - "Show all" link → Subspaces tab

4. **Create Content Entry Point**
   - "Add Post" button (top-right of feed)

**Visual Requirements**:
- Large, readable cards for posts
- Embedded whiteboards preview (thumbnail or canvas)
- Collections displayed as mini-grid (up to 4 items shown inline)
- Visual hierarchy: Title > Author > Content > Meta
- Smooth hover effects on posts (shadow, slight lift)

**Personas**: Contributor, Facilitator

---

## Page 3: Space: Community Tab

**Route**: `/space/[space-slug]/community`  
**Audience**: Space members  
**Primary Use**: View and discover members, roles, and team composition

### Design Brief

You are designing the Community tab, which shows the members of a space and their roles.

**Key Elements**:

1. **Member List / Cards**
   - Grid or list of member cards
   - Each card: Avatar, name, role (Contributor, Facilitator, etc.), join date (optional)
   - Filter/sort by role or activity
   - Search by name

2. **Actions** (per member or global)
   - View profile (click avatar/name)
   - Invite new members (if permitted)
   - Manage roles (if admin)

**Visual Requirements**:
- Card-based or table layout (your choice, justified by UX)
- Role badges with distinct colors or icons
- Avatar prominence
- Mobile-friendly (responsive grid)

**Personas**: Contributor (view-only), Facilitator (manage, invite)

---

## Page 4: Space: Subspaces Tab

**Route**: `/space/[space-slug]/subspaces`  
**Audience**: Space members  
**Primary Use**: Discover and navigate to child subspaces

### Design Brief

You are designing the Subspaces tab, which displays all child subspaces (challenges/focused workstreams) within this space.

**Key Elements**:

1. **Subspace Card Grid**
   - Display subspaces as cards in a grid (responsive)
   - Each card: Thumbnail image (from Unsplash; see Image Sourcing below), name, description, member count, last active
   - Click to navigate to subspace
   - Create Subspace button (if permitted)
   - **Image Sourcing**: Pull diverse images from Unsplash related to: "workstreams", "project management", "collaboration", "agile", "workflow", "team sprint", "focus work". Each subspace card should have a unique, relevant image. Use 16:9 aspect ratio.

2. **Filtering / Sorting** (optional)
   - By status (active, archived)
   - By role (created by user, member of, etc.)

**Visual Requirements**:
- Consistent card styling (matches space card style)
- Clear hierarchy: Name > Description > Metadata
- Visual feedback on click/hover

**Personas**: Contributor (browse), Facilitator (create/manage)

---

## Page 5: Space: Knowledge Base Tab

**Route**: `/space/[space-slug]/knowledge-base`  
**Audience**: Space members  
**Primary Use**: Access and manage shared resources (documents, links, files)

### Design Brief

You are designing the Knowledge Base tab, a repository of curated resources and documents for the space.

**Key Elements**:

1. **Resource List / Cards**
   - Display resources as cards or list items
   - Types: Links, files, documents, whiteboards (organized or mixed)
   - Each item: Name, description, file type icon, uploaded by, last modified
   - Click to open/download

2. **Organization**
   - Categories or folders (if supported)
   - Search/filter by type or name

**Visual Requirements**:
- Clear file type indicators (icons)
- Readable table layout or card grid
- Easy to scan and sort

**Personas**: All members (Contributors browse/use; Facilitators manage/upload)

---

## Page 6: Add Post Modal

**Route**: Triggered from Space Home or Subspace pages  
**Audience**: Space members (with post creation permission)  
**Primary Use**: Create and publish posts with templates, responses, and content types

### Design Brief

You are designing the Add Post dialog/modal, where users create posts within a space or subspace.

**Key Elements**:

1. **Post Form**
   - Title input
   - Tags input (comma-separated or pill-style)
   - Description (rich text editor with formatting toolbar: bold, italic, underline, lists, headings, links, quotes, code)
   - Additional Content selector (Whiteboard, Collection, etc.)
   - References/Links input

2. **Response Options** (expandable section)
   - Collect feedback/responses via:
     - Comments (toggle: allow/disallow)
     - Collections (allow members to add items; toggle permission)
   - Collection Type selector (Links, Posts, Memos, Whiteboards)
   - Collection permissions (who can add, public/private)

3. **Template Selection**
   - Dropdown or pill buttons for templates (Brainstorm, Decision, Announcement, Feedback/Survey, etc.)
   - Selecting template auto-populates form fields and response options

4. **Actions** (bottom)
   - Save as Draft button
   - Post (publish immediately)
   - Cancel

**Visual Requirements**:
- Large, focused modal (center of screen, dark overlay)
- Clear form flow (top to bottom)
- Rich text editor toolbar above text area
- Sticky footer with action buttons
- Responsive: full-height on mobile with scrollable content

**Personas**: Contributor (create posts), Facilitator (create posts with templates, configure responses)

---

## Page 7: Subspace Page (Individual Subspace)

**Route**: `/{space-slug}/challenges/{subspace-slug}`  
**Audience**: Subspace members  
**Primary Use**: Focused collaboration area for a specific workstream

### Design Brief

You are designing the homepage of an individual subspace, a focused collaboration area similar to Space Home but for a specific subspace (e.g., "Designing Alkemio" challenge).

**Key Elements**:

1. **Subspace Header** (banner)
   - Large background image (from Unsplash; see Image Sourcing below)
   - Subspace title (e.g., "Designing Alkemio")
   - Description/subtitle
   - Parent space breadcrumb or "Back to [Space Name]" link
   - Member avatars (inline or tooltip)
   - Utility icons (search, open, settings, share)
   - **Image Sourcing**: Pull from Unsplash search terms: "design challenge", "creative workshop", "team collaboration", "innovation sprint", "design sprint". Use a full-width banner image (1200x400px or wider) with semi-transparent overlay (50% opacity, dark tint) to ensure text readability over the image.

2. **Channel Tabs** (horizontal pill buttons)
   - Multiple channels (e.g., "DESIGNING IN FIGMA", "WRITING", "CREATIVE SPACE")
   - Selecting a tab filters the activity feed to that channel
   - Channel indicators or badges (unread count, pinned items)

3. **Activity Feed** (main content, same as Space Home)
   - Posts, whiteboards, collections
   - "Add Post" button top-right

4. **Left Sidebar Context**
   - Description callout (purpose/challenge statement)
   - ABOUT button (link or detail)
   - COLLAPSE control
   - Quick action icons
   - Optional: Subspace name or navigation list

**Visual Requirements**:
- Large, prominent header with illustration
- Channel tabs visually distinct and easy to scan
- Activity feed cards consistent with Space Home
- Left sidebar collapsible for mobile

**Personas**: Contributor (participate), Facilitator (lead, configure channels)

---

## Page 8: User Profile

**Route**: `/user/[user-slug]`  
**Audience**: All platform users (own profile or other members' profiles)  
**Primary Use**: View user identity, bio, work, and memberships

### Design Brief

You are designing a user profile page, showing a user's public identity, bio, organizations, hosted resources, and memberships.

**Key Elements**:

1. **Profile Header** (banner)
   - Avatar (large, circular)
   - Name + location
   - Envelope icon (message user)
   - Settings cog (if own profile; links to account settings)
   - Decorative background image (from Unsplash; see Image Sourcing below)
   - **Image Sourcing**: Pull from Unsplash search terms: "professional profile", "team member", "professional portrait backdrop", "office environment", "workspace". Use a 1200x300px or wider banner image with semi-transparent overlay to ensure text visibility.

2. **Bio Section**
   - User-provided bio text (markdown or plain text)
   - May include links, mentions, formatting

3. **Associated Organizations**
   - Grid of org cards/logos
   - Org name, associate count, role

4. **Resources User Hosts**
   - Hosted Spaces section: card grid of spaces user manages
   - Virtual Contributors section: list/grid of AI/bot users the user manages
   - Each card: name, description, privacy (lock icon), member count

5. **Spaces User Leads** (if applicable)
   - List or cards of spaces where user has facilitator/leadership role

6. **Spaces User is In**
   - List or cards of spaces where user is a member

**Visual Requirements**:
- Large header banner with avatar
- Left column for bio/orgs, right column for resources (or responsive stack on mobile)
- Card-based layout for spaces/resources
- Clear visual hierarchy

**Personas**: All (self-view or profile browsing)

---

## Page 9: My Account: Account Tab

**Route**: `/user/[user-slug]/settings/account`  
**Audience**: Authenticated user (own account only)  
**Primary Use**: Manage hosted spaces, virtual contributors, template packs, and custom homepages

### Design Brief

You are designing the Account tab within the user's account settings area. This page shows account-level resources and capacities.

**Key Elements**:

1. **Account Area Navigation Tabs** (top horizontal)
   - MY PROFILE
   - ACCOUNT (current)
   - MEMBERSHIP
   - ORGANIZATIONS
   - NOTIFICATIONS
   - SETTINGS

2. **Hosted Spaces Card Grid**
   - Show spaces user creates/manages
   - Each card: Thumbnail image (from Unsplash; see Image Sourcing below), name, description, plan tier badge (Plus, Premium, etc.), capacity (e.g., "2/5")
   - Per-card overflow menu (3-dot): actions (edit, delete, etc.)
   - Floating **+** button (create new space)
   - **Image Sourcing**: Pull diverse images from Unsplash related to: "spaces", "rooms", "collaboration", "open office", "workspace design", "creative space". Use 16:9 aspect ratio for card thumbnails.

3. **Virtual Contributors Card Grid**
   - AI/bot users managed by this user
   - Similar card layout: Name, description, capacity
   - Floating **+** button (create new VC)

4. **Template Packs Card**
   - Empty-state or list of custom template packs
   - Floating **+** button (create new template pack)
   - Capacity counter (e.g., "0/5")

5. **Custom Homepages Card**
   - Empty-state or custom homepage configurations
   - Floating **+** button (create new homepage)
   - Capacity counter (e.g., "0/1")

6. **Help Text**
   - Brief explanatory copy: "Here you can see your resources and manage your account allocation."

**Visual Requirements**:
- Large cards with name, description, badges, overflow menu
- Floating **+** buttons for quick create actions (bottom-right of card or center)
- Capacity indicators (e.g., "2/5" showing usage)
- Responsive grid layout
- Consistent card styling across all 4 sections

**Personas**: All (view and manage personal account resources)

---

## Page 10: My Account: My Profile Tab

**Route**: `/user/[user-slug]/settings/profile`  
**Audience**: Authenticated user (own account only)  
**Primary Use**: Edit profile identity, avatar, bio, links

### Design Brief

You are designing the My Profile tab within account settings, where users edit their personal profile information.

**Key Elements**:

1. **Avatar Section** (left side or top)
   - Large circular avatar image
   - EDIT button below (upload/change)

2. **Profile Form** (right side or below)
   - First Name (text input)
   - Last Name (text input)
   - Nickname (text input)
   - Email (display-only or linked)
   - Organization (dropdown or linked field)
   - Bio (rich text editor with formatting toolbar: bold, italic, underline, strikethrough, lists, headings, links, quotes, code)
   - Tagline (short text)
   - City (location text)

3. **Links & Social Section**
   - LinkedIn (linked input)
   - Twitter (linked input)
   - GitHub (linked input)
   - Custom email link (input)
   - Add Reference button (add more links)

4. **Save Button** (bottom, full-width)

**Visual Requirements**:
- Two-column layout: Avatar (left) + Form (right), or responsive stack on mobile
- Rich text editor with toolbar in Bio field
- Form field labels and helpful placeholders
- Success confirmation on save
- Mobile-responsive (full-width form)

**Personas**: All users (self-edit profile)

---

## Page 11: My Account: Membership Tab

**Route**: `/user/[user-slug]/settings/membership`  
**Audience**: Authenticated user (own account only)  
**Primary Use**: View and manage memberships across spaces and subspaces

### Design Brief

You are designing the Membership tab, showing all spaces and subspaces the user belongs to.

**Key Elements**:

1. **Membership Card Grid**
   - Display spaces/subspaces as cards (similar to Dashboard or Subspaces tab), but with a button to leave that space or subspace
   - Each card: Thumbnail image (from Unsplash; see Image Sourcing below), name, description, plan tier badge, member count, last active
   - Per-card overflow menu (3-dot): actions (view details, leave, etc.)
   - Pagination or "Load more" for large lists
   - **Image Sourcing**: Pull diverse images from Unsplash related to: "teams", "group work", "collaboration", "community", "people together", "shared workspace". Use 16:9 aspect ratio for card thumbnails.

2. **Filtering / Sorting** (optional)
   - By status (active, archived, pending)
   - By role (member, facilitator)

3. **Invite / Join Entry Point** (optional)
   - Floating **+** button or "Join Space" link

**Visual Requirements**:
- Consistent card styling (matches other space grids)
- Pagination or infinite scroll
- Responsive grid layout
- Capacity counter if applicable (e.g., "Showing 12 of 50 memberships")

**Personas**: All users (manage their memberships)

---

## Page 12: My Account: Organizations Tab

**Route**: `/user/[user-slug]/settings/organizations`  
**Audience**: Authenticated user (own account only)  
**Primary Use**: View and manage organization affiliations

### Design Brief

You are designing the Organizations tab, showing organizations the user is associated with.

**Key Elements**:

1. **Associated Organizations List / Cards**
   - Multi-column card grid or 2-column table
   - Each org card: Avatar/logo (from Unsplash or use org icon/initials; see Image Sourcing below), name, location, associates count badge (e.g., "Associates (12)")
   - Per-org action: DISASSOCIATE button
   - "Verified" badge for verified organizations
   - **Image Sourcing**: For org avatars without specific logos, pull abstract/geometric images from Unsplash related to: "organization", "corporate", "branding", "identity", "abstract color". Use square images (200x200px) as avatar backgrounds. Alternatively, use org initials in a colored badge if avatars are not available.

2. **CREATE Button** (top-right)
   - Launch modal or form to create/associate with new org

3. **Filtering / Sorting** (optional)
   - By role (admin, associate)
   - By verification status

**Visual Requirements**:
- Card-based layout with avatar, name, location
- Clear action buttons (DISASSOCIATE, CREATE)
- Status badges (Verified)
- Associate count prominently displayed
- Responsive grid

**Personas**: All users (manage org affiliations)

---

## Page 13: My Account: Notifications Tab

**Route**: `/user/[user-slug]/settings/notifications`  
**Audience**: Authenticated user (own account only)  
**Primary Use**: Configure notification preferences (in-app and email)

### Design Brief

You are designing the Notifications tab, where users manage how they receive notifications across the platform.

**Key Elements**:

1. **Notification Preference Sections** (organized by context, each section collapsible or always expanded)

   **Space Section**
   - Notifications for space-related events (posts, comments, updates, calendar)
   - Example toggles:
     - "Receive a notification when a post is published in a community I am a member of"
     - "Receive a notification when a new comment is added to a post"
     - "Receive a notification when a new communication is shared on a community"
     - "Receive a notification when a comment is made on a post"
   - Per-preference: Dual toggles (In-app + Email)

   **Platform Section**
   - Platform-level notifications (discussions, new features, announcements)
   - Example toggles:
     - "Receive a notification when a new comment is added to a discussion I follow"
     - "Receive a notification when a new discussion is created"
   - Per-preference: Dual toggles (In-app + Email)

   **Organization Section**
   - Org-related notifications (mentions, messaging, team updates)
   - Example toggles:
     - "Receive a notification when my organization is mentioned"
     - "Receive direct messages to my organization"
   - Per-preference: Dual toggles (In-app + Email)

   **User Section**
   - Personal interaction notifications (replies, mentions, invites, messages)
   - Example toggles:
     - "Receive a notification when someone replies to my comment"
     - "Receive a notification when I am mentioned"
     - "Receive a notification when someone sends me a direct message"
     - "Receive a notification when someone invites me to join a community"
     - "Receive a notification when I join a new Space"
   - Per-preference: Dual toggles (In-app + Email)

   **Virtual Contributor Section**
   - Notifications for virtual contributor activities
   - Example toggles:
     - "Receive a notification when a VC manager is invited to join a community"
   - Per-preference: Dual toggles (In-app + Email)

2. **Help Text**
   - "Here you can edit your notification preferences" (top)
   - Explanatory text per section (e.g., "This section allows you to select your preferences regarding activities on the Platform.")

3. **Channel Indicators**
   - Per-row labels: "In-app" and "Email" (column headers)
   - Toggle controls for each channel

**Visual Requirements**:
- Organized sections with collapsible headers or static display
- Clear toggle controls (binary on/off per channel)
- Two-column toggle layout (In-app | Email)
- Scrollable content (long list of preferences)
- Mobile-friendly: stacked toggles or responsive layout
- Inline help text per section

**Personas**: All users (customize notifications to their workflow)

---

## Page 14: Create a new Space (Modal/Dialog)

**Route**: Triggered from Dashboard "Create my own Space" button or left sidebar menu  
**Audience**: Space creators (Facilitators, Portfolio Owners)  
**Primary Use**: Initialize a new collaborative space with name, URL, branding, and optional tutorials

### Design Brief

You are designing the "Create a new Space" modal/dialog, where users set up a new space with identity, URL, and visual branding.

**Key Elements**:

1. **Modal Header**
   - Title: "Create a new Space"
   - Close button (X icon, top-right)
   - Optional: "CHANGE TEMPLATE" button (top-right, below title) to select from predefined space templates

2. **Form Fields** (top section)
   - **Title** (text input, required)
     - Placeholder: "Space Name"
     - Help text: "Enter a descriptive name for your space"
   
   - **URL** (text input, required)
     - Placeholder: "https://alkem.io/"
     - Help text: "Space URL slug (auto-generated from title or custom)"
   
   - **Tagline** (text input, optional)
     - Placeholder: "Tagline"
     - Help text: "Short description (1-2 sentences) of what this space is about"
   
   - **Tags** (tag input, optional)
     - Placeholder: "Add tags"
     - Help text: "Categorize your space (e.g., 'Design', 'Innovation', 'Research')"
     - Info icon: "Tags help members discover your space"

3. **Image Upload Sections** (two image uploads)
   
   **Page Banner**
   - Label: "Page banner"
   - Resolution: 1536 width x 256 height (pixels)
   - Help text: "Shown on top of the Space (also in the Subspaces) and top left navigation menu."
   - UPLOAD button (or drag-and-drop area)
   - **Image Sourcing**: Pull from Unsplash search terms: "inspiration", "community", "collaboration banner", "innovative workspace", "team culture". Use a 6:1 aspect ratio (1536x256). Choose imagery that represents the space's purpose. Use semi-transparent overlay if needed for text readability.
   
   **Card Banner**
   - Label: "Card banner"
   - Resolution: 416 width x 256 height (pixels)
   - Help text: "Shown in search results and Space overviews."
   - UPLOAD button (or drag-and-drop area)
   - **Image Sourcing**: Pull from Unsplash with similar search terms as Page banner. Use a 1.6:1 aspect ratio (416x256). Should be visually cohesive with Page banner but work well as a card thumbnail.

4. **Options & Checkboxes** (bottom section)
   - **"Add Tutorials to this Space"** (checkbox, optional)
     - Help text: "Automatically add onboarding content for new members"
   
   - **"I have read and accept the terms and agreements"** (checkbox, required)
     - Link: "click here to open them" (opens terms in new window)
     - Validation: User must check this box before creating

5. **Action Buttons** (sticky footer or bottom)
   - **CANCEL** button (secondary style, left-aligned)
   - **CREATE** button (primary style, right-aligned, disabled until required fields are filled)

**Visual Requirements**:
- Modal size: 600px–800px width (responsive), centered on screen with dark overlay
- Form layout: Single-column, clear visual hierarchy
- Image upload areas: Clear preview zones or drag-and-drop affordance
- Form validation: Real-time feedback on title/URL (e.g., "✓ URL is available" or "✗ URL already in use")
- Success state: Optional loading spinner on CREATE button during submission
- Mobile-responsive: Full-height modal on mobile, scrollable content within
- Consistent spacing (8px or 12px grid)
- Icons for form sections (image icon for banners, tag icon for tags, etc.)
- Helpful tooltips on hover over info icons

**Personas**: Facilitator (create new spaces for projects), Portfolio Owner (create spaces at org level)

---

## Page 15: Space Settings — Master Layout (with Left Sidebar Navigation)

**Route**: `/space/[space-slug]/settings/[tab]`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Central hub for configuring space identity, membership, content, and advanced settings

### Design Brief

You are designing the Space Settings area, which uses a **left sidebar vertical navigation** pattern instead of horizontal tabs. This provides better organization and scalability for multiple settings sections.

**Key Layout Elements**:

1. **Top Header Section**
   - Space name (e.g., "The Sandbox")
   - Space icon/avatar
   - Breadcrumb or "Back to Space" link (top-right)
   - "Quit Settings" button (top-right)

2. **Left Sidebar Navigation** (collapsible sections)
   - Width: 200-250px (desktop), collapsible to hamburger (mobile)
   - Background: Light gray or off-white
   - Sections with collapsible group headers:

   **SPACE IDENTITY** (collapsible group)
   - About
   - Layout

   **MEMBER MANAGEMENT** (collapsible group)
   - Community
   - Subspaces

   **CONTENT & RESOURCES** (collapsible group)
   - Templates
   - Storage

   **ADVANCED** (collapsible group)
   - Settings
   - Account

   - Active state: Current selection highlighted with background color, left accent border (teal/cyan)
   - Hover state: Subtle background highlight
   - Icons next to each item (e.g., 📋 About, 🎨 Layout, 👥 Community, etc.)

3. **Main Content Area** (right side)
   - Padding: Consistent spacing (16-24px) from edges
   - Width: Flex to fill remaining space
   - Content: Page-specific (see Pages 16-23 below)

**Visual Requirements**:
- Responsive: Sidebar collapses to hamburger menu on mobile (<768px)
- Sidebar remains visible on tablet (768px+) and desktop
- Clear visual hierarchy between group headers and items
- Smooth transitions when switching between settings pages
- Consistent spacing and typography across all settings pages
- Icons for visual affordance and scanability

**Personas**: Facilitator, Admin

---

## Page 16: Space Settings — About Tab

**Route**: `/space/[space-slug]/settings/about`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Define space identity, purpose, and target audience

### Design Brief

You are designing the About tab within Space Settings. This page allows facilitators to define the space's identity through three structured sections: What, Why, and Who.

**Key Elements**:

1. **Page Title & Description**
   - Title: "About"
   - Instructional text: "Define your space's purpose, motivation, and target audience."

2. **Space Branding Section** (at top)
   - **Page Banner Upload** (1536 x 256px)
     - Current banner preview or drag-and-drop zone
     - UPLOAD / CHANGE button
     - Help text: "Shown at the top of the Space and in Subspaces"
     - **Image Sourcing**: Pull from Unsplash related to: "community goals", "team purpose", "collaborative mission", "shared vision", "inspiration banner". Use semi-transparent overlay for text readability.
   
   - **Card Banner Upload** (416 x 256px)
     - Current banner preview or drag-and-drop zone
     - UPLOAD / CHANGE button
     - Help text: "Shown in search results and Space overviews"
     - **Image Sourcing**: Match the Page Banner theme; use cohesive but distinct imagery for card context.

3. **What Section** (Rich Text Editor)
   - Label: "What"
   - Placeholder: "Describe what this space is about..."
   - Rich text toolbar: Bold, italic, underline, headings, lists, links, quotes, code, images
   - Help text: "A clear description of the space's focus or subject matter"

4. **Why Section** (Rich Text Editor)
   - Label: "Why"
   - Placeholder: "Explain the motivation or value of this space..."
   - Rich text toolbar (same as What)
   - Help text: "Why does this space exist? What problem does it solve?"

5. **Who Section** (Rich Text Editor)
   - Label: "Who"
   - Placeholder: "Describe the target audience or ideal members..."
   - Rich text toolbar (same as What)
   - Help text: "Who should join this space? What are their roles or interests?"

6. **Tags Section** (optional)
   - Label: "Tags"
   - Pill-style input (comma-separated or individual pills)
   - Placeholder: "Add tags (e.g., 'Innovation', 'Design', 'Research')"
   - Help text: "Tags help members discover your space and understand its category"

7. **References/Links Section** (optional)
   - Label: "References"
   - Repeating fields: Title + URL
   - "+ Add Reference" button to add more
   - Help text: "Link to external resources, documents, or websites"

8. **Auto-Save Behavior**
   - Changes auto-save after 1-2 seconds of inactivity
   - Optional: Show "Saving..." indicator briefly
   - Success confirmation: Subtle "Saved" message or checkmark

**Visual Requirements**:
- Two-column layout on desktop: Left (600px) for content, right sidebar for preview
- Or single-column stacked on tablet/mobile
- Rich text editors with visible toolbars
- Form validation: Required fields marked with *
- Clear section separation (horizontal dividers or spacing)
- Drag-and-drop zones for image uploads with clear affordance

**Personas**: Facilitator (define space), Admin (manage branding)

---

## Page 17: Space Settings — Layout Tab

**Route**: `/space/[space-slug]/settings/layout`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Customize and reorder the main Space navigation tabs

### Design Brief

You are designing the Layout tab within Space Settings. This page allows facilitators to customize the four main navigation tabs (Home, Community, Subspaces, Knowledge) by renaming and reordering them.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Layout"
   - Instructional text: "Customize your Space's navigation tabs. You can rename and reorder the four main tabs below."

2. **Editable Tab Cards** (drag-and-drop list)
   - Display as four draggable cards in a vertical stack
   - Each card shows:
     - Drag handle icon (⋮⋮) on left (indicates draggable)
     - Tab icon (e.g., 🏠 for Home, 👥 for Community)
     - Current tab name (editable inline or in modal)
     - Current default position (e.g., "1st", "2nd", "3rd", "4th")
     - Description of tab purpose (read-only)
     - Edit button (pencil icon) or click to inline-edit name
     - 3-dot overflow menu (optional): Actions like Reset to Default

3. **Tab Rename Functionality** (inline or modal)
   - Click tab card or pencil icon to edit
   - Modal or inline input: "New tab name"
   - Help text: "Tab names should be clear and reflect the content (max 20 characters)"
   - Save / Cancel buttons (if modal)
   - Auto-save if inline edit

4. **Drag-and-Drop Reordering**
   - User grabs drag handle and reorders tabs vertically
   - Visual feedback: Ghost/translucent state while dragging
   - Drop zones highlighted as user drags
   - Order updates in real-time or on save

5. **Preview Section** (optional, right sidebar or below)
   - Show how tabs will appear in Space Home
   - Live update as user reorders/renames
   - "Preview in Space" button links to actual Space Home

6. **Save/Reset Buttons** (sticky footer or top-right)
   - RESET TO DEFAULT button (secondary, left)
   - SAVE CHANGES button (primary, right, disabled until changes made)
   - Confirmation on save: "Layout updated successfully"

**Visual Requirements**:
- Cards with subtle shadows and hover states (lift on hover)
- Drag handle cursor changes on hover (grab icon)
- Clear visual feedback for drag-and-drop (ghost state, drop zone highlight)
- Responsive: On mobile, show list without drag (or simplified reordering)
- Consistent with Space navigation tab styling

**Personas**: Facilitator (customize navigation), Admin (manage space structure)

---

## Page 18: Space Settings — Community Tab

**Route**: `/space/[space-slug]/settings/community`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Manage space members, applications, invitations, and permissions

### Design Brief

You are designing the Community tab within Space Settings. This page is the hub for member management, application review, and role assignment.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Community"
   - Instructional text: "Manage your space members, review applications, and configure community settings."

2. **Pending Applications & Invitations Section**
   - Header with count badge (e.g., "Pending Applications & Invitations (3)")
   - Table with columns: Name, Email, Date, Status, Type
   - Sorting: Sortable by Date (newest first) or Status
   - Filtering: Filter by Status (Pending, Invited, etc.) or Type (Application, Invite)
   - Row actions: 3-dot menu → Approve, Reject, Resend Invite, or inline Accept/Reject buttons
   - Empty state: "No pending applications. Invite users to join!"
   - Pagination: Show 10-25 per page with pagination controls

3. **Applicable Form Section** (collapsible)
   - Heading: "Application Form"
   - Description: "Questions that users must answer when applying to join this space"
   - Content: Show configured form fields (title, required yes/no)
   - Link/Button: "Edit Application Form" → opens form builder or modal
   - Help text: "This form is shown to users when they apply to join"

4. **Community Guidelines Section** (collapsible)
   - Heading: "Community Guidelines"
   - Description: "Share guidelines for member behavior and conduct"
   - Content: Link to guidelines or editable text area
   - Help text: "Display these guidelines to new members on join"
   - Link: "Edit Guidelines" or "View Guidelines"

5. **Member Organizations Section** (collapsible)
   - Heading: "Applicable Organizations"
   - Description: "Set organizations whose members can auto-join this space"
   - Content: List of associated organizations with badges (Logo, Name, Member Count)
   - Actions: "+ Add Organization" button, Remove button (X) per org
   - Help text: "Users from these orgs can automatically join without approval"

6. **Virtual Contributors Section** (collapsible)
   - Heading: "Virtual Contributors"
   - Description: "AI/bot users that participate in this space"
   - Content: List of VCs with name, status (Active/Inactive), actions
   - Actions: "+ Add Virtual Contributor" button, Remove/Edit per VC
   - Help text: "Manage AI/bot participants in your space"

7. **Member Roles & Permissions Section** (informational)
   - Display role hierarchy: Host, Admin, Lead, Member, Guest (if applicable)
   - Description of permissions per role
   - Read-only or linked to Settings tab for role configuration

**Visual Requirements**:
- Expandable/collapsible sections with chevron icons
- Tables with zebra striping for readability
- Inline actions (buttons/menus) for quick operations
- Empty states with icon and helpful message
- Responsive: Tables scroll horizontally on mobile
- Consistent button styling and color coding (approve = green, reject = red)

**Personas**: Facilitator (review applications, invite), Admin (configure form, guidelines, orgs)

---

## Page 19: Space Settings — Subspaces Tab

**Route**: `/space/[space-slug]/settings/subspaces`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Configure default subspace templates and manage existing subspaces

### Design Brief

You are designing the Subspaces tab within Space Settings. This page allows facilitators to set default templates for new subspaces and manage the subspace directory.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Subspaces"
   - Instructional text: "Edit the Subspaces in this Space. Configure default templates and view all existing subspaces."

2. **Default Subspace Template Section** (at top)
   - Heading: "Default Subspace Template"
   - Description: "Choose the default settings that will apply when creating a new Subspace within this Space."
   - Current template display: Card showing selected template name, thumbnail, description
   - "CHANGE DEFAULT TEMPLATE" button
     - Opens modal or sidebar to select from available templates
     - Templates shown as grid cards with preview images
     - Search/filter templates by category
     - Confirm selection to update default
   - Help text: "Templates can be modified during the creation process or at any time."

3. **Subspaces List/Grid** (main content area)
   - Header: "Subspaces" with count badge (e.g., "Showing 5 of 5")
   - Search bar: Filter subspaces by name or description
   - Display as card grid or sortable table
   - Per-subspace card shows:
     - Thumbnail image (from Unsplash; see Image Sourcing below)
     - Name (linked to subspace)
     - Description (1-2 lines)
     - Member count badge
     - Status badge (Active, Archived)
     - Last active date
     - 3-dot overflow menu: Edit, Archive, Delete, View
   - **Image Sourcing**: Pull diverse images from Unsplash related to: "project focus", "focused work", "sprint", "challenge", "workstream", "collaboration space". Use 16:9 aspect ratio.

4. **Create Subspace Entry Point**
   - "+ CREATE SUBSPACE" button (top-right or floating)
   - Opens guided creation modal (similar to Add Post modal)
   - Fields: Title, Description (What/Why/Who), Template selection

5. **Filtering / Sorting** (optional)
   - Filter by: Status (Active, Archived), Role (Created, Member)
   - Sort by: Name, Last Active, Member Count

**Visual Requirements**:
- Card grid layout responsive to screen size (3 cols desktop, 2 tablet, 1 mobile)
- Clear visual hierarchy: Title > Description > Metadata
- Template selector modal with large preview cards
- Hover effects on subspace cards (shadow, lift)
- Pagination or infinite scroll for large subspace lists

**Personas**: Facilitator (create/manage subspaces), Admin (configure defaults)

---

## Page 20: Space Settings — Templates Tab

**Route**: `/space/[space-slug]/settings/templates`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Browse, enable, and manage templates available to space members

### Design Brief

You are designing the Templates tab within Space Settings. This page allows facilitators to curate which templates are available to their space members.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Templates"
   - Instructional text: "Select and manage the templates available to your space members. You can create custom templates or use templates from the General Library."

2. **Template Library Sections** (grouped by type)
   - Each section is collapsible/expandable with a heading and count badge
   - Sections include:
     - **Space Templates** (e.g., "Creative Thinking", "Collaborative Tools", "Space Template Test", etc.)
     - **Collaboration Tool Templates** (e.g., for whiteboard sessions, brainstorms)
     - **Whiteboard Templates** (e.g., pre-designed whiteboard layouts)
     - **Brief Templates** (e.g., project briefs, decision briefs)
     - **Community Guidelines Templates** (e.g., code of conduct templates)

3. **Template Cards** (within each section)
   - Display as grid (3-4 columns desktop, responsive)
   - Each card shows:
     - Thumbnail/preview image (from Unsplash or template-specific; see Image Sourcing below)
     - Template name
     - Brief description
     - Category badge (e.g., "Design", "Innovation", "Decision")
     - Status badge: "Enabled" (checkmark, green) or "Disabled" (grayed out)
     - Toggle or checkbox: Enable/Disable this template for the space
     - 3-dot overflow menu: Preview, Edit (if custom), Delete (if custom), Duplicate as Custom

4. **Create Custom Template** (per section)
   - "+ CREATE NEW" button per section (top-right of each template group)
   - Opens template builder modal/dialog
   - Fields: Template name, Description, Category, Thumbnail upload, Template configuration

5. **Search & Filter** (top of page)
   - Search bar: Filter templates by name or description
   - Filter dropdown: By category, by status (Enabled/Disabled)

6. **Template Preview** (optional sidebar or modal)
   - Click template card to preview
   - Shows full template details, layout, and configuration
   - Preview button opens template in context (e.g., whiteboard preview, brief preview)

**Visual Requirements**:
- Large, high-quality template preview cards with images
- Toggle switches for easy enable/disable
- Collapsible section headers with chevron icons
- Grid layout responsive to screen size
- Empty states: "No templates in this category" with option to create or browse library
- Consistent card styling across all template types

**Personas**: Facilitator (enable templates, manage availability), Admin (create custom templates)

---

## Page 21: Space Settings — Storage Tab

**Route**: `/space/[space-slug]/settings/storage`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: View and manage space documents, files, and storage usage

### Design Brief

You are designing the Storage tab within Space Settings. This page shows the space's document library and provides storage usage information.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Storage"
   - Instructional text: "View and manage documents stored in this space. Here you can see the document storage for this space."

2. **Storage Usage Section** (top, informational)
   - Storage meter/progress bar: "X GB / Y GB used" (e.g., "45 GB / 100 GB used")
   - Visual indicator: Color-coded (green = <75%, yellow = 75-90%, red = >90%)
   - Breakdown by content type (optional chart/table):
     - Documents: X GB
     - Whiteboards: X GB
     - Media/Images: X GB
     - Other: X GB
   - "Upgrade Storage" button (if applicable): Links to upgrade plans
   - Help text: "Contact Alkemio team to upgrade your storage quota"

3. **Documents Table** (main content)
   - Searchable table of all documents/files in space
   - Columns: Name, File Type (icon), Size, Uploaded By, Date Uploaded, Actions
   - Sortable: By name, size, date, or uploader
   - Filtering: By file type (Documents, Whiteboards, Images, etc.)
   - Per-file row actions:
     - Preview button (open document)
     - Download button
     - Share button (if applicable)
     - Delete button
     - 3-dot overflow menu: More actions (Move, Copy, etc.)
   - Pagination: Show 10-25 per page
   - Empty state: "No documents uploaded. Start by adding resources to the Knowledge Base!"

4. **Bulk Actions** (optional)
   - Checkboxes to select multiple files
   - Bulk actions: Delete, Download, Move to folder (if supported)

5. **Folder/Organization** (if supported)
   - Hierarchical folder structure or flat list
   - Browse folders / Upload new files option
   - Create folder button

**Visual Requirements**:
- Progress bar with color coding
- Clear file type icons (Document, PDF, Image, Video, Whiteboard, etc.)
- Responsive table: Horizontal scroll on mobile or card view
- Pagination controls at bottom
- Search bar at top with clear affordance
- Consistent button styling and spacing

**Personas**: Facilitator (manage documents), Admin (monitor storage)

---

## Page 22: Space Settings — Settings Tab

**Route**: `/space/[space-slug]/settings/settings`  
**Audience**: Space Facilitators, Space Admins  
**Primary Use**: Configure space visibility, membership policies, and allowed actions

### Design Brief

You are designing the Settings tab within Space Settings. This page houses advanced configuration for space behavior, membership, and permissions.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Settings"
   - Instructional text: "Configure your space's visibility, membership policies, and allowed member actions."

2. **Visibility Section** (collapsible or always expanded)
   - Heading: "Visibility"
   - Description: "Control who can see and access this space"
   - Radio button options (mutually exclusive):
     - **Public**: "This Space and its contents are visible to everyone on the platform. Users can only contribute if they are a member."
     - **Private**: "This Space is visible to everyone on the platform, but the content is only visible to members. Please note that both the information in the profile and the content are publicly visible."
   - Help text: "Consider your space's purpose and audience when choosing visibility"

3. **Membership Application Mode Section** (collapsible or always expanded)
   - Heading: "Membership"
   - Description: "Choose how users join your space"
   - Radio button options (mutually exclusive):
     - **No Application Required**: "All Space members can directly join, without you having to review their applications."
       - Help text: "Best for public, open collaboration spaces"
     - **Application Required**: "If people want to become a member, they have to fill in the application form. You receive their applications (see community tab here) and you can accept them or reject them. If you want, you can choose to accept these or reject them."
       - Help text: "Best for curated spaces with specific requirements"
     - **Invitation Only**: "Users can only become a member after you've invited them (select you can join the community tab here) or if they are added manually. There is no 'apply' or 'join' button for others to click."
       - Help text: "Best for private, restricted collaboration teams"

4. **Host Organization Section** (collapsible)
   - Heading: "Applicable Organizations"
   - Description: "Allow people who are associated with certain organizations to directly join this space"
   - Current organizations list (with remove buttons)
   - "+ Add Organization" button
   - Toggle: "Automatically add new users with emails matching the organization domain"
   - Help text: "Users from these orgs can bypass the application process"

5. **Allowed Actions Section** (collapsible, grid of toggles)
   - Heading: "Allowed Actions"
   - Description: "Choose which actions members can perform in this space"
   - Per-action toggle (ON/OFF):
     - **Space Invitations**: "Allow admins of Subspaces to invite users to their Subspace. Users who are not yet a member of this Space will become a member when they accept the Subspace invitation."
     - **Create Posts**: "Allow members to create posts. If you deactivate this, members will still be able to contribute to existing posts, but will not be able to create new posts."
     - **Video Calls**: "Show video call button in the tab menu. All members of this Space can use this button to start a Jitsi video conference. Read more about Jitsi here."
     - **Guest Contributions**: "Allow whiteboards in the Space to be shared with guest users (non-members) for collaborative contributions."
     - **Create Subspaces**: "Allow members to create Subspaces in this Space. If you deactivate this, you can still create Subspaces yourself and add other people as an admin inside the Subspace."
     - **Subspace Events**: "Allow events from Subspaces to be visible on this Space calendar as well."
     - **Alkemio Support**: "Allow the Alkemio Support team to act as an admin in this Space."
   - Toggle positioning: Clear ON/OFF visual state
   - Help text per toggle: Brief explanation of impact

6. **Danger Zone Section** (collapsible, visually distinct)
   - Heading: "Danger Zone" (red text or warning styling)
   - Description: "Irreversible actions"
   - **Delete this Space** button (red, prominent)
     - Help text: "Deleting this Space is permanent. Please contact the Alkemio team to delete this Space. Be careful, this action cannot be undone."
     - On click: Confirmation modal with warnings (e.g., "X members will be affected", "All posts and content will be deleted")
     - Cannot be completed via UI; requires contacting Alkemio support

**Visual Requirements**:
- Grouped sections with collapsible headers
- Clear visual hierarchy: Section title > Description > Options
- Toggle switches with clear ON/OFF states
- Radio buttons for mutually exclusive options
- Consistent spacing and typography
- Warning/danger styling for "Danger Zone"
- Help text italicized and in muted color
- Responsive: Stack sections vertically on mobile

**Personas**: Facilitator (basic settings), Admin (full configuration)

---

## Page 23: Space Settings — Account Tab

**Route**: `/space/[space-slug]/settings/account`  
**Audience**: Space Admins, Space Hosts  
**Primary Use**: View space metadata, license, and host information

### Design Brief

You are designing the Account tab within Space Settings. This page displays read-only space account information including URL, license, visibility status, and host details.

**Key Elements**:

1. **Page Title & Description**
   - Title: "Account"
   - Instructional text: "Here you find all your Spaces, Virtual Contributors, and other hosted resources. If you have any questions, feel free to reach out to the Alkemio team."

2. **URL Section** (informational)
   - Label: "URL"
   - Display: "https://alkem.io/[space-slug]" (read-only, copyable)
   - Help text: "The unique URL for this space. Contact Alkemio to change this."
   - Copy button: Click to copy URL to clipboard

3. **License Section** (informational card)
   - Heading: "License"
   - Current License display card:
     - License name (e.g., "Free", "Plus", "Premium")
     - Key features list (e.g., "Up to 10 members", "Various tools including standard whiteboards")
     - Capacity indicator (e.g., "2/5 spaces used")
   - "Change the Space License" button: Link or button (if contact form needed)
   - Help text: "Contact the Alkemio team to change your license"
   - "Free Trial" or "Upgrade" button (if applicable)
   - More info link: "More about Alkemio licenses can be found here" (external link)

4. **Visibility Status Section** (informational)
   - Label: "Visibility"
   - Display: "This Space is currently in *Active* mode" (or Archived, Suspended)
   - Help text: "For status changes, contact the Alkemio team"
   - Change request button: "Request Status Change" → modal or form

5. **Host Information Section** (informational)
   - Label: "Host"
   - Display: Host name, avatar, role (Host), affiliation
   - Help text: "The host is the person who created this space"
   - Change host button: "Change Host" (admin-only; links to Alkemio team contact form or internal process)

6. **Support/Contact Section** (footer)
   - Help text: "If you want to change any of these settings, please contact the Alkemio team [here]" (link to support)
   - "Contact Alkemio" button or email link

**Visual Requirements**:
- Informational cards with subtle backgrounds (light gray)
- Read-only fields with copy button affordance
- Clear visual distinction: Changeable vs. non-changeable fields
- Links for external resources (support, documentation)
- Consistent spacing and typography
- Responsive: Stack cards vertically on mobile
- No rich editing; text is display-only

**Personas**: Admin (view account), Host (review space metadata)

---

---

## Page 25: Post Detail Dialog (Level 2)

**Route**: Triggered by clicking post title or "Fullscreen" button from Space Home/Subspace  
**Audience**: All space members  
**Primary Use**: View full post content, responses, and discussion in expanded detail

### Design Brief

You are designing **Level 2** of the post viewing hierarchy—the expanded post detail dialog. This view shows the complete post content, all responses at a glance, and comments on the post itself. Users can click into a response to open **Level 3** (response detail panel).

**Key Layout**:

1. **Header Bar** (sticky, dark background)
   - Back arrow or close button (X, top-left)
   - Post title (truncated if long, e.g., "Reducing Food Waste: Small Steps, Big Impact...")
   - Right side: Share icon, More menu (3-dot), Close button (X)

2. **Post Content Section** (scrollable, main content area)
   - **Post Title** (large, bold)
   - **Author Info** (avatar, name, timestamp, e.g., "Hoyte Rutteman • 4 days ago")
   - **Post Description** (full rich text content, may include links, images, embedded media)
   - "READ MORE" link if truncated initially

3. **Contributions/Responses Section**
   - **Section Header**: "Contributions (X)" or "Responses (X)"
   - **Response Type Selector** (optional filter/tabs):
     - All (show all response types)
     - Posts
     - Whiteboards
     - Collections/Links
     - Memos
   
   - **Response Cards Grid** (displayed as horizontal scrolling row or card grid)
     - Each response card shows:
       - **Thumbnail preview** (varies by type):
         - **Post response**: Text snippet (first 2-3 lines)
         - **Whiteboard response**: Visual preview of whiteboard
         - **Collection/Link response**: Icon + title + link preview
         - **Memo response**: Text snippet
       - **Response title/name** (linked, clickable)
       - **Response author** (avatar + name)
       - **Date posted** (e.g., "09/10/2025")
       - **Interaction count** (comments, reactions)
       - **Responsive**: 4 cards visible on desktop, fewer on tablet/mobile
     - **Click behavior**: Click any response card → Opens Level 3 (Response Detail Panel or Dialog)
     - **Hover state**: Shadow lift, cursor change to pointer
     - **"See all responses"** or pagination if more responses exist

4. **Comments Section** (on the post itself)
   - **Section Header**: "Comments (X)" or "Discussion (X)"
   - **Visual Separation**: Different background color, section divider, or distinct container
   - **Help text** (optional): "Comments on this post" to clarify these are NOT comments on responses
   - **Comment List**:
     - Per-comment: Author avatar, name, comment text, timestamp, reactions, reply button
     - Comment threads (nested replies, collapsible)
     - Pagination or "Load more comments"
   - **Comment Input Box** (sticky or at bottom):
     - Textarea: "Type your comment here..."
     - Emoji picker icon
     - Mention (@) icon
     - Send button (arrow or plane icon)

5. **Post Metadata** (optional, top or bottom)
   - Reactions/likes with counts (😊, ❤️, 👍, etc.)
   - Action buttons: REACT, COMMENT, SHARE, FULLSCREEN (or 3-dot menu)

**Visual Requirements**:
- Modal or fullscreen overlay with dark background behind (if modal)
- Post content prominent and readable
- Response cards visually distinct (cards with borders/shadows, consistent sizing)
- Comments section visually separated from responses (different background, divider)
- Smooth scrolling within the dialog
- Responsive: On mobile, full-height scrollable dialog
- Icons for response types (post icon, whiteboard icon, link icon, etc.)
- Consistent typography and spacing

**Interaction Patterns**:
- Click response card → Opens Level 3 (sliding panel or overlay)
- Click comment reply → Focus comment input with @ mention
- Reactions on post → Animated feedback
- Scroll to see all responses and comments

**Personas**: Contributor (view and discuss), Facilitator (moderate)

---

## Page 26: Response Detail Panel — Sliding Panel Version (Level 3)

**Route**: Triggered by clicking a response card from Level 2  
**Audience**: All space members  
**Primary Use**: View full response detail, its own comments, and navigate between responses

### Design Brief

You are designing **Level 3 (Primary Version)** of the post hierarchy—the **sliding panel** showing a single response in detail. This panel slides in from the right side, displaying only the selected response, its comments, and navigation to other responses. The original post content and post comments are NOT visible here (focus is entirely on the response).

**Key Layout**:

1. **Header Bar** (sticky, dark background, sliding panel style)
   - Back arrow or close button (X, top-left, closes panel and returns to Level 2)
   - Response title or type indicator (e.g., "Responsible innovation" or "Whiteboard response")
   - Right side: More menu (3-dot), Share icon, Close button (X)

2. **Response Navigation Breadcrumb** (top of panel, below header)
   - "Response X of Y" (e.g., "Response 3 of 8")
   - Optional: Previous/Next arrow buttons to browse between responses

3. **Response Content Section** (scrollable main area)
   - **Response Type Indicator Badge** (e.g., "Post", "Whiteboard", "Collection", "Memo")
   - **Response Title** (large, bold)
   - **Response Author Info** (avatar, name, timestamp, e.g., "Hoyte Rutteman • 09/10/2025")
   - **Response Description/Content**:
     - **Post response**: Full rich text content (text, links, embedded media)
     - **Whiteboard response**: Embedded whiteboard preview or full whiteboard view
     - **Collection/Link response**: Grid of items with titles, descriptions, links
     - **Memo response**: Text content
   - **Action Buttons** (per response, if author):
     - Edit button (pencil icon, visible only to response author)
     - Delete button (trash icon, visible only to response author)
     - More menu (3-dot): Additional actions

4. **Other Responses Navigation** (top of panel, after response title)
   - **Section Header**: "Other responses in this post (X)"
   - **Horizontal Scrolling Row of Response Cards**:
     - Similar to Level 2 response cards but smaller/thumbnail size
     - Each card: Type icon, title, author, date, interaction count
     - **Highlight**: Current response visually distinct (highlighted border, different background)
     - Click to switch to that response (panel content updates)
     - Hover: Subtle highlight, cursor change

5. **Comments Section** (on this response only)
   - **Section Header**: "Comments on this response (X)" (visually distinct from post comments)
   - **Visual Separation**: Different background color, distinct container, or section divider
   - **Help Text** (optional): "These are comments on this response, not the original post"
   - **Comment List**:
     - Per-comment: Author avatar, name, comment text, timestamp, reactions, reply button
     - Comment threads (nested replies, collapsible)
     - Pagination or "Load more comments"
   - **Comment Input Box** (sticky at bottom of panel):
     - Textarea: "Comment on this response..."
     - Emoji picker icon
     - Mention (@) icon
     - Send button (arrow or plane icon)

**Visual Requirements**:
- Sliding panel: Width 400-500px on desktop, full-width on mobile
- Dark or semi-transparent overlay behind panel (indicates modal state)
- Smooth slide-in/slide-out animation
- Response cards in navigation row visually consistent with Level 2
- Comments section with distinct styling (background color, section divider)
- Edit/Delete buttons only visible to response author (conditional visibility)
- Responsive: On mobile, panel takes full height with scrollable content

**Interaction Patterns**:
- Slide in from right when response card clicked
- Click another response card in navigation row → Panel content updates (response switches)
- Previous/Next arrow buttons → Navigate through responses
- Click Edit button (author only) → Inline edit or form modal
- Click Delete button (author only) → Confirmation dialog
- Click reply button on comment → Focus comment input with @ mention
- Click back/close → Slide out panel, return to Level 2

**Personas**: Contributor (view and comment on responses), Facilitator (moderate responses)

---

## Page 27: Response Detail Dialog — Full Overlay Modal Version (Level 3, Alternative)

**Route**: Triggered by clicking a response card from Level 2  
**Audience**: All space members  
**Primary Use**: View full response detail, its own comments, and navigate between responses (alternative UX approach)

### Design Brief

You are designing **Level 3 (Alternative Version)** of the post hierarchy—the **centered modal dialog** showing a single response in detail. This modal overlays the screen with a centered dialog box, displaying the selected response, its comments, and navigation to other responses. This is an alternative to the sliding panel approach (Page 26), offering a more traditional modal experience with prominent top/bottom actions.

**Key Layout**:

1. **Modal Header** (sticky, within modal)
   - Title bar with: "Response Detail" or response type indicator (e.g., "Response: Responsible innovation")
   - Breadcrumb or counter: "Response X of Y" (e.g., "Response 3 of 8")
   - Right side: Close button (X icon, top-right, closes modal and returns to Level 2)

2. **Response Navigation Controls** (top section, below header)
   - **Previous/Next Buttons** (left/right arrows, or "<" and ">" buttons)
     - Allow navigation between responses without closing modal
     - Buttons disabled if at first/last response
     - Hover state: Highlight or tooltip showing "Previous response" / "Next response"
   - **Response Counter**: "Response 3 of 8" (displayed centrally or alongside buttons)
   - Visual feedback: Show which response is currently being viewed

3. **Response Content Section** (scrollable main area, center of modal)
   - **Response Type Indicator Badge** (e.g., "Post", "Whiteboard", "Collection", "Memo")
   - **Response Title** (large, bold)
   - **Response Author Info** (avatar, name, timestamp, e.g., "Hoyte Rutteman • 09/10/2025")
   - **Response Description/Content**:
     - **Post response**: Full rich text content (text, links, embedded media)
     - **Whiteboard response**: Embedded whiteboard preview or full whiteboard view
     - **Collection/Link response**: Grid of items with titles, descriptions, links
     - **Memo response**: Text content
   - **Action Buttons** (per response, if author):
     - Edit button (pencil icon, visible only to response author)
     - Delete button (trash icon, visible only to response author)
     - More menu (3-dot): Additional actions (Share, Report, etc.)
   - Scrollable: Content scrolls within modal if exceeds height

4. **Comments Section** (below response content)
   - **Section Header**: "Comments on this response (X)" (visually distinct from post comments)
   - **Visual Separation**: Different background color, section divider, or indented container
   - **Help Text** (optional): "These are comments on this response, not the original post"
   - **Comment List**:
     - Per-comment: Author avatar, name, comment text, timestamp, reactions, reply button
     - Comment threads (nested replies, collapsible)
     - Pagination or "Load more comments"
   - **Comment Input Box** (at bottom of comment section):
     - Textarea: "Comment on this response..."
     - Emoji picker icon
     - Mention (@) icon
     - Send button (arrow or plane icon)

5. **Modal Footer** (sticky, within modal or below all content)
   - Action buttons:
     - **CLOSE** button (secondary, left-aligned)
     - **BACK TO POST** button or similar (secondary, center) - returns to Level 2
   - Or simplified: Just a close (X) button at top-right

**Visual Requirements**:
- Modal size: 700px–900px width (responsive), 600px–800px height (responsive)
- Centered on screen with dark overlay/backdrop (50-70% opacity)
- Max-height ensures scrollable content if needed
- Response content area takes majority of modal space
- Comments section below with clear visual distinction
- Smooth fade-in animation when opening
- Smooth fade-out animation when closing
- Scroll behavior: Content within modal scrolls; modal itself does not scroll
- Navigation buttons (Previous/Next) visually prominent and easy to access
- Edit/Delete buttons only visible to response author (conditional visibility)
- Responsive: On mobile, modal takes 90% width or full height, adjusted proportions

**Interaction Patterns**:
- Click response card from Level 2 → Modal fades in, centered on screen
- Click Previous/Next arrow buttons → Content updates within modal (no close/reopen)
- Click Edit button (author only) → Inline edit or form modal (may overlay current modal)
- Click Delete button (author only) → Confirmation dialog (may overlay current modal)
- Click reply button on comment → Focus comment input with @ mention
- Click CLOSE or (X) button → Modal fades out, returns to Level 2
- Click outside modal (on dark backdrop) → Close modal (optional, if backdrop is clickable)
- Keyboard: ESC key → Close modal (standard web pattern)

**Comparison to Page 26 (Sliding Panel)**:
- **Page 26 (Sliding Panel)**: Slides in from right, 400-500px width, allows Level 2 to remain partially visible behind
- **Page 27 (Modal Dialog)**: Centered overlay, 700-900px width, fully obscures Level 2 content, traditional modal pattern
- **Use case for Page 27**: Better for desktop contexts where full-screen focus is preferred; clearer visual separation between views

**Personas**: Contributor (view and comment on responses), Facilitator (moderate responses)

---

## Page 28: Template Library

**Route**: Accessible from primary navigation menu (shared with "Browse All Spaces" and additional options)  
**Audience**: All space members, space admins, facilitators  
**Primary Use**: Discover, browse, search, and apply template packs and individual templates to spaces

### Design Brief

You are designing the **Template Library**, a comprehensive discovery and browsing experience for template packs and individual templates. This page is the central hub where users explore curated template collections (packs) and standalone templates to enhance their space's capabilities. The page is accessible from a dedicated menu item in the primary navigation.

**Key Layout**:

1. **Page Header & Navigation Entry Point**
   - **Primary Navigation Access**: Template Library is accessible via a menu in the top navigation bar (same menu that contains "Browse All Spaces" and additional options)
   - **Breadcrumb**: Home > Template Library (or navigation breadcrumb showing current location)
   - **Page Title**: "Template Library"
   - **Instructional Text**: "Explore curated template packs and individual templates to enhance your space's capabilities."

2. **Search & Filter Bar** (sticky, at top)
   - **Search Input**: Full-width search bar with placeholder "Search templates, packs, or keywords..."
   - **Search Scope**: Searches across all template packs and individual templates (both space-specific and General Library)
   - **Search Results Behavior**: Results organized with space-specific templates/packs appearing first, followed by General Library templates
   - **Filter Dropdown** (optional, right side of search):
     - Filter by Category (e.g., "Collaboration Tool Template", "Whiteboard Template", "Brief Template", "Community Guidelines Template")
     - Filter by Source (optional visual organization, not a hard toggle):
       - Space-Specific Templates (displays naturally first)
       - General Library Templates (displays naturally second)
   - **Clear Filter Button**: "Clear all" link to reset search/filters

3. **Template Packs Section** (primary discovery area, top)
   - **Section Header**: "Template Packs" with count badge (e.g., "10 packs available")
   - **Section Description**: "Coherent sets of templates curated around specific themes or best practices"
   - **Instructional Note** (optional): "Browse packs to explore related templates or apply entire packs to your space"
   - **Template Pack Cards Grid** (responsive: 3-4 columns desktop, 2 tablet, 1 mobile)
   
   **Per Template Pack Card**:
   - **Pack Thumbnail/Preview**: Small carousel or collage showing 2-3 contained template previews (horizontal scrollable preview or static montage)
   - **Pack Icon/Avatar**: Small icon or initial badge (e.g., "CP" for "Creative Thinking Pack")
   - **Pack Name** (linked, prominent)
   - **Pack Description** (1-2 lines, snippet text)
   - **Template Count Badge**: "X templates in this pack" (e.g., "5 templates")
   - **Pack Tags/Categories**: Pill-style badges indicating pack theme or focus (e.g., "Design", "Innovation", "Brainstorming", "Decision-Making")
   - **Facilitating Organization** (if applicable): Organization name or logo (smaller, subtle)
   - **Primary CTA Button**: "View Pack" (links to pack detail page where user can preview individual templates or apply the entire pack)
   - **Hover State**: Subtle shadow lift, preview carousel autoplay hint (e.g., arrow indicators)
   - **Image Sourcing** (pack preview carousel): Pull diverse images from Unsplash related to: "template design", "workflow", "collaboration tools", "creative process", "strategy planning", "innovation framework". Use 16:9 aspect ratio for each preview thumbnail.

   - **Empty State** (if no packs): Icon + message "No template packs available. Check back soon or browse individual templates below."
   - **"Load More Packs"** button or pagination if many packs exist

4. **Individual Templates Section** (secondary browsing area, below packs)
   - **Section Header**: "Templates" with count badge (e.g., "45 templates available")
   - **Section Description**: "Browse individual templates organized by type"
   - **Subsections by Type** (collapsible or always expanded, depending on quantity):
     - **Space Templates** (e.g., "Creative Thinking", "Design Sprint", etc.)
     - **Collaboration Tool Templates** (e.g., for whiteboard sessions, brainstorms)
     - **Whiteboard Templates** (e.g., pre-designed whiteboard layouts)
     - **Brief Templates** (e.g., project briefs, decision briefs)
     - **Community Guidelines Templates** (e.g., code of conduct templates)
   
   **Per Individual Template Card**:
   - **Template Thumbnail/Preview**: High-quality preview image showing template layout or visual representation
   - **Template Name** (linked, prominent)
   - **Template Description** (1-2 lines, snippet text)
   - **Template Type Badge** (e.g., "Brief", "Whiteboard", "Collaboration Tool", "Space Template")
   - **Category Badge** (e.g., "Design", "Innovation", "Decision-Making")
   - **"Part of [Pack Name]" Indicator** (if template is part of a pack): Subtle badge or text showing pack association (e.g., "Part of Creative Thinking Pack" with link to pack)
   - **Template Tags**: Pill-style badges indicating template focus or use case (e.g., "Brainstorming", "Team Planning", "Feedback Collection")
   - **Source Indicator** (visual organization, not interactive):
     - Space-Specific Templates appear in a "Space Templates" section or at top of results
     - General Library Templates appear in a "General Library" section or below space templates
   - **Primary CTA Button**: "View Details" (links to individual template detail page where user can preview or use the template)
   - **Secondary CTA** (optional): "Quick Apply" button (applies template directly to current space if context is clear)
   - **Hover State**: Subtle shadow lift, cursor pointer
   - **Image Sourcing** (template thumbnails): Pull diverse images from Unsplash related to: "template layout", "design system", "workflow diagram", "planning tool", "collaboration interface", "brainstorming board". Use 16:9 aspect ratio for thumbnails.

   - **Empty State** (if no templates in subsection): Icon + message "No templates in this category."
   - **Pagination or "Load More Templates"** button if many templates exist

5. **Sidebar or Right Panel** (optional, desktop only)
   - **Featured or Recommended Section** (curated picks):
     - "Featured This Week" packs and templates
     - "Most Used" templates
     - "New Arrivals"
   - **Help Text / Getting Started**:
     - "How to use templates?" link (opens help modal or documentation)
     - "Create your own template" link or CTA button
   - **Quick Links**:
     - "Browse All Spaces" (navigation link)
     - "My Template Packs" (user-created packs, if applicable)

**Visual Requirements**:
- Clean, spacious layout with generous card padding and spacing
- Template pack cards slightly larger or more prominent than individual template cards (visual hierarchy)
- Consistent card styling and border radius across packs and templates
- Smooth transitions when switching between sections or filtering
- Responsive grid layout: 3-4 columns (desktop), 2 (tablet), 1 (mobile)
- Search results display smoothly with loading states
- "Part of [Pack Name]" badges clearly visible but not overwhelming
- Hover effects on cards: subtle shadow, slight color shift, cursor pointer
- Mobile-responsive: Stack sections vertically, full-width cards
- Empty states with friendly icons and helpful messaging
- Pagination controls at bottom of each section or "Load More" infinite scroll

**Interaction Patterns**:
- Type in search bar → Results filter and display in real-time across packs and templates
- Click filter dropdown → Filter options appear; selection filters results; space-specific templates automatically appear first
- Click template pack card → Navigate to Pack Detail page (Page 29)
- Click "View Details" on individual template → Navigate to Template Detail page (Page 30)
- Click "Part of [Pack Name]" badge → Navigate to associated pack detail page
- Click "Load More" or pagination → Load additional packs/templates
- Search results show space-specific templates first, then General Library templates (natural organization)
- Responsive behavior: On mobile, search bar remains sticky; sections stack vertically

**Accessibility & Usability**:
- Keyboard navigation: Tab through cards, Enter to activate CTAs
- Screen reader support: Clear card titles, badge descriptions, CTA button labels
- Focus indicators: Visible on all interactive elements
- Color contrast: Sufficient contrast for all text and icons
- Help text: Inline tooltips on hover for non-obvious UI elements

**Navigation Context**:
- **Primary Navigation Menu**: Template Library is grouped with other discovery/browse options
  - Shared menu items: "Browse All Spaces", "Template Library", [additional options]
  - Accessible from top navigation bar (hamburger or menu icon on mobile)
- **Breadcrumb**: Helps users understand location within platform hierarchy
- **Back Button**: If navigating from a space, back button returns to previous location

**Personas**: 
- Contributor (discover and use templates to create content)
- Facilitator (browse packs to customize space offerings, explore design patterns)
- Admin (manage template availability, create custom templates)

---

## Page 29: Template Pack Detail

**Route**: `/templates/packs/[pack-slug]`

**Audience**: All space members, space admins, facilitators (who want to explore and apply a specific template pack)

**Primary Use**: 
- View all templates within a specific pack
- Preview individual templates before applying
- Apply the entire pack to their space or apply individual templates selectively
- Understand the pack's purpose, origin, and best practices

**Key Elements**:
- **Pack Header Section (Compact Browsing Context)**:
  - Pack name (prominent heading)
  - Brief description/summary (2-3 lines)
  - Pack metadata: 
    - Created by / Organization / Source
    - Template count badge (e.g., "24 templates")
    - Tags/categories (e.g., "Innovation", "Community Building", "Whiteboarding")
  - Primary CTA: "Apply Entire Pack" button (prominent, full-width or large)
  - Secondary action: "Share Pack" (icon button, if applicable)
  - Breadcrumb navigation: "Template Library > [Pack Name]"
  - Back button to return to Template Library

- **Pack Templates Section (Organized by Type)**:
  - Collapsible/accordion sections grouped by template type:
    - Space Templates
    - Collaboration Tools
    - Whiteboards
    - Briefs
    - Community Guidelines
  - Each section:
    - Section header with type name and count badge (e.g., "Space Templates (6)")
    - Expandable/collapsible toggle indicator
    - Template grid inside (3-4 columns desktop, responsive)
    - Per-template card contents:
      - Template thumbnail/preview image
      - Template name
      - Brief description (1-2 lines)
      - Template icon/type indicator
      - "Quick Apply" button (secondary CTA on each card)
      - "View Details" link (opens Template Detail modal or Page 30)

- **Empty / Loading States**:
  - Loading state: Skeleton loaders for header and grid while pack loads
  - Empty pack state: Friendly message if pack has no templates
  - Network error state: Retry button and helpful message

- **Related/Recommended Section (Optional)**:
  - "Related Packs" carousel or card grid (2-3 other packs)
  - "You Might Also Like" section if user has interacted with packs before
  - Navigation to browse all packs without leaving pack detail

**Visual Requirements**:
- **Header Styling (Compact Browsing Pattern)**:
  - Pack name in large, readable font (h1 or prominent heading)
  - Description text in secondary color (gray, muted)
  - Metadata displayed as small badges/pills or inline text
  - "Apply Entire Pack" button positioned prominently (primary color, high contrast)
  - Overall header compact but informative (follows Page 19 Subspaces Tab pattern)
  - Light background or subtle divider line to separate from template sections below
  - Responsive: Header stack vertically on mobile, button full-width
  
- **Template Organization Visual Hierarchy**:
  - Section headers (accordion toggles) with consistent styling
  - Count badges on each section header (e.g., "(6 templates)")
  - Smooth expand/collapse transitions with rotation indicator
  - Template cards maintain consistent height and spacing
  - Hover effects: subtle shadow lift, slight color shift on card
  - Focus indicators visible on keyboard navigation
  - Responsive grid: 3-4 columns (desktop), 2 (tablet), 1 (mobile)

- **Cards and Spacing**:
  - Template cards: consistent border radius, subtle borders
  - Card padding: comfortable internal spacing (16-24px)
  - Grid gap: 16-24px between cards
  - Thumbnail images: 100% width within card, consistent aspect ratio (4:3 or 16:9)
  - Consistent typography hierarchy within cards

- **Interaction Visual Feedback**:
  - "Quick Apply" button on hover: color shift, cursor pointer
  - "View Details" link: underline on hover, consistent link color
  - Section toggle: rotation arrow and smooth height transition
  - Applied pack state: success toast/notification at top of page

- **Mobile Responsiveness**:
  - Header button: full-width on mobile for easy tap
  - Cards: stack single column on mobile
  - Accordion sections still collapsible/expandable
  - Touch targets: minimum 44x44px for buttons

**Interaction Patterns**:
- **Apply Entire Pack**: 
  - User clicks "Apply Entire Pack" button in header
  - Confirmation modal appears: "Apply [Pack Name]? This will add [X] templates to your space."
  - User confirms or cancels
  - On confirmation: Pack templates are applied to space; success notification appears
  - Page stays on pack detail or redirects back to Template Library with success message

- **Quick Apply Individual Template**:
  - User clicks "Quick Apply" on a template card
  - Optional: Brief loading state or confirmation toast
  - Template is applied to space; success notification appears
  - Card may show applied state (e.g., checkmark or "Applied" indicator)

- **View Template Details**:
  - User clicks "View Details" on template card or template name
  - Navigate to Page 30 (Individual Template Detail page)
  - Returns to pack detail on back navigation

- **Expand/Collapse Sections**:
  - User clicks section header to expand/collapse
  - Smooth animation: Section expands/collapses with rotation arrow
  - Expanded sections remain expanded during session
  - Multiple sections can be expanded simultaneously

- **Navigate Back**:
  - Back button or breadcrumb link "Template Library" returns to Page 28
  - Maintains filter/search state if navigated from search results

- **Share Pack (Optional)**:
  - User clicks "Share" icon
  - Share menu appears (copy link, email, social share, etc.)
  - Generates shareable link to pack detail page

**Edge Cases & Error Handling**:
- Pack not found (404): Friendly error message with link back to Template Library
- Templates fail to load: Retry button and error message in affected section
- Apply pack fails: Error notification with retry or contact support options
- Network timeout: Graceful degradation with offline state message
- Partially loaded pack: Show what is available while loading remaining sections

**Accessibility & Usability**:
- Keyboard navigation: Tab through pack header, section toggles, template cards, and CTAs
- Screen reader support: 
  - Clear pack name and description announced
  - Section headers announced with expanded/collapsed state
  - Template cards announced with name, description, and available actions
  - "Quick Apply" and "View Details" button purposes clear
- Focus indicators: Visible on all interactive elements (buttons, links, section toggles)
- Color contrast: Sufficient contrast for all text, icons, and interactive elements
- ARIA labels: Aria-expanded for accordion sections, aria-current for breadcrumb
- Tooltips: Helpful hints on hover for non-obvious actions (e.g., "Share Pack")
- Language: Clear, accessible copy avoiding jargon

**Navigation Context**:
- **Breadcrumb**: "Template Library > [Pack Name]" clearly shows location
- **Back Button**: Obvious back navigation to Template Library
- **Related Packs Links**: Easy access to discover other packs without exiting pack detail
- **Primary Navigation**: Accessible from main menu; Template Library grouped with discovery options

**Responsive Behavior**:
- **Desktop (1024px+)**: 
  - Pack header with info inline or stacked efficiently
  - "Apply Entire Pack" button positioned prominently (not full-width)
  - Template grid: 3-4 columns
  - Sections clearly demarcated

- **Tablet (768px-1023px)**:
  - Pack header adapts, "Apply Entire Pack" remains prominent
  - Template grid: 2-3 columns
  - Touch-friendly spacing maintained

- **Mobile (< 768px)**:
  - Pack header stacks vertically
  - "Apply Entire Pack" button: full-width for easy tap
  - Template grid: 1-2 columns, single column preferred
  - Sections collapse by default to reduce scroll, user expands as needed

**Personas**:
- **Contributor**: Explores packs to find templates for creating content; uses "Quick Apply" to add individual templates
- **Facilitator**: Reviews entire packs to understand their structure and best practices; uses "Apply Entire Pack" to quickly customize space
- **Admin**: Views pack details to manage template availability and understand what's being offered to users

---

## Page 30: Individual Template Detail

**Route**: `/templates/[template-id]` or `/templates/packs/[pack-slug]/[template-id]` (context-aware)

**Audience**: All space members, space admins, facilitators (who want to preview or apply a specific template)

**Primary Use**:
- View detailed information about a single template
- Understand template structure, composition, and use case
- Preview template layout and content structure
- Read instructions or methodology (if applicable)
- Apply the template to their space
- See related or recommended templates

**Key Elements**:

- **Template Header Section (Compact Detail View)**:
  - **Back Navigation**: Back arrow or breadcrumb to return to Pack Detail (Page 29) or Template Library (Page 28)
  - **Template Name** (prominent heading)
  - **Template Type Indicator Badge** (explicit composition, Option A):
    - For **Space Templates**: "Space Template"
    - For **Subspace Templates**: "Subspace Template"
    - For **Collaboration Tool Templates**: "Collaboration Tool: [Post + Whiteboard]" or "Collaboration Tool: [Post + Memo]" (explicit composition breakdown)
    - For **Whiteboard Templates**: "Whiteboard Template"
    - For **Brief Templates**: "Brief Template"
    - For **Community Guidelines Templates**: "Community Guidelines Template"
  - **Brief Description** (1-3 lines, snippet)
  - **Pack Association** (if part of pack): "Part of [Pack Name]" with link back to pack
  - **Template Tags/Categories**: Pill-style badges (e.g., "Brainstorming", "Decision-Making", "Innovation")
  - **Creator/Organization**: Attribution (who created this template)
  - **Primary CTA**: "Apply This Template" button (prominent, high contrast)
  - **Secondary Actions**: "Share", "Favorite" (icon buttons, optional)

- **Template Preview/Composition Section** (main content - CONTENT-FOCUSED):
  - **Content Display by Template Type** (detailed content breakdown, not just screenshots):
    
    - **For Space Templates**: Show the actual space structure with tabs and sample contents
      - **Space Navigation**: Display the 4 tabs: "About", "Resources", "Subspaces", "Templates"
      - **About Tab Content**: Show the space description, key info fields if any
      - **Included Subspaces**: List all subspaces that will be created (e.g., "Strategy", "Research", "Ideation", "Execution")
        - Per subspace: name, purpose description, icon/avatar
      - **Included Templates**: List templates that populate the space (if any)
      - **Sample Posts by Tab**: Show representative posts that appear in key tabs
        - For each main tab (e.g., "Ideas", "Discussions", "Resources"): Show 1-2 sample post titles/descriptions to illustrate the type of content expected
        - Make it clear which posts belong to which tab/section
      - **Visual Format**: Clean card/list layout showing hierarchy and structure, NOT just a mockup screenshot; organize tabs horizontally or in labeled sections
    
    - **For Subspace Templates**: Show the innovation flow structure with tabs and posts
      - **Subspace Navigation**: Display the innovation flow tabs (e.g., "Innovate", "Build", "Execute", "Evaluate")
      - **Subspace Description**: Brief description of the subspace's purpose and stage in the innovation flow
      - **Posts Within Each Tab**: Show representative posts/content for each innovation stage
        - For each tab: List 1-3 representative post titles and types (e.g., "Challenge Definition", "Solution Proposal", "Implementation Plan")
        - Show the content structure that users will encounter
      - **Visual Format**: Accordion or tabbed layout showing each innovation stage with its associated posts clearly visible
      - Example structure: 
        - Tab 1 "Innovate" → Posts: "Define the Challenge", "Brainstorm Solutions"
        - Tab 2 "Build" → Posts: "Solution Proposal", "Resource Requirements"
        - Tab 3 "Execute" → Posts: "Implementation Plan", "Progress Updates"
    
    - **For Collaboration Tool Templates**: Show the post AND the additional component together
      - **Post Content Display**: Show the actual post template (title, description, structure)
      - **Additional Component Display**:
        - If **Post + Whiteboard**: Show post content side-by-side with whiteboard preview (whiteboard canvas visual is acceptable here)
        - If **Post + Memo**: Show post content side-by-side with memo template structure
        - If **Post + Link Collection**: Show post content with related links/resources structure
      - **Composition Clarity**: Make it obvious how post and component interact (e.g., "This collaboration starts with a post, then participants add ideas to the whiteboard")
      - **Visual Format**: Two-column or stacked layout showing both components distinctly
    
    - **For Whiteboard Templates**: Interactive or static preview of whiteboard layout (visual preview IS content here)
      - Show the canvas with pre-designed sections, templates, or structure
      - Provide a "View in Context" button/link to open interactive preview
    
    - **For Brief Templates**: Show the brief structure and sections
      - **Sections Included**: List each section (e.g., "Executive Summary", "Problem Statement", "Proposed Solutions", "Success Metrics")
      - **Per Section**: name, description, expected content type (text, list, table, etc.)
      - **Structure Visual**: Card layout or accordion showing the brief's logical flow
      - **Example Content**: Optional: Show placeholder/example text for 1-2 key sections to illustrate usage
    
    - **For Community Guidelines Templates**: Document preview or text preview
      - Show the guideline categories (e.g., "Code of Conduct", "Communication Norms", "Conflict Resolution", "Consequences")
      - Per category: brief description or preview text
      - Document structure with section headers
    
    - **For Post Templates**: Show the actual post template structure
      - **Post Title Template**: Show what the post title should contain
      - **Post Description**: Show the structure/fields (e.g., "Describe the challenge:", "What success looks like:", etc.)
      - **Example Post**: Optional: Show a filled-out example of what a post following this template would look like
      - **Rich Text Features**: Indicate supported formatting (headings, lists, links, images, etc.)
  
  - **"View in Context"** button/link (below content section):
    - Opens a full interactive preview or demo version in expanded view
    - For Whiteboards: Shows interactive whiteboard
    - For Spaces: Shows interactive space demo or mockup
    - For Subspaces: Shows the innovation flow with sample posts
    - For Posts/Briefs: Shows how template would render when actually used

- **Template Metadata Panel** (right sidebar or collapsible section):
  - **About This Template**:
    - Created by: [Author/Organization]
    - Last updated: [Date]
    - Usage count: "[X members use this template]" (optional social proof)
    - Difficulty/Complexity: Badge (e.g., "Beginner", "Intermediate", "Advanced") - optional
  - **What's Included**:
    - For **Collaboration Tools**: Breakdown (e.g., "1 Post template + 1 Whiteboard layout")
    - For **Space Templates**: List of contained subspaces or sections
    - For others: Clear description of contents
  - **Instructions / Methodology** (CONDITIONAL INCLUSION - only if template creator marks as methodology-heavy):
    - **Section Visibility**: This section is ONLY shown if the template has an `instructions_flag` or `is_methodology_template` attribute set to true
    - **Conditional Display Logic**:
      - If instructions present: Display full collapsible "How to Use This Template" section
      - If no instructions: Section is completely hidden (not shown as "pending" or "coming soon")
    - **When Visible - Collapsible Section**: "How to Use This Template"
      - Rich text content with methodology, best practices, step-by-step guidance
      - Example: "This workshop template follows the Design Thinking methodology. Step 1: Define the problem... Step 2: Ideate solutions..."
      - Help text: "These instructions are informational. Keep them as reference or customize per your needs."
      - No edit capabilities here (read-only in detail view)
    - **Design Rationale**: This pragmatic approach keeps simple templates clean and uncluttered (no empty sections), while providing full instructional value for methodology-heavy templates (workshops, creative techniques, frameworks)
    - **User Benefit**: 
      - Contributors see only what's relevant (quick templates stay quick, methodology templates provide guidance)
      - Facilitators can immediately identify which templates include instructions without unnecessary visual noise
      - Reduces cognitive load for users browsing simple templates
  - **Related Templates** (optional):
    - "See also" carousel or list (2-3 related templates)
    - Similar theme, same pack, or complementary templates

- **Empty / Loading States**:
  - Loading state: Skeleton loaders for header, preview, and metadata
  - Template not found (404): Friendly error message with link back to Template Library

**Visual Requirements**:

- **Header Styling**:
  - Template name in large, bold heading
  - Type badge prominent and easily identifiable (color-coded or icon-based for template types)
  - Composition breakdown explicit and scannable (especially for Collaboration Tools)
  - "Apply This Template" button positioned prominently (primary color, high contrast, large touch target)
  - Responsive: Stack vertically on mobile, with button full-width

- **Content Display Section** (primary focus):
  - **Information-Rich Layout**: Content is the primary focus, not just a screenshot
  - **Space Templates**: Card/list layout showing tabs, subspaces, sample posts per tab, and structure hierarchy clearly
  - **Subspace Templates**: Accordion or tabbed layout showing innovation flow stages with representative posts for each stage
  - **Collaboration Tools**: Two-column or stacked layout clearly showing post content + additional component side-by-side
  - **Briefs**: Accordion or card layout showing all sections in logical flow
  - **Posts**: Text and structure fields clearly displayed
  - **Whiteboards**: Visual preview with interactive affordance (canvas is visual content here)
  - **Community Guidelines**: Section headers and category previews in readable layout
  - **Content Readability**: Use proper typography, spacing, and visual hierarchy to make template structure scannable
  - **"View in Context"** button positioned prominently below content (interactive preview affordance)

- **Metadata Panel**:
  - Clean sidebar layout on desktop (300-350px), full-width stacked section on mobile
  - Collapsible sections with chevron indicators
  - Clear visual hierarchy: Metadata title > Content
  - **Instructions section (CONDITIONAL)**: Only shown if instructions flag is set; visually distinct (light background, subtle border, or section divider) when present
  - "How to Use This Template" heading clearly indicates instructional content
  - **No visual clutter for simple templates**: If no instructions, that section is completely hidden (not shown as empty state)

- **Cards and Spacing**:
  - Consistent padding and spacing throughout
  - Section dividers to separate metadata panels
  - Readable typography with adequate line height

- **Interaction Visual Feedback**:
  - "Apply This Template" button: Color shift on hover, cursor pointer
  - "Share" or "Favorite" icons: Hover highlight, tooltip on hover
  - Collapsible section toggles: Smooth expand/collapse animation with rotation arrow
  - Related templates carousel: Smooth scrolling or pagination controls

- **Mobile Responsiveness**:
  - Header stacks vertically, button full-width for easy tap
  - Content section scales responsively, maintaining readability
  - Metadata sidebar converts to stacked sections
  - Touch targets: Minimum 44x44px for buttons
  - Collapsible sections by default on mobile to reduce scroll
  - Instructions section (if present) collapsed by default on mobile

**Interaction Patterns**:

- **View Template Content**:
  - User lands on template detail page and immediately sees full template content breakdown (not just a screenshot)
  - Content display varies by template type:
    - **Space Templates**: See all 4 tabs, subspaces list, sample posts within each tab, structure hierarchy
    - **Subspace Templates**: See innovation flow tabs (Innovate, Build, Execute, etc.) with representative posts in each stage
    - **Collaboration Tools**: See post content + additional component (whiteboard, memo, etc.) side-by-side
    - **Briefs**: See all sections in logical flow
    - **Posts**: See template fields and example content
    - **Whiteboards**: See visual whiteboard preview
  - User can scroll through content to understand complete structure before applying

- **View in Context (Optional Interactive Preview)**:
  - User clicks "View in Context" button
  - Opens expanded preview mode (full-screen or large modal)
  - Shows detailed/interactive representation of template layout
  - For Whiteboards: Opens interactive whiteboard
  - For Spaces: Shows interactive space demo or full mockup
  - For Posts/Briefs: Shows how template would render when used
  - Back button returns to template detail

- **Expand Instructions (If Present)**:
  - If template has instructions flag set:
    - "How to Use This Template" section is visible in metadata panel
    - User can click section header to expand/collapse
    - Section smoothly expands revealing full instruction text
    - Instructions remain visible during session
    - User can collapse again if desired
  - If no instructions flag:
    - Section is completely hidden (not shown as "pending" or empty state)
    - Metadata panel only shows "About" and "What's Included"

- **Apply This Template**:
  - User clicks "Apply This Template" button
  - If context clear (e.g., viewing from within a space): Confirmation modal shows "Apply [Template Name] to this space?"
  - If context unclear (e.g., viewing from Template Library): Modal may prompt "Select a space to apply this template to" with space selector dropdown
  - On confirmation: Template is applied to space; success notification appears
  - Option: Page may redirect to space or stay on template detail with applied state indicator

- **View Related Templates**:
  - User clicks "See also" carousel or related template card
  - Navigates to that template's detail page
  - Back navigation returns to previous template

- **Navigate Back**:
  - Back button returns to referrer (Pack Detail Page 29, Template Library Page 28, or previous location)
  - Maintains scroll position if possible

- **Share Template**:
  - User clicks "Share" icon
  - Share menu appears (copy link, email, social share, etc.)
  - Generates shareable link to template detail page

**Edge Cases & Error Handling**:

- Template not found (404): Friendly error message with link back to Template Library
- Template preview fails to load: Retry button and error message; fallback to text description
- Apply template fails: Error notification with retry or contact support options
- Instructions missing (if flagged but not provided): Graceful handling; section hidden or "Instructions pending" message
- Network timeout: Graceful degradation with offline state message

**Accessibility & Usability**:

- Keyboard navigation: Tab through template header, content sections, metadata panels, buttons, and related templates
- Screen reader support:
  - Template name and type badge announced clearly
  - Composition breakdown for Collaboration Tools announced explicitly (e.g., "Post plus Whiteboard")
  - Content sections announced with clear descriptions:
    - Space Templates: "Space includes tabs: About, Resources, Subspaces, Templates; Subspaces: Strategy, Research, Ideation, Execution; Sample posts in Ideas tab: ..."
    - Subspace Templates: "Subspace stages: Innovate with posts, Build with posts, Execute with posts..."
  - Brief sections announced in order (e.g., "Section 1: Executive Summary, Section 2: Problem Statement...")
  - Instructions/Methodology section announced if present, skipped if not (no "empty section" announcements)
  - "Apply" and action buttons clearly labeled
  - Related templates announced with names and descriptions
- Focus indicators: Visible on all interactive elements (buttons, links, collapsible section headers)
- Color contrast: Sufficient contrast for all text, icons, and badges
- ARIA labels: Aria-expanded for collapsible instructions section, aria-current for breadcrumb
- Tooltips: Helpful hints on hover for non-obvious actions (e.g., "Share Template", "Favorite")
- Language: Clear, accessible copy avoiding jargon; composition descriptions in plain language; content structure explained clearly

**Navigation Context**:

- **Breadcrumb**: "Template Library > [Pack Name] > [Template Name]" (if from pack) OR "Template Library > [Template Name]" (if standalone)
- **Back Button**: Obvious back navigation to previous page (Pack Detail or Template Library)
- **Related Templates Links**: Easy discovery of similar templates without leaving template detail
- **Primary Navigation**: Accessible from main menu; Template Library grouped with discovery options

**Responsive Behavior**:

- **Desktop (1024px+)**:
  - Two-column layout: Left (60%) for content display section, right (40%) for metadata sidebar
  - Metadata sidebar sticky (follows scroll)
  - "Apply This Template" button positioned in header or sidebar
  - Full content display visible for all template types (Space tabs, Collaboration Tool components side-by-side, etc.)
  - Related templates carousel visible below main content

- **Tablet (768px-1023px)**:
  - Single column layout with content display taking full width
  - Metadata sidebar below content, full-width stacked sections
  - "Apply This Template" button full-width below header
  - Collapsible metadata sections for space management
  - Content display adapts: Collaboration Tool components stack vertically instead of side-by-side

- **Mobile (< 768px)**:
  - Single column, all content stacks vertically
  - Header button full-width for easy tap
  - Content section scrollable, maintains readability and structure visibility
  - Metadata sections collapsed by default (user expands as needed)
  - Instructions section collapsed by default if present
  - Related templates carousel or single-column list
  - Space template tabs shown as list items or stacked sections with sample posts nested below each tab
  - Subspace template innovation flow stages shown as accordion sections with posts collapsed/expandable per stage
  - Collaboration Tool components stack vertically with clear labels
  - Brief sections shown in compact accordion format

**Persona-Specific Interactions**:

- **Contributor**: Wants quick preview and fast apply; likely skips detailed instructions. Path: View template → Apply immediately
- **Facilitator**: Reads full details, instructions, and composition; wants to understand before applying. Path: Read all metadata → Review instructions if present → Then apply
- **Admin**: Interested in template source, creator, usage stats, and composition for management purposes. Path: Review metadata panel → Check composition → May not apply directly

**Personas**:

- **Contributor**: Previews templates to find inspiration; applies individual templates to create content; skips metadata when clear on use case
- **Facilitator**: Reviews full template details and instructions before applying; interested in methodology and how template fits space; values clear composition information for Collaboration Tools
- **Admin**: Reviews template metadata, source, and creator; manages template availability and quality; checks composition to understand what's being added to spaces

---

## Page 31: Browse All Spaces (Explore Spaces Directory)

**Route**: `/spaces` (or `/explore/spaces`)  
**Audience**: All authenticated users  
**Primary Use**: Discover, search, and browse all Spaces and Subspaces on the platform  
**Screenshot reference**: browse-all-spaces.png (Feb 10, 2026)

### Design Brief

You are designing the "Browse All Spaces" page — the full directory of all Spaces (and their Subspaces) on the Alkemio platform. This page is accessible from the left-hand navigation menu and from the Dashboard's "Explore all your Spaces" link.

**Critical component reuse**: The Space Card used on this page is the **same card component** that appears as a live preview in **Space Settings → About Tab** (Page 16). When a facilitator edits the space name, description, and card banner image in Space Settings, the card preview shown there is exactly what appears here. **Do not create a new card design** — reuse the existing Space Card component. The same card pattern is also used on the Subspaces tab (Page 4).

**Key Elements**:

1. **Page Header**
   - Title: "Explore Spaces" (matches screenshot heading)
   - Subtitle/description: Brief instructional text (e.g., "Browse all Spaces on the platform. Click a Space to explore its community and content.")
   - Decorative header illustration (optional, matches dashboard style)

2. **Search & Filter Bar** (below header, above grid)
   - **Search Input**: Full-width or prominent search field
     - Placeholder: "Search spaces…"
     - Searches by space name, description, and tags
     - Results filter the grid in real-time (or on Enter)
   - **Filter/Sort Controls** (beside or below search):
     - Sort: "Most Recent" / "Alphabetical" / "Most Members" / "Most Active"
     - Filter by: Privacy (Public/Private), Tags/Categories, My Memberships only
   - Keep controls minimal and non-overwhelming; progressive disclosure if many filters

3. **Space Card Grid** (main content)
   - **Layout**: Responsive grid of Space/Subspace Cards
     - Desktop: 4–5 cards per row (matches screenshot density)
     - Tablet: 2–3 cards per row
     - Mobile: 1–2 cards per row
   - **Card spacing**: Consistent gap (16–24px) between cards
   - **The grid contains both Spaces and Subspaces** — they use the same card component but with visual differences (see below)

   **Space Card Component** (reuse from Space Settings About tab live preview):
   - **Card Banner Image** (top, 416×256px aspect ratio)
     - Uses the "Card Banner" image uploaded in Space Settings → About Tab
     - If no card banner: show a subtle default/placeholder pattern (not a broken image)
   - **Space Avatar/Logo** (overlapping bottom-left of banner, circular or rounded-square)
     - For a **top-level Space**: single avatar/logo
     - For a **Subspace**: stacked avatars showing the parent Space avatar behind the Subspace avatar (visually communicates hierarchy)
   - **Space Name** (prominent, linked — click navigates to Space Home)
   - **Parent Space indicator** (Subspaces only): Below the title, show "in: [Parent Space Name]" as subtle secondary text (linked to the parent Space)
   - **Space Description** (1–2 lines, truncated with ellipsis)
     - Pulled from the "What" section in Space Settings → About Tab
   - **Privacy Badge**: "Public" or "Private" (with lock icon for private)
   - **Tags** (optional): 1–3 pill-style tags below description
   - **Lead Avatars Row** (bottom of card): Small circular avatars (3–5 max) showing the **Leads** of the Space — these can be people and/or organizations. If more than 5, show "+N" overflow indicator. This is the same pattern used on the Subspaces tab (Page 4).
   - **Member Count** or community size indicator (e.g., "42 members")
   - **Hover State**: Subtle shadow lift + cursor pointer; card is fully clickable

   **Image Sourcing** (for prototype/fake data):
   - Pull diverse, high-quality images from Unsplash related to: "innovation", "collaboration", "community", "technology", "sustainability", "education", "design thinking", "social impact", "research", "entrepreneurship"
   - Each card should have a unique, relevant image
   - Use 16:9 aspect ratio for card banners
   - Ensure variety: avoid all cards having the same color palette or visual tone

4. **Progressive Loading** (below the grid)
   - Use a **"Load more" button** rather than traditional pagination — this suits visual browsing/discovery better and keeps scroll position
   - Show count indicator above or near the button: "Showing 20 of 147 Spaces"
   - Initial load: ~20–25 cards
   - Each "Load more" click appends the next batch (~20 cards)
   - Show skeleton card placeholders briefly while loading the next batch
   - The standard platform footer remains visible below the "Load more" button (it is not buried by infinite scroll)

5. **Empty State**
   - If search returns no results: "No spaces match your search." + "Try a different keyword" + option to clear search
   - If platform has no spaces (edge case): "No spaces have been created yet." + CTA for eligible users

6. **Left Sidebar Navigation** (persistent, consistent with all other pages)
   - "Browse All Spaces" item is highlighted/active in the sidebar
   - Other sidebar items remain accessible (Dashboard, Invitations, My Account, etc.)
   - Sidebar behavior matches Dashboard and all other pages (Pages 1–30)

7. **Footer** (standard platform footer)
   - Consistent with the rest of the platform
   - Visible below the card grid / "Load more" button

**Visual Requirements**:
- Clean, spacious grid layout with generous card padding
- Consistent card styling matching the Space Settings card preview exactly
- Subspace cards are visually distinguishable from Space cards via the stacked avatar and "in: [Parent]" line — but use the same card frame/dimensions
- Lead avatar rows should feel consistent with the Subspaces tab (Page 4) pattern
- Cards should feel content-rich but not cluttered (image + name + short description + leads + badges)
- Professional, calm aesthetic consistent with the rest of the platform
- Search bar is prominent but not dominant
- "Load more" button is clear and centered below the grid
- Smooth loading transitions (skeleton cards while loading next batch)
- Responsive: grid adapts gracefully from 5 columns → 1 column

**Interaction Patterns**:
- Click space card → Navigate to Space Home page (Page 2)
- Click subspace card → Navigate to Subspace page (Page 7)
- Click "in: [Parent Space]" on a subspace card → Navigate to parent Space Home
- Type in search → Results filter in real-time or on submit
- Click "Load more" → Append next batch of cards with skeleton loading state
- Hover card → Subtle lift/shadow animation
- Click filter/sort → Grid re-sorts/filters with smooth transition

**Accessibility & Usability**:
- Keyboard navigation: Tab through cards, Enter to open
- Screen reader: Card title read first, then "in: [Parent]" if subspace, then description, then leads, then badges
- Focus indicators on all interactive elements
- "Load more" button keyboard-accessible
- Search input has clear label and placeholder

**Responsive Behavior**:
- **Desktop (1200px+)**: 4–5 column grid, left sidebar visible, search bar full-width above grid
- **Desktop (1024–1199px)**: 3–4 column grid, left sidebar visible
- **Tablet (768–1023px)**: 2–3 column grid, sidebar collapsed/hamburger, search bar full-width
- **Mobile (<768px)**: 1–2 column grid, sidebar hidden (hamburger), search bar stacked above grid

**Personas**:
- **Contributor**: Browses to discover and join new Spaces relevant to their interests
- **Facilitator**: Checks visibility of their own Spaces; discovers other Spaces for inspiration or cross-collaboration
- **Portfolio Owner**: Scans the full landscape of Spaces for strategic overview; may combine with Ecosystem Analytics for deeper analysis

---
## Page 32: Platform Search (Overlay)

**Route**: N/A — triggered from the global search input in the top navigation bar on any page  
**Audience**: All authenticated users  
**Primary Use**: Search across the entire platform (or within the current Space) for Spaces, Subspaces, Posts, Responses, Contributors, and Organizations  
**Screenshot reference**: search-results-overlay.png (Feb 10, 2026)

### Design Brief

You are designing the **Platform Search overlay** — a modal/overlay that appears when a user activates the omnipresent search input in the top navigation bar. This is the primary cross-platform search experience and must feel fast, organized, and immediately useful.

**Why an overlay (not a separate page)**: The search is a transient lookup — the user wants to find something and jump to it, then continue where they were. An overlay preserves their current page context and feels lighter than a full navigation change. The overlay should feel like a command palette / spotlight: focused, fast, and dismissible.

**Key Elements**:

1. **Overlay Container**
   - Appears centered over the current page (large modal, ~80% viewport width on desktop, ~90% on tablet, full-screen on mobile)
   - Background dims (semi-transparent dark overlay behind the modal)
   - Close button (×) in the top-right corner
   - Dismissible via: × button, clicking outside the overlay, pressing Escape

2. **Search Input Bar** (top of overlay)
   - Full-width search input field, auto-focused when the overlay opens
   - Placeholder: "Search…"
   - Search is triggered on **Enter** (not live/debounced)
   - **Search tags** (additive):
     - Each search submission adds the search term as a **removable pill/tag** below the input
     - Multiple terms create multiple pills (e.g., `innovation ×` `design ×`)
     - Searching again adds a new tag — it does NOT replace the previous one
     - Clicking the × on a tag removes it and re-runs the search with remaining tags
     - Results match against all active tags (AND/OR logic — recommend OR for broader discovery, document the choice)
   - **Scope dropdown** (conditional):
     - Only visible when the user is currently inside a Space
     - Appears as a dropdown/selector within or beside the search bar
     - Options: "All Spaces" (default) / "[Current Space Name]"
     - When set to the current Space, results are scoped to that Space and its Subspaces only
     - When the user is NOT inside a Space (e.g., Dashboard, Profile, Browse All Spaces), the dropdown is hidden entirely — search always covers the full platform

3. **Category sidebar** (left side of overlay)
   - Vertical list of result categories, used as **scroll-to anchors**
   - Only categories **with results** appear in the sidebar — zero-result categories are hidden entirely
   - Each category label shows a result count badge: e.g., "Spaces & Subspaces (12)"
   - Clicking a category scrolls the results pane to that section
   - Active/visible section is highlighted in the sidebar as the user scrolls
   - **Categories** (in display order):
     - **Spaces & Subspaces** — top-level Spaces and Subspaces matching the search
     - **Posts** — posts across spaces (all types including Whiteboards, Memos)
     - **Responses** — responses to posts with collections (e.g., call for posts, call for whiteboards)
     - **Users** — individual people/contributors
     - **Organizations** — organizational contributors
   
   Note: "Contributors" from the current design is split into **Users** and **Organizations** as separate sections for clarity.

4. **Results pane** (right side, scrollable)
   - Vertically stacked sections, one per category (in the same order as the sidebar)
   - Each section has:
     - **Section header**: Category name + result count (e.g., "Spaces & Subspaces (12)")
     - **Filter control** (funnel icon, inline): Section-specific filter dropdown (see filters below)
     - **Result cards**: Horizontal grid or list of result cards (4 per row on desktop)
     - **"Load more" button**: Per-section, loads more results for that category independently without affecting other sections
   - **Disclaimer text** (standard, shown once at the top of the results pane or above the Posts section):
     - "These results may not represent the up to date state of the platform. Search results are updated on an interval."

5. **Per-Section Filters** (funnel icon dropdowns):
   - **Spaces & Subspaces**: All / Spaces only / Subspaces only
   - **Posts**: All / Whiteboards / Memos
   - **Responses**: All / Posts / Whiteboards / Memos
   - **Users**: (no filter needed — single type)
   - **Organizations**: (no filter needed — single type)
   - Filters are dropdown menus; selecting a filter re-renders that section's results immediately
   - Active filter is shown as a pill or label beside the section header

### Result Card Designs (per category)

**Spaces & Subspaces cards** — reuse the **same Space Card component** from Browse All Spaces (Page 31):
- Card banner image, avatar (stacked for subspaces), name, description, privacy badge, lead avatars, member count
- For Subspaces: show "in: [Parent Space Name]" under the title and stacked avatars
- This ensures visual consistency across the platform — users recognize the same card everywhere
- Cards are shown in a responsive horizontal grid (4 per row desktop, 2 tablet, 1 mobile)

**Posts cards**:
- **Author row**: Author avatar (small, circular) + author name
- **Post content preview**: Card banner/thumbnail image if available (or content-type icon for Whiteboards/Memos)
- **Post title** (prominent, linked)
- **Post type indicator**: Subtle badge or icon distinguishing post types (Post / Whiteboard / Memo) — but all use the same card frame
- **Space context**: "in: [Space Name]" as subtle secondary text (so the user knows where this post lives)
- **Date**: Creation or last-updated date
- **Engagement indicators** (optional): Comment count icon, reaction count
- Hover: Subtle lift/shadow

**Responses cards**:
- **Author row**: Author avatar + author name
- **Response content preview**: Truncated text or structured fields preview (e.g., "Task: ...", "Posted by: ...", "Deadline: ...")
- **Response title** (if available) or first line of content
- **Parent context**: "Response to: [Post Name]" as secondary text (linked to the parent post)
- **Space context**: "in: [Space Name]"
- **Date** + engagement indicators
- Hover: Subtle lift/shadow

**Users cards**:
- Reuse the **contributor card pattern** from the Community tab (Page 3)
- Avatar (large, circular — use photo when available, initials fallback)
- User name (prominent)
- Email or role subtitle (secondary text)
- Hover: Subtle lift/shadow

**Organizations cards**:
- Reuse the **organization card pattern** from the Community tab (Page 3)
- Organization logo/avatar (large, rounded-square — use logo when available, initials fallback)
- Organization name (prominent)
- Organization type or tagline (secondary text)
- Hover: Subtle lift/shadow

### Empty & Edge States

- **No results at all**: Show a friendly empty state centered in the results pane: "No results found for [search tags]." + "Try different keywords or broaden your search."
- **No results in a specific category**: That category section is hidden entirely (consistent with sidebar behavior)
- **Search with no input**: Show a prompt: "Type a search term and press Enter to search."
- **Scope set to a Space with no results**: "No results found in [Space Name]. Try searching all Spaces." + toggle CTA to switch scope

**Visual Requirements**:
- Overlay feels lightweight and fast — no heavy page transitions
- Results pane scrolls independently; sidebar remains fixed/sticky within the overlay
- Consistent card styling per category — each card type matches its canonical version elsewhere in the platform
- Filter dropdowns are compact and inline (not full-width)
- "Load more" buttons are subtle and centered within their section
- Search tags/pills use the platform's standard pill/tag component
- Smooth scroll when clicking sidebar anchors (animated scroll, not a jump)
- Skeleton loading states for each section while results load

**Interaction Patterns**:
- Click search icon in top bar → Overlay opens with input auto-focused
- Type search term + press Enter → Tags are added, results load per section
- Click sidebar category → Smooth scroll to that section in results pane
- Click filter funnel → Dropdown appears; select filter → Section updates
- Click "Load more" in a section → More cards append to that section only
- Click a result card → Overlay closes, navigate to that item (Space Home, Post Detail, User Profile, etc.)
- Click × or outside overlay or press Escape → Overlay closes, return to previous page
- Remove a search tag → Results re-query with remaining tags
- Change scope dropdown → Results re-query for selected scope

**Accessibility & Usability**:
- Focus trapped within overlay while open (standard modal focus trap)
- Search input auto-focused on open
- Keyboard: Tab through sidebar → results; Enter to open a result; Escape to close
- Screen reader: Announce "Search results" region; announce category counts; announce when results update
- Focus indicators on all interactive elements
- Search tags have clear "remove" affordance and aria-label

**Responsive Behavior**:
- **Desktop (1024px+)**: Large centered modal (~80% viewport width), sidebar left + results right, 4-column card grids
- **Tablet (768–1023px)**: Modal fills ~90% width, sidebar collapses to horizontal tabs above results, 2-column grids
- **Mobile (<768px)**: Full-screen overlay, sidebar becomes a horizontal scrollable category bar at top, single-column results, search input + tags stacked

**Personas**:
- **Contributor**: Quickly finds a post, space, or person they remember by name; uses search as primary navigation shortcut
- **Facilitator**: Searches for content across their spaces; finds members or organizations to invite; discovers related content in other spaces
- **Portfolio Owner**: Searches for specific spaces, organizations, or people across the portfolio; uses broad searches to discover connections

---