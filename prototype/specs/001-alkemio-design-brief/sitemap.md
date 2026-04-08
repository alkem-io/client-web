# Alkemio Platform Sitemap

## Navigation Hierarchy

### 1. Dashboard (Home)
**Path**: `/` (post-login landing page)  
**Access**: All authenticated users  
**Child Pages**:
- Explore All Spaces (spaces directory)
- Invitations page
- Tips & Tricks (modal)
- My Account (settings/profile)
- Create Space wizard
- Individual Space pages (via space cards or sidebar)

---

### 2. Space Home Page
**Path**: `/space/[space-name]`  
**Access**: Space members (role-based: Contributors, Facilitators)  
**Child Pages**:
- Community tab (members/contributors list)
- Subspaces tab (child spaces directory)
- Knowledge Base tab (documents/resources repository)
- Individual Subspace pages
- Calendar/Events page
- Post detail pages
- Channel detail pages

**Navigation Tabs**:
- HOME (activity feed) - current page
- COMMUNITY - members view
- SUBSPACES - child spaces
- KNOWLEDGE BASE - resources

---

### 3. Space: Community Tab
**Path**: `/space/[space-name]/community`  
**Access**: Space members (role-based)  
**Purpose**: View members, roles, and basic member management (as permitted).

---

### 4. Space: Subspaces Tab
**Path**: `/space/[space-name]/subspaces`  
**Access**: Space members (role-based)  
**Purpose**: Browse and discover subspaces; create subspaces (if permitted).

---

### 5. Space: Knowledge Base Tab
**Path**: `/space/[space-name]/knowledge-base`  
**Access**: Space members (role-based)  
**Purpose**: Find and manage space resources (documents/links/files) and structured content.

---

### 6. Subspace Page (Individual Subspace)
**Path**: `/{space-slug}/challenges/{subspace-slug}`  
**Access**: Subspace members (role-based)  
**Purpose**: Focused collaboration area for a specific subspace; typically includes its own posts/content, collections, and channel tabs.

---

### 7. Dialogs / Modals
- **Add Post**: Triggered from Space Home (and possibly Subspace pages)

---

### 8. User Profile
**Path**: `/user/[user-slug]`  
**Access**: All authenticated users (own profile); others depend on privacy/settings  
**Purpose**: User identity page and personal overview (bio, organizations, hosted resources, memberships).

---

### 9. Account / Settings
**Path**: `/user/[user-slug]/settings/account` (and related settings tabs)  
**Access**: All authenticated users  
**Purpose**: Tabbed account area containing profile/account/membership/org/notifications/settings.

**Tabs / Subpages**:
- My Profile: `/user/[user-slug]/settings/[tab]` (tab segment TBD)
- Account: `/user/[user-slug]/settings/account`
- Membership: `/user/[user-slug]/settings/membership` (expected)
- Organizations: `/user/[user-slug]/settings/organizations` (expected)
- Notifications: `/user/[user-slug]/settings/notifications` (expected)
- Settings: `/user/[user-slug]/settings/settings` (expected)

---

### 10. [Additional pages to be documented]

---

## Notes
- Lock icons indicate private spaces requiring access
- Activity View toggle changes dashboard layout between activity feeds and visual space gallery
- Top navigation includes search, notifications, and profile menu (profile, account, settings, sign out)
