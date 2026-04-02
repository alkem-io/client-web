# Design System Documentation Page — Atomic Design System

**Purpose**: Create a comprehensive, single-page design system reference that documents all UI components, design tokens, and their states for the Alkemio platform using atomic design methodology.

**Target Output**: One super page containing all design system elements organized hierarchically by atomic level (Design Tokens → Atoms → Molecules → Organisms → Templates → Pages) with full state variations for each component.

---

## Page Structure & Layout

**Route**: `/design-system` or `/documentation/design-system`

**Audience**: Design team, developers, product managers, contributors to the design system

**Primary Use**: 
- Reference all available components and their states
- Document design tokens and foundational values
- Ensure consistency across the platform
- Guide implementation of new features
- Facilitate handoff between design and development

---

## Page Layout (Overall Organization)

**Left Sidebar Navigation** (sticky, ~250px width):
- Collapsible sections for each atomic level:
  - Design Tokens / Foundations
  - Atoms
  - Molecules
  - Organisms
  - Templates
  - Pages
- Jump links to scroll to each section
- Search functionality to find components by name

**Main Content Area** (scrollable, full width):
- Header with title, version, last updated date
- Each atomic level section with detailed component documentation
- All components organized with visual examples and state variations

---

## 1. Design Tokens / Foundations Section

**Section Header**: "Design Tokens & Foundations"

**Subsections**:

### 1.1 Color Palette

**Layout**: Grid display of all colors

**For Each Color**:
- Color name (e.g., "Primary Blue", "Success Green", "Error Red")
- Color swatch (large square, 80x80px minimum)
- Hex code (e.g., `#007BFF`)
- RGB values (e.g., `rgb(0, 123, 255)`)
- CSS variable name (e.g., `--color-primary-blue`)
- Usage context (e.g., "Primary actions, links, active states")
- Accessibility note (e.g., "Contrast ratio: 4.5:1 on white background")

**Color Categories**:
- Primary Colors (main brand colors)
- Secondary Colors (supporting brand colors)
- Semantic Colors (success, warning, error, info)
- Neutral Colors (grays, blacks, whites for text/backgrounds)
- Interactive States (hover, active, disabled overlays)

### 1.2 Typography

**Layout**: Card-based display for each typography scale

**For Each Typography Style**:
- Style name (e.g., "Heading 1", "Body Regular", "Caption")
- Visual example with sample text
- Font family (e.g., "Inter")
- Font size (e.g., "32px")
- Font weight (e.g., "700 Bold")
- Line height (e.g., "1.2")
- Letter spacing (e.g., "0px")
- CSS variable name (e.g., `--typography-h1`)
- Usage context (e.g., "Page titles, main headings")

**Typography Categories**:
- Headings (H1, H2, H3, H4, H5, H6)
- Body Text (Body Regular, Body Medium, Body Small)
- UI Labels (Label Regular, Label Small)
- Captions (Caption, Micro)
- Monospace (for code snippets)

### 1.3 Spacing

**Layout**: Visual scale showing spacing increments

**For Each Spacing Value**:
- Spacing name/token (e.g., "Spacing-8", "Spacing-16", "Spacing-24")
- Pixel value (e.g., "8px", "16px", "24px")
- Visual representation (horizontal line or box showing size)
- CSS variable name (e.g., `--spacing-unit-2`)
- Common usage (e.g., "Gap between form fields", "Card padding")

**Spacing Categories**:
- Micro spacing (4px, 8px)
- Small spacing (12px, 16px)
- Medium spacing (20px, 24px)
- Large spacing (32px, 40px)
- Extra-large spacing (48px, 64px)

### 1.4 Border Radius

**Layout**: Visual squares showing each radius

**For Each Border Radius**:
- Name (e.g., "Radius Small", "Radius Medium", "Radius Large")
- Pixel value (e.g., "4px", "8px", "12px")
- Visual example (rounded square)
- CSS variable name (e.g., `--border-radius-md`)
- Usage context (e.g., "Button corners", "Card edges", "Modal corners")

### 1.5 Shadows

**Layout**: Card display showing each shadow

**For Each Shadow**:
- Shadow name (e.g., "Elevation-1", "Elevation-2", "Elevation-3")
- CSS value (e.g., `0 2px 4px rgba(0,0,0,0.1)`)
- Visual example (colored box with shadow)
- CSS variable name (e.g., `--shadow-elevation-1`)
- Usage context (e.g., "Floating buttons", "Modals", "Cards")

### 1.6 Animation/Transition Tokens

**For Each Animation**:
- Animation name (e.g., "Fade In", "Slide Down", "Scale Up")
- Duration (e.g., "200ms", "300ms")
- Easing (e.g., "ease-in-out", "cubic-bezier(...)")
- CSS variable name (e.g., `--animation-fade-in`)
- Usage context (e.g., "Modal appearances", "Button interactions")

---

## 2. Atoms Section

**Section Header**: "Atoms - Basic Building Blocks"

**Description**: "The smallest, reusable UI components that cannot be broken down further."

### For Each Atom Component:

**Component Card Layout**:
- Component name (prominent heading)
- Brief description of purpose
- Visual example of default state
- **States Grid** (showing all applicable states):

#### 2.1 Button Component

**States to Show** (in grid layout, 2-3 columns):
1. **Default State**: Standard button appearance
   - Example: "Click me"
   - Visual: Standard styling
2. **Hover State**: Visual feedback on mouse over
   - Visual: Slightly darker/lighter, subtle shadow increase
3. **Active/Pressed State**: Visual feedback when clicked
   - Visual: Pressed-in appearance
4. **Disabled State**: Non-interactive appearance
   - Visual: Grayed out, cursor not-allowed
5. **Loading State**: Shows loading indicator
   - Visual: Spinner inside button, text hidden or replaced
6. **Focus State**: Keyboard focus indicator
   - Visual: Outline or border highlighting

**Button Variations** (separate rows for each variation):
- Primary Button (all 6 states above)
- Secondary Button (all 6 states)
- Tertiary Button (all 6 states)
- Danger Button (all 6 states)
- Small Button (all 6 states)
- Large Button (all 6 states)

**Documentation per button**:
- Size (e.g., "48px height")
- Padding (e.g., "12px horizontal, 16px vertical")
- Typography (e.g., "Body Medium, bold")
- Color (primary, secondary, etc.)
- Usage example

#### 2.2 Input Field Component

**States to Show**:
1. **Empty/Default**: Standard input appearance
2. **Focused**: Blue outline, active state
3. **Filled**: With sample text
4. **Disabled**: Grayed out, non-interactive
5. **Error**: Red border/background, error message below
6. **Success**: Green border, checkmark icon
7. **Placeholder**: Showing placeholder text (not focused)

**Input Variations**:
- Text Input (all 7 states)
- Email Input (all 7 states)
- Password Input (all 7 states, show/hide toggle)
- Number Input (with spinner controls)
- Textarea (all 7 states, larger height)
- Checkbox (unchecked, checked, indeterminate, disabled checked/unchecked)
- Radio Button (unchecked, checked, disabled checked/unchecked)
- Toggle Switch (off, on, disabled off/on)

#### 2.3 Label Component

**States to Show**:
1. **Default**: Standard label text
2. **Required**: With red asterisk
3. **Disabled**: Grayed out appearance
4. **Error**: Red text color

**Label Variations**:
- Regular Label (all 4 states)
- Small Label (all 4 states)
- Large Label (all 4 states)

#### 2.4 Badge/Tag Component

**States to Show**:
1. **Default**: Standard appearance
2. **Hover**: Subtle highlight
3. **Active**: Highlighted/selected state
4. **Disabled**: Grayed out
5. **Removable** (with X icon): Default, hover

**Badge Variations**:
- Primary Badge (all 5 states)
- Secondary Badge (all 5 states)
- Success Badge (all 5 states)
- Warning Badge (all 5 states)
- Error Badge (all 5 states)
- Small Badge (all 5 states)
- Large Badge (all 5 states)

#### 2.5 Icon Component

**States to Show**:
1. **Default**: Standard icon
2. **Hover**: Slightly larger/brighter
3. **Disabled**: Grayed out
4. **Active**: Highlighted/colored

**Icon Categories**:
- Navigation icons (home, settings, search, menu, etc.)
- Action icons (add, delete, edit, save, etc.)
- Status icons (checkmark, X, warning, info, etc.)
- Social icons (share, comment, like, etc.)
- Show each icon in all 4 states

#### 2.6 Avatar Component

**States to Show**:
1. **Default**: User image/initials
2. **Hover**: Slightly enlarged/shadow
3. **Online Status**: Green dot in corner
4. **Offline Status**: Gray dot in corner
5. **Placeholder**: Default avatar when no image

**Avatar Variations**:
- Small Avatar (24px)
- Medium Avatar (32px)
- Large Avatar (48px)
- Extra-Large Avatar (64px)
- Each size shown in all 5 states

#### 2.7 Icon Button (Compact Icon-only Button)

**States to Show**:
1. **Default**: Icon only, no background
2. **Hover**: Subtle background highlight
3. **Active**: Background fill, icon highlighted
4. **Disabled**: Grayed out

**Icon Button Variations**:
- Primary Icon Button (all 4 states)
- Secondary Icon Button (all 4 states)
- Small Icon Button (all 4 states)
- Large Icon Button (all 4 states)

#### 2.8 Divider Component

**Variations**:
- Horizontal Divider (thin line)
- Horizontal Divider with Text (line with centered text)
- Vertical Divider (rarely used)

#### 2.9 Chip/Pill Component

**States to Show**:
1. **Default**: Standard appearance
2. **Hover**: Highlighted
3. **Selected**: Filled background
4. **Disabled**: Grayed out
5. **With Avatar**: User chip with avatar
6. **Removable**: With X button (show X on hover)

#### 2.10 Tooltip Component

**States to Show**:
1. **Visible**: Tooltip showing above/below element
2. **Position Variants**: Top, bottom, left, right positioning
3. **Alignment Variants**: Centered, left-aligned, right-aligned

---

## 3. Molecules Section

**Section Header**: "Molecules - Small Functional Units"

**Description**: "Groups of atoms combined to form more complex UI components."

### For Each Molecule Component:

#### 3.1 Search Bar (Input + Icon Button)

**States to Show**:
1. **Default**: Empty search box with search icon
2. **Focused**: Blue outline, cursor active
3. **With Input**: Text entered, X button to clear visible
4. **Hover over X**: Highlight on clear button
5. **Search Results Open**: Dropdown list showing below
6. **No Results**: "No results found" message
7. **Loading**: Spinner in search box
8. **Disabled**: Grayed out, non-interactive

#### 3.2 Form Field (Label + Input + Help Text)

**States to Show**:
1. **Default**: Label, input, help text
2. **Focused**: Input focused, blue outline
3. **Filled**: With user input text
4. **Error**: Red border, error message in place of help text
5. **Success**: Green checkmark in input, success message
6. **Disabled**: All elements grayed out
7. **Required**: Label with red asterisk

**Form Field Variations**:
- Text Field (all 7 states)
- Email Field (all 7 states)
- Password Field (with show/hide toggle, all 7 states)
- Textarea (all 7 states)
- Select Dropdown (all 7 states)

#### 3.3 Radio Button Group (Label + Multiple Options)

**States to Show**:
1. **Default**: Unselected options
2. **One Selected**: One option selected/filled
3. **Hover**: Subtle highlight on option
4. **Disabled Group**: All options grayed out
5. **Disabled Single Option**: One option grayed out while others active

**Radio Variations**:
- Vertical Layout (all 5 states)
- Horizontal Layout (all 5 states)

#### 3.4 Checkbox Group (Label + Multiple Checkboxes)

**States to Show**:
1. **Default**: All unchecked
2. **Some Checked**: Mixed selection
3. **All Checked**: Select all state
4. **Indeterminate**: Parent checkbox indeterminate (some children checked)
5. **Hover**: Subtle highlight
6. **Disabled**: Grayed out

#### 3.5 Dropdown/Select Menu (Button + Dropdown List)

**States to Show**:
1. **Closed/Default**: Button showing selected value
2. **Hover**: Button highlight
3. **Open**: Dropdown list visible below
4. **Hovering Item**: Item in list highlighted
5. **Selected Item**: Item checked/highlighted
6. **Disabled**: Grayed out, non-interactive
7. **Error**: Red border on button, error message
8. **Loading**: Spinner in dropdown while loading options

**Dropdown Variations**:
- Single Select (all 8 states)
- Multi Select with checkboxes (all 8 states)
- Searchable Dropdown (with search input, all 8 states)

#### 3.6 Pagination (Previous + Number Buttons + Next)

**States to Show**:
1. **Default**: First page (previous disabled, first page highlighted)
2. **Middle Page**: All buttons active, current page highlighted
3. **Last Page**: Last page highlighted, next disabled
4. **Hover Page Number**: Page button highlighted
5. **Active Page**: Page 3 selected/filled

**Pagination Variations**:
- Numbered Pagination (1, 2, 3, 4, 5)
- With Ellipsis (1, 2, ..., 10, 11, 12)

#### 3.7 Breadcrumb (Home > Category > Current Page)

**States to Show**:
1. **Default**: Standard appearance with separators
2. **Last Item Not Clickable**: Current page unlinked
3. **Hover Previous Item**: Previous breadcrumb highlighted
4. **Mobile Version**: Shortened (only show last 2-3)

#### 3.8 Tab Navigation (Tab 1 | Tab 2 | Tab 3)

**States to Show**:
1. **Default**: First tab selected, underline/background
2. **Tab 2 Clicked**: Second tab selected and highlighted
3. **Hover Tab**: Tab shows hover state
4. **Disabled Tab**: Grayed out, non-interactive
5. **Scrollable Tabs**: Arrows visible if overflow

**Tab Variations**:
- Underline Tabs (all 5 states)
- Button-style Tabs (all 5 states)
- Segmented Control Tabs (all 5 states)

#### 3.9 Alert/Toast Message (Icon + Message + Close Button)

**States to Show**:
1. **Info Alert**: Blue background, info icon
2. **Success Alert**: Green background, checkmark icon
3. **Warning Alert**: Yellow background, warning icon
4. **Error Alert**: Red background, X icon
5. **Dismissible**: All with close button visible

**Alert Variations**:
- Alert Box (full width, on page)
- Toast (floating corner, auto-dismisses)
- Inline Alert (within context)
- With Action Button (alert + action button)

#### 3.10 Card (Container + Image + Title + Description + CTA)

**States to Show**:
1. **Default**: Standard card with all elements
2. **Hover**: Subtle shadow increase, slight lift
3. **Interactive**: Shows it's clickable (cursor pointer)
4. **Disabled**: Grayed out, non-interactive
5. **Selected/Active**: Border highlight or background

**Card Variations**:
- Image Card (image at top, all 5 states)
- Text Card (text only, all 5 states)
- Icon Card (icon + text, all 5 states)
- Compact Card (smaller version, all 5 states)

#### 3.11 Progress Bar (Linear Progress Indicator)

**States to Show**:
1. **0% Complete**: Empty bar
2. **50% Complete**: Half-filled
3. **100% Complete**: Fully filled (success color)
4. **Indeterminate**: Animated/loading state
5. **With Label**: "50% Complete" text overlay or beside

**Progress Bar Variations**:
- Standard Progress Bar (all 5 states)
- Small Progress Bar (compact height, all 5 states)
- Large Progress Bar (prominent, all 5 states)

#### 3.12 Rating/Stars Component

**States to Show**:
1. **0 Stars**: No rating
2. **2.5 Stars**: Half star shown (shows fractional ratings)
3. **5 Stars**: Full rating
4. **Hover at Star 3**: Visual preview of rating to 3 stars
5. **Disabled**: Grayed out, non-interactive
6. **With Count**: "4.5 (120 reviews)"

#### 3.13 Stepper/Timeline (Step 1 → Step 2 → Step 3)

**States to Show**:
1. **Step 1 Active**: Current step highlighted
2. **Step 2 Active**: Step progress advanced
3. **Step 1 Completed**: Check mark on step 1
4. **Hover Previous Step**: Previous step highlighted (clickable)
5. **Disabled Step**: Grayed out, non-interactive

**Stepper Variations**:
- Vertical Stepper (steps stacked, all 5 states)
- Horizontal Stepper (steps in row, all 5 states)

---

## 4. Organisms Section

**Section Header**: "Organisms - Complex Component Combinations"

**Description**: "Larger, self-contained sections made up of molecules and atoms."

### For Each Organism Component:

#### 4.1 Header/Navigation Bar

**States to Show**:
1. **Desktop Default**: Logo + menu items + user avatar
2. **Mobile Collapsed**: Logo + hamburger menu icon
3. **Mobile Menu Open**: Hamburger menu expanded, showing items
4. **Hover Menu Item**: Menu item highlighted
5. **Active Page**: Current page highlighted in menu
6. **Sticky Header**: Header remains at top on scroll (show with scroll indicator)
7. **With Notifications**: Bell icon with red notification badge

**Header Variations**:
- Standard Header (logo + nav + actions)
- Minimal Header (logo only)
- Dark Header (dark background, light text)
- Transparent Header (overlays page content)

#### 4.2 Sidebar Navigation

**States to Show**:
1. **Default**: Expanded sidebar with all menu items
2. **Collapsed**: Sidebar minimized, icons only
3. **Hover Item**: Menu item highlighted
4. **Active Item**: Current page highlighted
5. **Submenu Expanded**: Nested items visible
6. **Submenu Collapsed**: Nested items hidden

**Sidebar Variations**:
- Left Sidebar (all 6 states)
- With Section Headers (all 6 states)
- Scrollable Sidebar (overflow with scroll)

#### 4.3 Card Grid (Multiple Cards in Responsive Layout)

**States to Show**:
1. **Desktop (4 columns)**: 4 cards per row
2. **Tablet (2 columns)**: 2 cards per row
3. **Mobile (1 column)**: 1 card per row
4. **With Hover**: One card showing hover state while others normal
5. **Loading State**: Skeleton loaders for cards

#### 4.4 Form (Multiple Fields + Submit Button)

**States to Show**:
1. **Default/Empty**: All fields empty
2. **Partial Fill**: Some fields filled
3. **All Filled**: All required fields completed
4. **Validation Errors**: Red borders/messages on invalid fields
5. **Submit Hover**: Submit button hover state
6. **Submitting**: Loading spinner in button, fields disabled
7. **Success**: Success message shown, form cleared or disabled

**Form Variations**:
- Simple Contact Form (3 fields)
- Complex Multi-step Form (multiple sections/pages)
- Login Form (email/password + remember me + forgot password link)

#### 4.5 Modal/Dialog Box

**States to Show**:
1. **Modal Open**: Centered on screen with dark overlay
2. **Close Button Hover**: X button highlighted
3. **With Actions**: Modal with OK/Cancel buttons
4. **Action Hover**: Button highlighted
5. **Modal Closing**: Fade out animation (show as snapshot)
6. **Scrollable Content**: Content scrolls within modal
7. **Confirmation Modal**: Larger modal with warning/alert styling

**Modal Variations**:
- Alert Modal (warning/error/success)
- Form Modal (contains form fields)
- Confirmation Modal (yes/no/cancel buttons)
- Full-screen Modal (mobile version)

#### 4.6 Dropdown Menu with Categories

**States to Show**:
1. **Closed**: Button showing "More" or three dots
2. **Open**: Menu visible with categories/items
3. **Hover Item**: Item highlighted
4. **Item with Icon**: Icon + text items
5. **Divider**: Section dividers between items
6. **Disabled Item**: Grayed out item

#### 4.7 User Profile Card (Avatar + Name + Status + Actions)

**States to Show**:
1. **Default**: Profile info displayed
2. **Hover**: Subtle highlight, action buttons appear
3. **Follow Button State**: "Follow" button before, "Following" after
4. **Message Button Hover**: Message button highlighted
5. **Online Status**: Green dot indicator
6. **Offline Status**: Gray dot indicator
7. **Loading**: Skeleton loader for profile card

#### 4.8 Notification List (Multiple Notifications)

**States to Show**:
1. **Default**: List of notifications
2. **Unread Notification**: Bold text, different background
3. **Read Notification**: Normal text, lighter background
4. **Hover Notification**: Highlight + reveal action buttons
5. **Delete/Dismiss Hover**: X button appears and is highlighted
6. **Mark as Read**: Transition from unread to read state
7. **Empty State**: "No notifications" message when list empty

#### 4.9 Comments Section (Comment List + Reply Form)

**States to Show**:
1. **Default**: Multiple comments displayed
2. **Reply Form Open**: Text input visible below comment
3. **Reply Field Focus**: Input focused, ready for typing
4. **Reply Form with Text**: Text entered, send button active
5. **Hover Reply Button**: Button highlighted
6. **Sending**: Loading spinner in button
7. **Nested Replies**: Sub-replies indented under parent comment

#### 4.10 File Upload Area (Drag & Drop + File List)

**States to Show**:
1. **Default**: Upload area with instructions
2. **Drag Over**: Highlighted, "Drop files here" message
3. **Files Selected**: File list showing with progress bars
4. **Upload Progress**: Progress bars filling
5. **Complete**: Success checkmarks on files
6. **Error**: Error messages, red styling
7. **Upload Again**: Clear and restart option

---

## 5. Templates Section

**Section Header**: "Templates - Page-Level Layouts"

**Description**: "Page wireframes and layouts that define structure and relationships between organisms."

### For Each Template:

#### 5.1 Blog Post Template

**Layout Sections** (show as blocks with labels):
1. **Header**: Navigation bar
2. **Hero Section**: Large image + headline
3. **Meta Information**: Author, date, reading time
4. **Content Area**: Post text with headings and paragraphs
5. **Sidebar**: Related posts, tags, sharing buttons
6. **Comments Section**: Comments and reply form
7. **Footer**: Footer navigation and copyright

**Responsiveness**:
- Desktop (hero full width, 2-column layout with sidebar)
- Tablet (hero full width, single column)
- Mobile (stacked sections, no sidebar)

#### 5.2 E-commerce Product Page Template

**Layout Sections**:
1. **Header**: Navigation with search and cart
2. **Breadcrumb**: Category > Subcategory > Product
3. **Product Image Gallery**: Main image + thumbnails
4. **Product Details**: Title, price, rating, description
5. **Options**: Size, color, quantity selectors
6. **Add to Cart Button**: Prominent CTA
7. **Related Products**: Carousel of similar items
8. **Reviews Section**: Customer reviews and ratings
9. **Footer**: Footer navigation

#### 5.3 Dashboard Template

**Layout Sections**:
1. **Header**: Logo, search, notifications, profile
2. **Sidebar**: Navigation menu
3. **Main Content**: Widget grid/cards
4. **Charts**: Data visualization sections
5. **Tables**: Data tables with sorting/filtering
6. **Footer**: Info/settings

**Show Multiple Responsive Breakpoints**:
- Desktop (sidebar + full content)
- Tablet (collapsed sidebar + adjusted cards)
- Mobile (sidebar hidden/drawer, stacked content)

#### 5.4 Landing Page Template

**Layout Sections**:
1. **Header**: Navigation with CTA
2. **Hero Section**: Large headline + subheading + CTA button
3. **Features Section**: 3-4 feature cards
4. **Testimonials Section**: Customer testimonials carousel
5. **Call-to-Action Section**: Final CTA block
6. **Footer**: Links, copyright, social icons

#### 5.5 Settings/Preferences Page Template

**Layout Sections**:
1. **Header**: Navigation
2. **Sidebar**: Settings categories (Profile, Privacy, Notifications, etc.)
3. **Main Content Area**: Settings for selected category
4. **Form Fields**: Toggles, dropdowns, text inputs
5. **Save/Cancel Buttons**: At bottom of form
6. **Success Message**: Confirmation after save
7. **Footer**: Help link, contact support

#### 5.6 Search Results Page Template

**Layout Sections**:
1. **Header**: Search bar with current query
2. **Filters Sidebar**: Filter options (category, price range, ratings, etc.)
3. **Results Count**: "Showing 1-20 of 1,234 results"
4. **Sort Options**: Dropdown to sort results
5. **Results Grid**: Cards for each result
6. **Pagination**: Previous/Next + page numbers
7. **Footer**: Footer navigation

#### 5.7 Form/Checkout Template

**Layout Sections**:
1. **Header**: Logo, progress stepper (Step 1, 2, 3)
2. **Form Section**: Multiple input fields grouped logically
3. **Sidebar**: Order summary or progress info
4. **Action Buttons**: Previous, Next/Continue, Save for later
5. **Progress Indicator**: Current step highlighted
6. **Error Messages**: If validation fails
7. **Success Screen**: After form completion

---

## 6. Pages Section

**Section Header**: "Pages - Complete Implementations"

**Description**: "Fully designed instances of templates with real content and all components in context."

### For Each Page Example:

#### 6.1 Home Page (Complete)

**Full-page mockup showing**:
- Hero section with real headline + CTA
- Feature cards with real descriptions
- Social proof section with real testimonials
- Footer with all links
- All in context with real colors, images, and typography

#### 6.2 Space Detail Page (Complete)

**Full-page mockup showing**:
- Space header with name, description, member count
- Navigation tabs (About, Resources, Subspaces, Templates)
- Content for active tab
- Sidebar with related spaces
- All organisms and molecules in actual use

#### 6.3 Post Detail Page (Complete)

**Full-page mockup showing**:
- Post header with title, author, date
- Post content with real text
- Responses section with actual response cards
- Comments section with real comments
- Related posts carousel
- All interactive elements shown

#### 6.4 Template Library Page (Complete)

**Full-page mockup showing**:
- Search bar with real placeholder
- Template pack cards grid
- Individual templates section
- Filters applied/visible
- All cards, buttons, and interactions

#### 6.5 User Profile Page (Complete)

**Full-page mockup showing**:
- Profile header with avatar, name, bio
- Tabs (Overview, Activity, Contributions, etc.)
- Content grid/list for active tab
- Sidebar with stats and actions
- Footer with additional info

#### 6.6 Settings Page (Complete)

**Full-page mockup showing**:
- Settings sidebar with all categories
- Form fields for selected category
- Sample data in fields
- Toggle switches, dropdowns, inputs
- Save button state variations

#### 6.7 Error Page 404 (Complete)

**Full-page mockup showing**:
- Header with logo
- Large "404" heading
- Friendly error message
- Illustration/image
- "Go Back" or "Go Home" button
- Footer

#### 6.8 Loading/Skeleton State Page (Complete)

**Full-page mockup showing**:
- Header with skeleton loaders
- Content area with skeleton cards/blocks
- Sidebar with skeleton elements
- Shows how page looks while loading

---

## Visual Design Requirements for the Entire Page

### Overall Layout:

**Page Structure**:
- Max-width: 1600px, centered on screen
- Left sidebar: 250px fixed, scrollable
- Main content: Remaining width, scrollable
- White/light background for content area
- Light gray background for sidebar

### Typography & Spacing:

- Page title (H1): 48px, bold, dark color, 24px bottom margin
- Section headers (H2): 32px, bold, dark color, 16px top margin, 12px bottom margin
- Component names (H3): 24px, semi-bold, dark color, 12px bottom margin
- Description text: Body Regular (16px), gray color, 16px bottom margin
- Consistent 24px padding around content sections

### Visual Hierarchy:

- Section headers visually distinct from component names
- State labels clearly labeled (e.g., "Default", "Hover", "Active", "Disabled")
- Color coding for states (if applicable):
  - Green for success/active states
  - Blue for default/hover states
  - Gray for disabled states
  - Red for error states

### Component Display:

- Each component variation on its own row or grid cell
- Clear spacing between variations (24px minimum)
- State variations grouped horizontally (in columns)
- Consistent sizing across similar components
- Subtle borders around each component (light gray, 1px)
- Component labels with code snippets (e.g., `<Button variant="primary" />`)

### Interactive Elements:

- Hover effects visible (shadows, color shifts shown visually)
- Focus states shown with focus indicators
- Transitions shown as multiple snapshots (before/after)
- Loading states shown with spinner graphics
- Animated states explained with arrows or sequential images

### Mobile Responsiveness:

- Show how components stack on mobile
- Show sidebar behavior (collapsed/drawer)
- Show card grid responsive behavior
- Show navigation menu collapse

### Accessibility Notes:

- Include contrast ratio information for each color
- Include ARIA labels for interactive components
- Include keyboard navigation flow
- Include alt-text structure for images

### Code References:

- Include CSS class names (e.g., `.btn-primary`, `.card-hover`)
- Include design token variable names (e.g., `--color-primary-blue`)
- Include component prop examples (e.g., `<Button variant="primary" size="large" />`)

---

## Output Specifications for Figma Make

**Expected Output**:
- One comprehensive page/artboard
- All sections organized hierarchically
- Proper naming conventions for all layers/components
- Color-coded by component type (atoms: blue label, molecules: green, etc.)
- Easily readable and printable (or exportable to PDF)
- Organized for easy reference and copy/paste to actual design file

**File Organization**:
- Create a "Design System" page
- Use frames/groups for each atomic level
- Use components for reusable elements
- Use variants for different states

---

## Notes for Figma Make Execution

1. **Comprehensive**: This design system should be complete enough to reference when building new pages or features
2. **Organized**: Clear hierarchy makes it easy to find specific components or states
3. **Visual**: Show all elements visually; avoid text-only documentation
4. **Interactive**: Document all component states and interactions
5. **Copyable**: Make it easy for designers to copy components to other design files
6. **Scalable**: Structure allows for future additions and updates to the design system
7. **Professional**: Polish the design to reflect the quality of the actual product

---
