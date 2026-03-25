# Alkemio Page Inventory

## Page 1: Dashboard (Home)

**Path**: `/` (post-login)  
**Access**: All authenticated users  
**Screenshot**: dashboard-home.png (attached in chat Jan 20, 2026)

### Primary Purpose
Central hub for users to access their spaces, track activity, and navigate to key platform areas. Enables quick re-entry to recent work and awareness of activity across spaces.

### Primary Features (Essential)
1. **Recent Spaces Cards** (top row, 4 cards)
   - Shows 4 recently visited spaces
   - Home space always pinned as first card
   - Click to navigate to space detail page
   - Lock icons indicate private spaces
   - "Explore all your Spaces" link → full spaces directory

2. **Activity Feeds** (2-column layout)
   - **Left column**: "Latest Activity in my Spaces" - shows activity in spaces user is member of
   - **Right column**: "My Latest Activity" - shows user's own activity across all spaces
   - Filterable by Space (dropdown: All Spaces) and Role (dropdown: All roles)
   - Click activity item → navigate to that specific item/page
   - "Show more" button loads additional activities

3. **Left Sidebar Navigation**
   - Quick access menu with key actions

### Secondary Features (Supporting)
4. **Quick Access Menu** (left sidebar)
   - **Invitations**: Opens separate invitations page (pending invitations)
   - **Tips & Tricks**: Opens modal with helpful content/guidance
   - **My Account**: Navigate to settings/profile page
   - **Create my own Space**: Opens wizard/form to create new space

5. **Activity View Toggle** (left sidebar)
   - When enabled: Shows activity feeds (current state)
   - When disabled: Changes dashboard to visual gallery of recent spaces only

6. **Resources List** (left sidebar)
   - Lists spaces/resources user has access to (The Sandbox, Demo Space, Softmann, The Collaboration Methodologist)
   - Click to navigate into that space/resource
   - May contain sub-items/nested pages
   - Different from "spaces I'm hosting"

7. **Top Navigation Bar**
   - Search functionality
   - Notifications icon
   - Profile menu (dropdown)
     - Header: avatar + user name + role label (example shown: "Support Admin")
     - **MY DASHBOARD**
     - **MY PROFILE**
     - **MY ACCOUNT**
     - **MY PENDING MEMBERSHIPS** (shows count)
     - **ADMINISTRATION**
     - **CHANGE LANGUAGE**
     - **GET HELP**
     - **SIGN OUT**

### Current Layout
- **Header**: Welcome message ("Welcome, Jeroen!"), tagline ("Ready to make some impact?"), decorative illustration
- **Top section**: Horizontal scrolling row of 4 space cards
- **Main content area**: Two-column activity feeds (equal width)
- **Left sidebar**: Persistent navigation menu + resources list
- **Top-right**: Utility navigation (search, notifications, profile)

### Key Interactions
- **Primary action**: Navigate to a space (via cards, "Explore all", or sidebar resources)
- **Secondary actions**: 
  - Check activity feeds (filter, view details)
  - Access invitations/account/create space
  - Toggle activity view mode
  - Search, check notifications

### Persona Relevance
- **Contributor** (primary): Quickly jump back to work using "My Latest Activity" column; access recent spaces
- **Facilitator** (primary): Monitor "Latest Activity in my Spaces" to oversee work in their spaces; access resources they manage
- **Portfolio Owner** (secondary): May use this to check activity across multiple spaces they oversee; less frequent use as they focus on strategic oversight

### Role-Based Differences
- Different roles may see different widgets/sections (exact differences TBD)
- Certain features may only be visible to specific roles (exact restrictions TBD)
- Resources list content varies based on user's memberships/access

### Source References
- Screenshot: dashboard-home.png (Jan 20, 2026)
- Live site: https://alkem.io/ (post-login)
- Docs: https://alkem.io/docs

---

## Page 2: Space Home Page

**Path**: `/space/[space-name]` (e.g., `/space/building-the-a-team`)  
**Access**: Space members (Contributors, Facilitators/Admins)  
**Screenshot**: space-home.png (attached in chat Jan 20, 2026)

### Primary Purpose
Central hub for collaboration within a Space. Serves as activity feed, discussion forum, and navigation center for space content (subspaces, knowledge base, community). Enables members to engage with posts, access resources, and participate in collaborative activities.

### Primary Features (Essential)

1. **Top Navigation Tabs**
   - **HOME**: Overview/activity feed of space (current view)
   - **COMMUNITY**: View contributors and members of the space
   - **SUBSPACES**: Access smaller, focused working groups within the space
   - **KNOWLEDGE BASE**: Repository for documents and resources
   - **Right-side icons**: Activity logs, video calls, sharing, settings (admin-only)

2. **Activity Feed / Posts** (main content area)
   - Displays posts of various types:
     - **Basic posts**: Text-based announcements/discussions
     - **Posts with embedded whiteboards**: Real-time visual collaboration (sketch, notes, idea mapping)
     - **Posts with collections**: Collections of links/files, posts, or whiteboards
   - **Whiteboard responses**: Members submit whiteboard contributions based on templates
   - **Discussion threads**: Comment threads on posts (can be role-restricted by admins)
   - **Comment boxes**: Engage with posts (permissions controlled by Facilitators)

3. **Left Sidebar - Subspaces List** ("Building the A-team" section)
   - Lists links to child subspaces within this space
   - Examples: "AI no-code market", "AI retreat via Miro", "Approved 2/4", "AI Ask-stink Drive", "Co-dev Evolve Journal", "Co-innovation guide"
   - "Show all" button → full subspaces directory page

### Secondary Features (Supporting)

4. **Welcome Section** (left sidebar, top callout)
   - Introduction/onboarding for new members
   - Customizable by Space admins/Facilitators
   - Can include space purpose, guidelines, quick links

5. **Channels** (left sidebar)
   - Discussion topics/categories (like chat channels)
   - Click to view/participate in channel discussions
   - Users can create new channels (permission-dependent)

6. **"ABOUT THIS SPACE" Button** (left sidebar)
   - Opens detailed information about the Space
   - Shows purpose, goals, membership info, guidelines

7. **Events Section** (left sidebar)
   - Lists upcoming events (e.g., "Purpose Hub")
   - Shows dates/times
   - "Show calendar" → full calendar view

### Current Layout
- **Header**: Space banner image, space title ("Building the A-team"), tagline ("Strengthening the organisation and the people working on it")
- **Top navigation**: Horizontal tabs (HOME, COMMUNITY, SUBSPACES, KNOWLEDGE BASE) + right utility icons
- **Three-column layout**:
  - Left sidebar (fixed): Welcome box, channels, About button, subspaces list, events
  - Main content area (center, scrollable): Activity feed with posts/discussions
  - Right sidebar (optional/contextual): May show additional widgets depending on content

### Key Interactions
- **Primary actions**:
  - Create posts/discussions (various types)
  - Engage with posts (comment, add to collections, collaborate on whiteboards)
  - Navigate to subspaces, community, knowledge base
  - Filter/sort activity feed
- **Secondary actions**:
  - Join channels, view events
  - Access About info, settings (admin)
  - Share space, start video calls

### Persona Relevance
- **Contributor** (primary): Engage with posts, contribute insights, collaborate on whiteboards, participate in discussions
- **Facilitator** (primary): Manage space content, create/moderate posts, configure permissions (who can comment, add to collections), access backend settings, customize welcome section
- **Portfolio Owner** (secondary): Monitor activity across spaces they oversee; less hands-on engagement

### Role-Based Differences
- **Facilitators (Space Admins)**:
  - Access to settings icon (top-right)
  - Can enable/disable comments on posts
  - Can configure collection permissions (who can add items)
  - Can customize welcome section
  - Can manage channels, events, subspaces
  - Backend access to space configuration
- **Contributors (Space Members)**:
  - Can view/engage with content based on permissions set by Facilitators
  - Can create posts (if allowed)
  - Can comment/contribute to collections (if allowed)
  - Cannot access admin settings

### Post Types Detail
1. **Basic Posts**: Text announcements, discussions, questions
2. **Posts with Embedded Whiteboards**: Real-time collaborative visual workspace within post
3. **Posts with Collections**:
   - **Link/File Collections**: Members can add links or upload files
   - **Post Collections**: Members can submit related posts
   - **Whiteboard Collections**: Members submit whiteboards based on a template (e.g., "submit your whiteboard contribution")
   - Facilitators control who can add to collections

### Source References
- Screenshot: space-home.png (Jan 20, 2026)
- Live site: https://alkem.io/space/building-the-a-team
- Docs: https://alkem.io/docs

---

## Page 3: Community Tab (Space Members)

**Path**: `/space/[space-name]/community`  
**Access**: Space members (Contributors, Facilitators/Admins)  
**Screenshot**: space-community.png (attached in chat Jan 20, 2026)

### Primary Purpose
View and search space members and organizations, facilitate member interaction and community building. Provides directory of all participants, virtual contributors, and community-specific activity feed.

### Primary Features (Essential)

1. **"Who's Involved" Section** (top of main content)
   - Grid display of member avatars/profile photos
   - **Filter toggles**: 
     - "People" - individual members
     - "Organizations" - organization members
   - **Search box**: Search member names and profiles
   - **"Show all" button**: Opens full members directory page
   - **Member interaction**: Click profile photo/avatar → navigate to member's profile page

2. **Community Activity Feed** (main content area)
   - Similar to HOME tab activity feed
   - May be filtered to show community-specific content/discussions
   - Posts, discussions, announcements relevant to community

3. **Member Management Actions** (left sidebar - admin only)
   - **"CONTACT THE LEADS" button**: Opens message form/modal with lead contact information
   - **"INVITE PEOPLE TO THIS SPACE" button**: Opens invitation form/modal to invite new members

### Secondary Features (Supporting)

4. **Onboarding Callout** (left sidebar)
   - "I'm not onboard to this Space!" prompt
   - Appears for new members who haven't completed onboarding
   - Guides new members through initial setup

5. **Virtual Contributors** (left sidebar)
   - Special member types (AI assistants, bots, automated contributors)
   - Examples: "Hello Alkemio Contributor", "Campaign Manager", "Digital Service Earth", "Meeting B-cont"
   - Click to open Virtual Contributor profile or interaction interface

6. **Guide Notifications** (left sidebar)
   - "The A-team's Guide: new" - notification badge
   - Links to guide documents or resources
   - Helps members navigate space features

### Current Layout
- **Header**: Same space banner as HOME tab
- **Top navigation**: COMMUNITY tab active
- **Three-column layout**:
  - Left sidebar: Onboarding callout, Contact Leads, Invite People buttons, Virtual Contributors list, guide links
  - Main content area: "Who's involved" member grid + community activity feed below
  - Right sidebar: Contextual (if needed)

### Key Interactions
- **Primary actions**:
  - Search and browse members/organizations
  - View member profiles
  - Contact space leads (admin feature)
  - Invite new members (admin feature)
- **Secondary actions**:
  - Filter between People/Organizations
  - Interact with Virtual Contributors
  - Access onboarding guides
  - Engage with community-specific activity feed

### Persona Relevance
- **Contributor** (primary): Discover other members, view profiles, understand who's in the community, interact with Virtual Contributors
- **Facilitator** (primary): Manage community, invite new members, contact leads, monitor member engagement, configure Virtual Contributors
- **Portfolio Owner** (secondary): Overview of community composition across spaces

### Role-Based Differences
- **Facilitators (Admins)**:
  - Access to "CONTACT THE LEADS" button
  - Access to "INVITE PEOPLE TO THIS SPACE" button
  - Can manage Virtual Contributors
  - Full visibility of all member types
- **Contributors**:
  - Can view members and organizations
  - Can search member directory
  - Cannot invite or contact leads
  - Limited interaction with Virtual Contributors (view only, unless configured otherwise)

### Member Types
1. **People**: Individual contributors/facilitators
2. **Organizations**: Organizational members/partners
3. **Virtual Contributors**: AI assistants, bots, automated tools for specific tasks (e.g., campaign management, meeting coordination)

### Source References
- Screenshot: space-community.png (Jan 20, 2026)
- Live site: https://alkem.io/space/building-the-a-team/community
- Docs: https://alkem.io/docs

---

## Page 4: SUBSPACES Tab (Child Spaces Directory)

**Path**: `/space/[space-name]/subspaces`  
**Access**: Space members (Contributors, Facilitators/Admins)  
**Screenshot**: space-subspaces.png (attached in chat Jan 20, 2026)

### Primary Purpose
Browse and navigate to child spaces (subspaces) within the parent space. Provides discovery and access to focused working groups and collaborative areas.

### Primary Features (Essential)

1. **Subspace Card Grid**
   - Each card represents a subspace/child space
   - **Card elements**:
     - Custom thumbnail image (uploaded by subspace admins)
     - Subspace title
     - Description/tagline
     - Profile avatars of subspace leads/members (bottom of card)
   - **Interaction**: Click card → navigate to subspace detail/home page

2. **Search & Filter Area** (top of main content)
   - **Search**: Find subspaces by name/keyword
   - **Sort options**:
     - By name (A-Z)
     - By members count
     - By activity (most recent)
     - By date created (newest/oldest)
   - **Role-based filters**:
     - Show spaces I'm a member of
     - Show spaces I'm leading
     - Show all subspaces

3. **Create Subspace Action** (top or floating button)
   - Button/action to create a new subspace
   - Opens wizard/form for new subspace creation (admin/facilitator feature)

### Secondary Features (Supporting)

4. **Left Sidebar Context** (may vary from HOME tab)
   - Context-specific options depending on current filter/view
   - May show subspace creation guides or resources

5. **Visual Layout**
   - Responsive card grid (adjusts columns based on screen size)
   - Consistent spacing and card sizing

### Current Layout
- **Header**: Same space banner as other tabs
- **Top navigation**: SUBSPACES tab active
- **Search/filter bar**: Top of main content area
- **Main content**: Card grid of subspaces (responsive columns)
- **Left sidebar**: Context-aware navigation (may change based on view)

### Key Interactions
- **Primary actions**:
  - Search and filter subspaces
  - Click to navigate to subspace detail page
  - Create new subspace (admin feature)
- **Secondary actions**:
  - Sort by various criteria
  - Filter by membership/role status
  - View lead/member avatars

### Persona Relevance
- **Contributor** (primary): Discover subspaces to join, find focused working groups aligned with their interests
- **Facilitator** (primary): Manage subspaces, create new subspaces, monitor subspace activity
- **Portfolio Owner** (secondary): Overview of organizational structure across subspaces

### Role-Based Differences
- **Facilitators (Admins)**:
  - Can create new subspaces
  - Can access subspace management/editing
  - Can see all subspaces regardless of membership
- **Contributors**:
  - Can view and filter accessible subspaces
  - Can click to explore subspaces
  - Cannot create subspaces (unless explicitly granted)

### Design Note
- **Current state**: No pagination implemented; all subspaces load on single page
- **Recommendation**: Implement pagination or lazy-loading when many subspaces exist to improve performance and UX

### Source References
- Screenshot: space-subspaces.png (Jan 20, 2026)
- Live site: https://alkem.io/space/building-the-a-team/subspaces
- Docs: https://alkem.io/docs

---

## Page 5: KNOWLEDGE BASE Tab (Documents & Resources Repository)

**Path**: `/space/[space-name]/knowledge-base`  
**Access**: Space members (Contributors, Facilitators/Admins)  
**Screenshot**: space-knowledge-base.png (attached in chat Jan 20, 2026)

### Primary Purpose
Centralized repository for space knowledge, documents, resources, and collaborative content. Enables team members to discover, access, and manage documented work, decisions, and artifacts.

### Primary Features (Essential)

1. **Content Items Grid/List**
   - Various content post types:
     - Documents
     - Links
     - Whiteboards
     - Collections (grouped items)
   - **Item display**:
     - Thumbnail/preview (auto-generated or manually uploaded)
     - Title
     - Description/summary
     - Tags/metadata
     - Author/contributor information
     - Type indicator (icon/badge: doc, link, whiteboard, etc.)
     - Status/access level badge
   - **Interactions**: 
     - Click item → open document, expand preview, or navigate to detail page
     - Preview without opening (if supported by type)
     - Inline actions: download, share, etc.

2. **Search & Filter Area** (top)
   - **Filter options**:
     - By content type (documents, links, whiteboards, collections)
     - By date (created, modified, date range)
     - By author/contributor
     - By tags
     - By access level/status
   - **Sort options**:
     - Most recent (date modified/created)
     - Most popular (views, downloads)
     - Alphabetical (A-Z, Z-A)
     - Relevance (search results)
   - **Search**: Keyword search across content

3. **Organization Structure** (left sidebar, if hierarchical)
   - Flat or hierarchical layout with folders/categories
   - Left sidebar shows folder/category navigation (if applicable)
   - Breadcrumb or folder path indicator
   - Configurable organization based on space settings

4. **Add Content Action**
   - Button/action to upload or create new knowledge base items
   - Opens dialog/form for item creation
   - May be restricted to specific roles (contributors or facilitators only, depending on space permissions)

### Secondary Features (Supporting)

5. **Collaborative Features**
   - **Discussions/Comments**: Comments on knowledge base items
   - **Version Control**: Edit history tracking
   - **Version History**: View previous versions of documents
   - **Collaborators**: Show who has edited/contributed to item

6. **Item Metadata**
   - Creation date, modification date
   - Access/sharing status (public, space members only, restricted, etc.)
   - Download count or view count
   - Last modified by information

7. **Preview/Expansion**
   - Quick preview without full open (if supported)
   - Expandable card or modal preview
   - "Edit" action for authorized users

### Current Layout
- **Header**: Same space banner as other tabs
- **Top navigation**: KNOWLEDGE BASE tab active
- **Search/filter bar**: Top of main content area
- **Left sidebar** (conditional): Folder/category navigation (if hierarchical)
- **Main content**: Grid or list of content items
- **Right sidebar** (optional): Item details or filters

### Key Interactions
- **Primary actions**:
  - Search and filter content
  - Click to view/open documents
  - Preview items
  - Download or share items
- **Secondary actions**:
  - Create new knowledge base items
  - Edit items (if authorized)
  - View version history
  - Comment on items
  - Tag or organize items

### Persona Relevance
- **Contributor** (primary): Access and learn from documented work, find relevant resources, contribute new documents/links
- **Facilitator** (primary): Organize and manage knowledge base, create documentation structure, moderate/approve items
- **Portfolio Owner** (secondary): Access best practices and lessons learned across spaces

### Role-Based Differences
- **Facilitators (Admins)**:
  - Can create, edit, delete knowledge base items
  - Can organize structure (create folders, set organization)
  - Can configure who can add items
  - Can view version history and manage edits
  - Can restrict/change access levels
- **Contributors**:
  - Can view accessible knowledge base items
  - Can create items (if permitted by space settings)
  - Can comment on items (if enabled)
  - Cannot delete or restrict access to items (unless authorized)

### Content Types Detail
1. **Documents**: Uploaded files, text documents, guides, reports
2. **Links**: External URLs with descriptions/summaries
3. **Whiteboards**: Collaborative visual diagrams, sketches
4. **Collections**: Grouped items (e.g., collection of best practices, resource sets)

### Source References
- Screenshot: space-knowledge-base.png (Jan 20, 2026)
- Live site: https://alkem.io/space/building-the-a-team/knowledge-base
- Docs: https://alkem.io/docs

---

## Page 6: Post Content Dialogue (Add/Create Post Modal)

**Path**: Modal/Dialog triggered from Space or Subspace HOME tab  
**Access**: Space/Subspace members (role-based permission)  
**Screenshot**: add-post-modal.png (attached in chat Jan 20, 2026)

### Primary Purpose
Enable users to create and publish content (posts) within a Space or Subspace. Provides flexible post creation with support for various content types, templates, and response configurations.

### Primary Features (Essential)

1. **Post Metadata**
   - **Title** (required, marked with asterisk)
   - **Tags** (user-created, multiple tags allowed)
   - Help text: "?" icon next to Tags for guidance

2. **Description Editor** (rich text)
   - Rich text formatting toolbar with:
     - Text styling: Bold, Italic, Strikethrough
     - Lists: Unordered, Ordered
     - Code block, Table, Link, Code block
     - Emoji picker
     - Undo/Redo buttons
   - Support for embedded media: Images, videos
   - Placeholder text: "Description"

3. **Additional Content Types** (choose one or none)
   - **None**: Text-only post (default, currently selected)
   - **Whiteboard**: Embed collaborative visual workspace within post
   - **Memo**: Note-taking area for structured notes
   - **Call To Action**: Interactive button/prompt for user engagement (e.g., "Click to join", "Submit your feedback")

4. **References** (optional)
   - **Add Reference** button: Link to related content
   - Reference types:
     - Knowledge base items
     - Other posts
     - External links
   - Displayed as clickable links within the post

5. **Response Options** (expandable section)
   - **Comments**:
     - "No Comments" - disables all commenting on post
     - "Comments" - allows community members to comment
   - **Collection** (optional, mutually exclusive with Comments or works alongside):
     - **None** - no collection (default)
     - **Links & Files** - users can submit/upload files and links
     - **Posts** - users can submit their own posts as responses
     - **Memos** - users submit memo/note responses
     - **Whiteboards** - users submit whiteboard contributions (can be template-based)
   - **Collection Settings** (if collection enabled):
     - Configure contribution templates
     - Set contribution permissions (who can add items)
     - Configure comment settings for collection items

6. **Template System** (header: "FIND TEMPLATE" button)
   - Access pre-designed post structures
   - Template types:
     - Brainstorming templates
     - Decision-making templates
     - Announcement templates
     - Survey/Feedback templates
     - Custom user-created templates
   - Selecting a template: Updates form layout and presets Response Options
   - Users can create custom templates for reuse

### Secondary Features (Supporting)

7. **Post Actions** (bottom right)
   - **SAVE AS DRAFT**: Saves unfinished post; can be edited and published later
   - **POST**: Immediately publishes the post to the Space/Subspace

8. **Modal Controls**
   - Close button (X) in top-right corner
   - Modal title: "Add Post"

### Current Layout
- **Modal**: Center-aligned, white background with header
- **Form flow**: Top to bottom (Title → Tags → Description → Additional Content → References → Response Options)
- **Expandable sections**: Response Options can collapse/expand
- **Sticky footer**: Save/Post buttons remain visible when scrolling

### Key Interactions
- **Primary actions**:
  - Enter title and description
  - Select template for guidance
  - Choose additional content type
  - Configure response options (comments and/or collections)
  - Save as draft or publish immediately
- **Secondary actions**:
  - Add tags
  - Add references
  - Configure collection permissions
  - Undo/redo in description editor
  - Embed media in description

### Persona Relevance
- **Contributor** (primary): Create posts to share insights, ask questions, propose ideas; engage with community through structured responses
- **Facilitator** (primary): Create posts with templates, configure response options, guide community discussions through call-to-action posts
- **Portfolio Owner** (secondary): Rarely uses; may create announcements or strategic posts in key spaces

### Role-Based Differences
- **Post Creation Permissions**:
  - Configuration depends on Space/Subspace settings
  - Options: All members can create, or only Facilitators/designated contributors
  - Typically, Contributors can create posts; Facilitators have full control
- **Template Access**:
  - All users can access pre-defined templates
  - Only Facilitators can create/edit custom templates (depends on space settings)
- **Collection Permissions**:
  - Facilitators can configure who can add to collections
  - Contributors can contribute based on permissions set by Facilitators

### Template Examples
- **Brainstorm Template**: Pre-filled with brainstorming guidelines; collection set to accept ideas/posts
- **Decision Template**: Structured decision-making format; collection for pros/cons/votes
- **Announcement Template**: Simple format for announcements; comments enabled, no collection
- **Feedback/Survey Template**: Structured feedback request; collection for responses (posts, memos, or whiteboards)

### Collection Type Use Cases
- **Links & Files**: Share resources, articles, tools (e.g., "Share your favorite tools")
- **Posts**: Gather structured feedback or ideas (e.g., "Share your use case")
- **Memos**: Collect notes and observations (e.g., "Document your learnings")
- **Whiteboards**: Collaborative visual contributions (e.g., "Submit your org chart" with template)

### Source References
- Screenshot: add-post-modal.png (Jan 20, 2026)
- Live site: https://alkem.io/space/[space-name] (triggered from HOME tab)
- Docs: https://alkem.io/docs

---

## Page 7: Subspace Page (Individual Subspace Home)

**Path**: `/{space-slug}/challenges/{subspace-slug}`  
**Access**: Subspace members (role-based)  
**Screenshot**: subspace-page.png (provided in chat Jan 20, 2026; includes horizontal black bars from capture artifact)

### Primary Purpose
Focused collaboration view for a specific subspace. Provides navigation, context (what the subspace is for), and access to the subspace’s posts/content, members, and related resources.

### Primary Features (Essential)
1. **Subspace Overview Header** (top, below global nav)
   - Large banner/cover image
   - Subspace title (example shown: "Designing Alkemio")
   - Short description/subtitle text (one-paragraph blurb)
   - Inline membership context (avatars)
   - Utility icons in the header area (e.g., search/zoom, share/open, settings/admin; exact set may vary by role)

2. **Subspace Sections (Channel Tabs)**
   - Horizontal tab/pill navigation for subspace channels
   - Example channels shown:
     - **DESIGNING IN FIGMA** (selected)
     - **WRITING**
     - **CREATIVE SPACE**

3. **Primary Content Area**
   - Main feed of subspace items (stacked cards)
   - Create content entry point: **POST** button (top-right of feed) and contextual add buttons on certain modules
   - Common item types shown:
     - **Post with embedded whiteboard** (large embedded canvas preview + "Whiteboard" button)
     - **Collection: Whiteboards** (grid of whiteboard tiles)
     - **Collection: Links/Resources** (list of linked items with title + short description)

### Secondary Features (Supporting)
4. **Left Sidebar Context Panel**
   - Subspace/challenge description callout (contextual copy describing the purpose)
   - Primary call-to-action button: **ABOUT**
   - **COLLAPSE** control to reduce/expand the sidebar
   - Row of utility icons (quick actions; exact meaning/targets TBD)
   - Sidebar item list including the current subspace name (selected)

5. **Utilities / Actions**
   - Per-card overflow menu (3-dot) for content actions
   - Inline **add** buttons on collection modules (circular plus button)
   - Floating action buttons (e.g., chat/help bubble) anchored to bottom-right

### Current Layout
- **Global top navigation**: persistent utility/navigation
- **Left sidebar**: context + actions + optional navigation list
- **Main column**: channel tabs then vertically-scrolling feed
- **Footer**: platform footer links and Alkemio branding

### Key Interactions
- Switch channel tabs to filter the feed to a subspace channel
- Open embedded content (e.g., open a whiteboard from a post or from a collection tile)
- Participate in posts via inline comment composer
- Create new posts and add items to collections (role/permissions dependent)

### Persona Relevance
- **Contributor** (primary): Participate in focused workstreams; create/respond to content in the subspace
- **Facilitator** (primary): Guide collaboration in the subspace; manage permissions and structure
- **Portfolio Owner** (secondary): Observe progress across important subspaces; occasional announcements/oversight

### Role-Based Differences
- Access to settings/invites/content creation depends on Space/Subspace permissions
- Visibility of members-only content depends on membership and privacy settings

### URL Notes
- Observed patterns:
   - `https://alkem.io/building-alkemio-org/challenges/designingalkemio-3330`
   - `https://alkem.io/sandbox/challenges/luxlab`
- Subspace slug may include an optional numeric suffix (e.g., `-3330`).

### Source References
- Screenshot: Subspace page (Jan 20, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 8: User Profile

**Path**: `/user/[user-slug]` (example: `/user/jeroen-nijkamp-7062`)  
**Access**: All authenticated users (view own profile); viewing others depends on space privacy/settings  
**Screenshot**: my-profile.png (provided in chat Jan 21, 2026)

### Primary Purpose
Let users view and manage their personal identity on the platform (public-facing details, activity signals, and links), and provide a consistent place to understand who someone is when collaborating.

### Primary Features (Essential)
1. **Profile Header**
   - Avatar + user name
   - Location indicator
   - Contact/message icon (envelope)
   - Settings shortcut (cog)
   - Large decorative banner background (illustrated)

2. **Bio Section**
   - Dedicated area for personal bio content

3. **Associated Organizations**
   - List of organizations with avatar placeholders
   - Organization list includes counts/indicators (e.g., number of associates)

4. **Resources I Host**
   - Hosted Space cards (example spaces shown)
   - Space cards can show privacy/lock state
   - Badges/labels can appear on cards (e.g., plan/tier)
   - Separate list for **Virtual Contributors** (bots/virtual users)

5. **(Sub)Spaces I Lead**
   - List/card(s) for spaces/subspaces where the user has a leadership role

6. **(Sub)Spaces I'm In**
   - List/card(s) for spaces/subspaces the user is a member of

### Secondary Features (Supporting)
4. **Visibility / Privacy Indicators**
   - What profile info is public vs members-only (depends on platform rules)

5. **Cross-Navigation**
   - Links to spaces/subspaces the user is part of (if present)

### Current Layout
- **Header strip**: Avatar + identity + quick icons
- **Left column**: Bio + Associated organizations
- **Main column**: Hosted resources, then leadership/membership sections (stacked)

### Key Interactions
- View own profile
- Use the settings cog to navigate into account/settings area
- Navigate to hosted spaces/subspaces from cards
- Navigate to a user profile from avatars/names in Community and posts

### Persona Relevance
- **Contributor**: Showcase expertise and contributions; easy navigation to their work
- **Facilitator**: Establish credibility/role; connect identity to moderation/leadership actions
- **Portfolio Owner**: Present oversight identity; quickly jump to memberships and activity

### Role-Based Differences
- Editing allowed only on own profile
- Viewing details may vary by privacy settings and membership context

### Source References
- Screenshot: my-profile.png (Jan 21, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 9: Account / Settings

**Path**: `/user/[user-slug]/settings/account` (example: `/user/jeroen-nijkamp-7062/settings/account`)  
**Access**: All authenticated users  
**Screenshot**: my-account-account-tab.png (provided in chat Jan 21, 2026)

### Primary Purpose
Provide users a place to manage account-level preferences and security, including identity settings, notifications, language, and any account controls needed for day-to-day use.

### Primary Features (Essential)
1. **Account Area Navigation Tabs**
   - **MY PROFILE**
   - **ACCOUNT** (selected in screenshot)
   - **MEMBERSHIP**
   - **ORGANIZATIONS**
   - **NOTIFICATIONS**
   - **SETTINGS**

2. **URL Notes**
   - User profile slugs appear to include a numeric suffix (e.g., `-7062`).
   - Settings area follows `/user/[user-slug]/settings/[tab]` (observed for `account`).

3. **Hosted Spaces (Account Tab)**
   - List of hosted spaces with name + description
   - Per-space overflow menu (3-dot)
   - Per-space plan/tier badge (example shown: "Plus", "Premium")
   - Create/add entry point via floating **+** button inside the card
   - Capacity indicator (e.g., "2/5")

4. **Virtual Contributors (Account Tab)**
   - List of virtual contributors with name + description
   - Per-item overflow menu (3-dot)
   - Create/add entry point via floating **+** button inside the card
   - Capacity indicator (e.g., "2/5")

5. **Template Packs (Account Tab)**
   - Empty-state / list container
   - Create/add entry point via floating **+** button
   - Capacity indicator (e.g., "0/5")

6. **Custom Homepages (Account Tab)**
   - Empty-state / list container
   - Create/add entry point via floating **+** button
   - Capacity indicator (e.g., "0/1")

### Secondary Features (Supporting)
6. **Help / Support Copy**
   - Informational text about contacting the Alkemio team

7. **Sign Out**
   - Available in profile menu (dashboard/top nav)

### Current Layout
- **Header strip**: Avatar + identity
- **Top sub-navigation**: Account area tabs
- **Main content**: Grid of large cards (Hosted Spaces, Virtual Contributors, Template Packs, Custom Homepages)

### Key Interactions
- Navigate between account area tabs
- Add/create hosted resources via **+** buttons
- Use overflow menus for item actions

### Persona Relevance
- **Contributor**: Manage notifications so collaboration stays manageable
- **Facilitator**: Configure notifications across multiple spaces
- **Portfolio Owner**: Tune notifications and account preferences for oversight tasks

### Role-Based Differences
- Mostly none; some controls may vary by org policy

### Source References
- Screenshot: my-account-account-tab.png (Jan 21, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 10: My Account — My Profile Tab

**Path**: `/user/[user-slug]/settings/profile` (example: `/user/jeroen-nijkamp-7062/settings/profile`)  
**Access**: All authenticated users (own account settings)  
**Screenshot**: my-profile-tab.png (provided in chat Jan 22, 2026)

### Primary Purpose
Provide profile-related settings within the account area (distinct from the public profile page), focused on editing identity fields and profile configuration.

### Primary Features (Essential)
1. **Account Area Navigation Tabs**
   - MY PROFILE (selected), ACCOUNT, MEMBERSHIP, ORGANIZATIONS, NOTIFICATIONS, SETTINGS, SECURITY

2. **Profile Edit Form**
   - **Avatar Upload**: Profile picture with EDIT button below
   - **First Name** (text input)
   - **Last Name** (text input)
   - **Nickname** (text input)
   - **Email** (appears display-only)
   - **Organization** (dropdown or linked field)
   - **Bio** (rich text editor with formatting toolbar: bold, italic, underline, strikethrough, lists, headings, links, quotes, code, etc.)
   - **Tagline** / **City** (location/short description fields)
   - **Links & Social** (sections for LinkedIn, Twitter, GitHub, custom email link, etc.)
   - **Add Reference** (button to add more links)
   - **Save** button (full-width, bottom of form)

### Secondary Features (Supporting)
3. **Rich Text Editor**
   - Formatting toolbar in Bio field for styled content (bold, italic, underline, strikethrough, lists, heading levels, links, quotes, code blocks)

### Current Layout
- **Header**: User identity + settings tabs
- **Left section**: Avatar with EDIT button
- **Right section**: Vertical form with fields and Save button

### Key Interactions
- Upload/change avatar
- Edit profile fields (name, organization, bio, etc.)
- Add/remove social links
- Format bio with rich text
- Save changes

### Persona Relevance
- **Contributor**: Build professional profile; showcase skills/links
- **Facilitator**: Maintain clear identity and role signals
- **Portfolio Owner**: Present leadership/organizational identity

### Source References
- Screenshot: my-profile-tab.png (Jan 22, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 11: My Account — Membership Tab

**Path**: `/user/[user-slug]/settings/membership` (example: `/user/jeroen-nijkamp-7062/settings/membership`)  
**Access**: All authenticated users (own account settings)  
**Screenshot**: memberships-tab.png (provided in chat Jan 22, 2026)

### Primary Purpose
Show and manage the user’s memberships across spaces/subspaces/organizations, including invites/pending memberships where applicable.

### Primary Features (Essential)
1. **Membership List**
   - Spaces/subspaces the user belongs to (TBD)
   - Roles and status indicators (e.g., active/pending) (TBD)

2. **Membership Status & Counts**
   - Pagination/capacity: "Showing X of Y memberships"
   - Badges/labels on cards (e.g., plan tier: "Plus", "Premium"; role indicators)

3. **Per-Membership Actions**
   - Overflow menu (3-dot) for actions like "Leave", "View Details", etc.

### Secondary Features (Supporting)
4. **Filtering / Sorting**
   - Filter by role, status (active/pending), or organization (if supported)

5. **Create / Join Entry Points**
   - Floating **+** button or "Join Space" entry point

### Current Layout
- **Header**: User identity + settings tabs
- **Main content**: Grid of space/resource cards
- **Pagination**: Shows capacity/count

### Key Interactions
- View membership cards
- Access overflow menu for actions
- Navigate to a membered space (click card)

### Persona Relevance
- **Contributor**: Quickly see all spaces they're part of
- **Facilitator**: Manage multiple spaces they facilitate
- **Portfolio Owner**: See all portfolio spaces at a glance

### Source References
- Screenshot: memberships-tab.png (Jan 22, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 12: My Account — Organizations Tab

**Path**: `/user/[user-slug]/settings/organizations` (example: `/user/jeroen-nijkamp-7062/settings/organizations`)  
**Access**: All authenticated users (own account settings)  
**Screenshot**: organizations-tab.png (provided in chat Jan 22, 2026)

### Primary Purpose
Manage organization affiliations and organization-level settings available to the user (if they are an org admin/associate).

### Primary Features (Essential)
1. **Associated Organizations List**
   - Multi-column grid/list of organizations with avatar + name + location
   - Examples shown: Sandbox Organization, Gamestorming, Agile Scrum Group (Amsterdam, NL), Design. Think. Make. Break. Repeat., Catalyse (Auckland, NZ), Alkemio BV (The Hague, NL - Verified), Interaction Design Foundation, etc.
   - Per-organization **Associates** count badge (e.g., "Associates (12)", "(3)", "(21)")
   - Role/status indicator: "Verified" badge or associate role label

2. **Organization Actions**
   - **DISASSOCIATE** button per organization (remove association)
   - **CREATE** button (top-right) to create or add new organization

3. **Organization Structure**
   - Two-column or multi-column layout with org cards
   - Each org shows associate count badges, verification status, and disassociate control

### Secondary Features (Supporting)
4. **Organization Metadata**
   - Avatar/icon per org
   - Name and location/description
   - Verification status indicator (e.g., "Verified" badge)

### Current Layout
- **Header**: User identity + settings tabs
- **Main content**: Multi-column grid of organization cards
- **Actions**: DISASSOCIATE per card + CREATE button top-right

### Key Interactions
- View associated organizations
- Disassociate from an organization
- Create or associate with a new organization

### Persona Relevance
- **Contributor**: Manage org affiliations and associations
- **Facilitator**: Oversee organization roles and team
- **Portfolio Owner**: Manage portfolio organization identity

### Role-Based Differences
- Some orgs show "Verified" status
- Disassociate permissions depend on org role/access

### Source References
- Screenshot: organizations-tab.png (Jan 22, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 13: My Account — Notifications Tab

**Path**: `/user/[user-slug]/settings/notifications` (example: `/user/jeroen-nijkamp-7062/settings/notifications`)  
**Access**: All authenticated users (own account settings)  
**Screenshot**: notifications-tab.png (provided in chat Jan 22, 2026)

### Primary Purpose
Let users configure how and when they receive notifications (in-app and potentially email), so collaboration remains manageable and users stay informed without overwhelm.

### Primary Features (Essential)
1. **Notification Preference Sections** (organized by context)

   **Space Section**
   - Preferences for space-related notifications (posts, comments, updates, calendar alerts, etc.)
   - Example preferences:
     - "Receive a notification when a post is published in a community I am a member of"
     - "Receive a notification when a new comment is added to a post in a community I am member of"
     - "Receive a notification when a new communication (whiteboards/posts, links, memos, etc.) is shared on a community"
     - "Receive a notification when a comment is made on a post in a community I am a member of"
     - "Receive a notification when a new update is shared on a community I am a member of"
     - "Receive calendar notifications for a community I am a member of"
   - Per-preference toggles for **In-app** and **Email** channels

   **Platform Section**
   - Preferences for platform-level discussions and activities
   - Example preferences:
     - "Receive a notification when a new comment is added to a discussion I follow"
     - "Receive a notification when a new discussion is created"
   - Per-preference toggles for **In-app** and **Email** channels

   **Organization Section**
   - Preferences for org-related events and announcements
   - Example preferences (TBD from full screenshot):
     - Mentions in organization contexts
     - Direct messaging to organization
   - Per-preference toggles for **In-app** and **Email** channels

   **User Section**
   - Preferences for personal interactions and invites
   - Example preferences:
     - "Receive a notification when someone replies to my comment"
     - "Receive a notification when I am mentioned"
     - "Receive a notification when someone sends me a direct message"
     - "Receive a notification when someone invites me to join a community"
     - "Receive a notification when I join a new Space/community"
   - Per-preference toggles for **In-app** and **Email** channels

   **Virtual Contributor Section**
   - Preferences for notifications related to virtual contributors/AI agents
   - Example preference:
     - "Receive a notification when a VC manager is invited to join a community"
   - Per-preference toggles for **In-app** and **Email** channels

2. **Notification Channels**
   - **In-app**: On-platform notifications (bell icon)
   - **Email**: Email digest or real-time email notifications
   - Toggle per preference allows independent control

### Secondary Features (Supporting)
3. **Preference Granularity**
   - Settings organized by context (Space, Platform, Organization, User, Virtual Contributor)
   - Allows fine-grained control without overwhelming the user
   - Two-column layout (In-app and Email toggles side-by-side)

### Current Layout
- **Header**: User identity + settings tabs
- **Explanatory text**: "Here you can edit your notifications preferences"
- **Main content**: Multiple collapsible or static sections with preference rows
- **Each row**: Preference description + In-app toggle + Email toggle
- **Scrollable**: Long list of preferences organized by topic

### Key Interactions
- Toggle individual preferences on/off (per channel: in-app/email)
- Independent control of notification channels
- Changes auto-save or require Save button (TBD)

### Persona Relevance
- **Contributor**: Tune notifications to avoid overwhelm; stay aware of mentions/replies
- **Facilitator**: Manage notifications across multiple spaces; possibly more granular needs
- **Portfolio Owner**: Configure for oversight notifications without constant alerts

### Role-Based Differences
- All users have same preference structure; role differences are in what notifications are generated

### Source References
- Screenshot: notifications-tab.png (Jan 22, 2026)
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

---

## Page 14: My Account — Settings Tab

**Path**: `/user/[user-slug]/settings/[tab]` (expected `settings`; needs confirmation)  
**Access**: All authenticated users (own account settings)  
**Screenshot**: (not provided yet)

### Primary Purpose
Provide remaining account-level configuration that doesn’t fit profile/membership/orgs/notifications (e.g., language, security, privacy, accessibility).

### Primary Features (Essential)
1. **General Preferences**
   - Language and other preferences (TBD)

2. **Security / Privacy**
   - Password/authentication settings, privacy controls (if supported) (TBD)

### Current Layout
- TBD from screenshot

### Key Interactions
- Update preferences
- Save/apply changes

### Source References
- Live site: https://alkem.io/
- Docs: https://alkem.io/docs

