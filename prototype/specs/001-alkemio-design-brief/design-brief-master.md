# Alkemio Platform — Master Design Brief

**Purpose**: Comprehensive design brief for redesigning the Alkemio platform UI. This brief is intended as a prompt for Figma Make or similar AI design tools to generate a cohesive, modern redesign.

**Date**: January 22, 2026  
**Platform**: Alkemio (https://alkem.io)

---

## 1. Platform Overview

**What is Alkemio?**

Alkemio is a collaborative innovation platform that enables organizations and communities to work together on shared challenges. It combines social collaboration, structured decision-making, and knowledge management into a unified workspace.

**Core Metaphor**

- **Spaces**: Top-level collaboration containers for organizations or initiatives
- **Subspaces** (Challenges): Focused working groups within a space for specific topics or workstreams
- **Posts & Collections**: Content types (posts with embedded whiteboards, collections of links/memos/posts/whiteboards)
- **Members & Roles**: Contributors, Facilitators (space admins), Portfolio Owners (org admins)

---

## 2. Target Personas

### Contributor (Active Stakeholder)
- **Goal**: Participate in collaborative work, share ideas, and respond to calls to action
- **Needs**: Easy discovery of relevant spaces/subspaces, clear posting/response mechanisms, ability to track their contributions
- **Pain Points**: Too many notifications, hard to find relevant content, unclear role/permissions in spaces

### Facilitator (Space Admin)
- **Goal**: Guide collaboration, curate content, manage permissions and structure
- **Needs**: Controls for moderation, visibility into space activity, ability to configure templates and response options, member management
- **Pain Points**: Complex permission structures, difficulty managing large teams, lack of visibility into who's active

### Portfolio Owner (Organization Admin)
- **Goal**: Oversee multiple spaces, maintain organizational identity, ensure alignment across initiatives
- **Needs**: Organization-wide dashboard, visibility into all spaces, member and resource management, branded presence
- **Pain Points**: Scattered information, hard to see portfolio-wide progress, tedious org setup

---

## 3. Current User Experience Highlights

### Primary Workflows

1. **Explore & Enter a Space**
   - User sees dashboard with recent spaces + activity feeds
   - Clicks a space card → enters Space Home (activity view with tabs: HOME, COMMUNITY, SUBSPACES, KNOWLEDGE BASE)

2. **Collaborate in a Subspace**
   - User navigates to a subspace from the Subspaces tab or direct link
   - Views posts, whiteboards, collections, and channel-specific content
   - Creates posts using a rich modal (Add Post) with templates, response options, and content types

3. **Manage Account & Preferences**
   - User accesses profile menu → My Profile / My Account (settings tabs)
   - Edits profile, manages memberships, organizations, and notification preferences
   - Configures account-wide settings

### Key Content Types

- **Posts**: Text-based announcements, discussions, calls-to-action
- **Whiteboards**: Embedded visual collaboration (sketch, idea mapping, notes)
- **Collections**: Curated sets of links, files, posts, memos, or whiteboards
- **Comments**: Discussion threads on posts (role-gated by Facilitators)
- **Memos**: Text notes submitted as responses
- **Virtual Contributors**: AI/bot users that can participate in spaces

---

## 4. Visual & Interaction Principles

### Design Language
- **Primary Colors**: Teal/cyan accents, dark navy/slate for text and UI
- **Illustrative Background**: Soft, collaborative illustration (people, connections, innovation themes) used as page header backdrop
- **Photography**: Use high-quality photography from Unsplash throughout the platform:
  - Space/subspace cards: Diverse, relevant imagery (collaboration, innovation, teamwork themes)
  - Page banners and headers: Full-width, inspiring imagery with semi-transparent overlays for text readability
  - Profile pages: Professional imagery related to work, innovation, and teamwork
  - Search terms for Unsplash: "collaboration", "innovation", "teamwork", "workshop", "design thinking", "creative team", "office", "workspace", "brainstorming"
- **Left Sidebar**: Persistent navigation and quick access menu (collapsible)
- **Modals & Dialogs**: Large, centered, white background with clear action buttons
- **Cards**: Space/resource cards show preview image (from Unsplash), name, description, metadata badges (lock = private, tier label = plan)

### Layout Patterns

- **Header**: Top navigation bar (search, notifications, profile menu)
- **Left Sidebar**: Quick menu (Invitations, Tips & Tricks, My Account, Create Space) + persistent resource list
- **Main Content Area**: Primary workflow content (activity feeds, space home, settings tabs)
- **Right Sidebar** (if present): Context panels, related resources, or secondary navigation
- **Footer**: Platform footer (Terms, Privacy, Security, Alkemio branding, language selector)

### Interaction Conventions

- **Hover Effects**: Cards and buttons show subtle shadow/lift on hover
- **Rich Text Editors**: Posts and profile bio use markdown-style editor with formatting toolbar
- **Toggles**: Binary settings (notifications, permissions) use ON/OFF toggles (not checkboxes)
- **Dropdowns & Overflow Menus**: 3-dot menus for per-item actions (overflow, delete, share, settings)
- **Form Validation**: Inline error messages and success confirmations
- **Floating Action Buttons**: **+** buttons in bottom-right or card-embedded for quick create actions
- **Tabs**: Horizontal pill-style tabs for primary navigation within a context (e.g., Space tabs, Settings tabs)

---

## 5. Platform-Wide Requirements

### Accessibility
- WCAG AA compliance (minimum)
- Support for keyboard navigation
- Readable contrast ratios (text on background)
- Semantic HTML structure
- Screen reader support

### Responsive Design
- Mobile-first approach (phone, tablet, desktop breakpoints)
- Left sidebar collapses to hamburger menu on mobile
- Cards and grids adapt to screen size
- Touch-friendly button/tap targets (min 44x44px)

### Performance
- Fast page transitions (smooth, not jarring)
- Lazy load images and content
- Efficient modals (no page reload on action)
- Skeleton loaders for async content

### Branding & Consistency
- Alkemio logo and color palette applied throughout
- Consistent typography (font family, sizes, weights)
- Consistent spacing and alignment (8px or 12px grid)
- Consistent icon set (SVG or icon font)

---

## 6. Key Differentiators

1. **Structured Collaboration**: Posts with templates and curated response options (not just comments)
2. **Whiteboards as First-Class Content**: Embedded visual collaboration without leaving the platform
3. **Role-Based Visibility**: Content and actions visible based on member role and permissions
4. **Flexible Content Types**: Collections, memos, whiteboards, links — multiple ways to capture insights
5. **Organization Layer**: Portfolio owners can manage multiple spaces under one org identity

---

## 7. Success Criteria for Redesign

- **User Discoverability**: New users can find and enter a space in under 2 minutes
- **Content Creation**: Creating and posting content takes < 3 clicks
- **Navigation Clarity**: Users understand where they are and how to return to previous context
- **Mobile Usability**: All primary workflows are functional on mobile (phone/tablet)
- **Consistency**: Design language is consistent across all pages and states
- **Accessibility**: Page passes automated accessibility checks; keyboard navigation works
- **Performance**: Page load time < 3 seconds; interactions feel instant

---

## 8. Page Inventory Summary

**Total Pages Documented**: 13

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | Dashboard (Home) | `/` | Central hub; space discovery + activity feeds |
| 2 | Space Home | `/space/[space-slug]` | Space activity + navigation (HOME/COMMUNITY/SUBSPACES/KNOWLEDGE BASE tabs) |
| 3 | Space: Community Tab | `/space/[space-slug]/community` | Member list and roles |
| 4 | Space: Subspaces Tab | `/space/[space-slug]/subspaces` | Child spaces directory |
| 5 | Space: Knowledge Base Tab | `/space/[space-slug]/knowledge-base` | Documents/resources repository |
| 6 | Add Post Modal | (triggered from Space/Subspace) | Post creation dialog with templates + response options |
| 7 | Subspace Page | `/{space-slug}/challenges/{subspace-slug}` | Subspace home + channel tabs + activity |
| 8 | User Profile | `/user/[user-slug]` | Public profile + bio + hosted resources + memberships |
| 9 | My Account: Account Tab | `/user/[user-slug]/settings/account` | Hosted spaces/resources management |
| 10 | My Account: My Profile Tab | `/user/[user-slug]/settings/profile` | Edit profile identity + avatar + bio + links |
| 11 | My Account: Membership Tab | `/user/[user-slug]/settings/membership` | View/manage memberships |
| 12 | My Account: Organizations Tab | `/user/[user-slug]/settings/organizations` | Manage org affiliations |
| 13 | My Account: Notifications Tab | `/user/[user-slug]/settings/notifications` | Notification preference toggles (in-app/email) |

---

## 9. Redesign Scope & Constraints

### In Scope
- All 13 documented pages and key workflows
- Responsive design (mobile, tablet, desktop)
- Consistent visual language and branding
- Accessibility improvements
- Modern UI patterns (cards, tabs, modals, forms)

### Out of Scope (for now)
- Settings and Security tabs (Pages 14–15; can be documented separately)
- Advanced admin panels (org setup, permission matrices, billing)
- Real-time collaboration UI (whiteboards are external embeds)
- Mobile-only features

### Key Assumptions
- Logged-in user state (no redesign of login/signup flows)
- Dark sidebar, light main content area (current theme)
- Teal/cyan as primary accent color
- Illustration-based header backdrops for visual appeal
- Posts and collections are primary content types (not channels or threads)

---

## 10. Next Steps

1. **Per-Page Design Briefs**: Review individual page briefs (Pages 1–13) for specific layouts, components, and interactions
2. **Visual Mockups**: Generate high-fidelity mockups in Figma based on master + per-page briefs
3. **Interaction Specs**: Document animations, transitions, and dynamic behaviors
4. **Design System**: Define reusable components (buttons, cards, forms, modals) and establish design tokens (colors, typography, spacing)
5. **Prototype & Test**: Build clickable prototype and gather user feedback from personas

---

## Design Brief Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Jan 22, 2026 | Design Spec Kit | Initial master brief |

