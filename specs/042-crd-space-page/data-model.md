# Data Model: CRD Space L0 Page

**Branch**: `042-crd-space-page` | **Date**: 2026-04-07

These are the CRD component prop types — plain TypeScript, never GraphQL generated types. Data mappers in the integration layer transform GraphQL responses into these shapes.

## Page Shell

### SpaceBannerData
```typescript
type SpaceBannerData = {
  title: string;
  tagline?: string;
  bannerUrl?: string;         // Falls back to default space visual
  isHomeSpace: boolean;
  homeSpaceSettingsHref?: string;
};
```

### SpaceTabDefinition
```typescript
type SpaceTabDefinition = {
  index: number;              // 0-based position
  label: string;              // From Innovation Flow displayName or translated default
  description?: string;       // From Innovation Flow state description
  icon: ReactNode;            // lucide-react icon
  isCustom: boolean;          // true for positions >= 4
};
```

### SpaceVisibilityData
```typescript
type SpaceVisibilityStatus = 'active' | 'archived' | 'demo' | 'inactive';

type SpaceVisibilityData = {
  status: SpaceVisibilityStatus;
  contactHref?: string;       // For archived notice
};
```

### SpaceTabActionConfig
```typescript
type SpaceTabActionConfig = {
  showActivity: boolean;
  showVideoCall: boolean;
  showShare: boolean;
  showSettings: boolean;
  shareUrl: string;
  settingsHref?: string;
};
```

## Dashboard Tab

### SpaceWelcomeData
```typescript
type SpaceWelcomeData = {
  description: string;        // Tab description (Innovation Flow state)
  leads: SpaceLeadData[];     // Up to 2 users + 2 orgs
  editHref?: string;          // Admin edit link
};

type SpaceLeadData = {
  name: string;
  avatarUrl?: string;
  type: 'person' | 'organization';
  location?: string;          // "City, Country"
  href: string;
};
```

### SpaceDashboardNavItem
```typescript
type SpaceDashboardNavItem = {
  name: string;
  href: string;
  level: number;              // Nesting depth
};
```

### CalendarEventData
```typescript
type CalendarEventData = {
  id: string;
  title: string;
  startDate: string;          // ISO date
  durationDays?: number;
  durationMinutes?: number;
  isWholeDay: boolean;
};
```

## Community Tab

### SpaceMemberData
```typescript
type SpaceMemberData = {
  id: string;
  name: string;
  avatarUrl?: string;
  type: 'user' | 'organization';
  location?: string;
  tagline?: string;
  tags: string[];
  href: string;
};
```

### VirtualContributorData
```typescript
type VirtualContributorData = {
  id: string;
  name: string;
  avatarUrl?: string;
  href: string;
};
```

## Subspaces Tab

### SubspaceCardData
```typescript
type SubspaceCardData = {
  id: string;
  name: string;
  tagline?: string;
  bannerUrl?: string;
  tags: string[];
  isPrivate: boolean;
  isMember: boolean;
  isPinned: boolean;
  leads: SpaceLeadData[];
  href: string;
};
```

## Callout System

### Data Loading: Light vs Detail

Callout data is loaded in two phases. CRD components receive `PostCardData` which is the same type regardless of source — the integration layer handles the mapping:

| Field | Light query | Detail query |
|-------|-----------|-------------|
| `id`, `sortOrder`, `activity` | ✓ | ✓ |
| `framing.profile.displayName` | ✓ | ✓ |
| `framing.type` | ✓ | ✓ |
| `framing.profile.description` | ✗ | ✓ |
| `framing.profile.tags`, `references` | ✗ | ✓ |
| Whiteboard/Memo/Link/Media/Poll content | ✗ | ✓ |
| `comments`, `contributions` | ✗ | ✓ |
| `createdBy`, `publishedDate` | ✗ | ✓ |

- **Light mapper** (`mapCalloutLightToPostCard`): produces a `PostCardData` with title and type only — `snippet` is `undefined`
- **Detail mapper** (`mapCalloutDetailsToPostCard`): produces a complete `PostCardData` with description, content previews, author, comment count
- **Source types**: `CalloutModelLightExtended` (light, from `useCalloutsSet`) and `CalloutDetailsModelExtended` (detail, from `useCalloutDetails`)

### CalloutBlockData
```typescript
type CalloutBlockData = {
  id: string;
  title: string;
  description?: string;       // Raw markdown — rendered via react-markdown in CRD
  tags: string[];
  references: CalloutReference[];
  framingType: 'none' | 'memo' | 'whiteboard' | 'link' | 'media' | 'poll';
  framing: CalloutFramingData;
  visibility: 'draft' | 'published';
  sortOrder: number;
  author?: { name: string; avatarUrl?: string };
  publishedDate?: string;
  contributionCount: number;
  allowedContributionTypes: ContributionType[];
  commentsEnabled: boolean;
  // Permissions
  editable: boolean;
  movable: boolean;
  canSaveAsTemplate: boolean;
};

type CalloutReference = {
  name: string;
  uri: string;
  description?: string;
};

type ContributionType = 'post' | 'memo' | 'whiteboard' | 'link';
```

### CalloutFramingData (union)
```typescript
type CalloutFramingData =
  | { type: 'none' }
  | { type: 'memo'; markdownContent: string; onExpand?: () => void }
  | { type: 'whiteboard'; previewUrl?: string; onOpen: () => void }
  | { type: 'link'; url: string; displayName: string; isExternal: boolean }
  | { type: 'media'; images: MediaImage[]; canEdit: boolean; onAddImage?: () => void }
  | { type: 'poll'; question: string; options: PollOption[]; canVote: boolean; onVote: (optionId: string) => void };

type MediaImage = {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
};

type PollOption = {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  isSelected: boolean;        // Current user's vote
};
```

### ContributionCardData
```typescript
type ContributionCardData = {
  id: string;
  type: ContributionType;
  title: string;
  author?: { name: string; avatarUrl?: string };
  createdDate?: string;
  href?: string;
  // Type-specific
  description?: string;       // Posts/memos
  commentCount?: number;      // Posts
  tags?: string[];
  previewUrl?: string;        // Whiteboards
  htmlContent?: string;       // Memos (preview)
  linkUrl?: string;           // Links
  linkDescription?: string;   // Links
};
```

### PollOptionValue (form-level — used in CRD form components)
```typescript
// Exported from src/crd/forms/callout/PollOptionsEditor.tsx
// During creation, id is undefined; during editing, it's the server-assigned UUID.
// This provides stable React keys for editing existing polls.

type PollOptionValue = {
  id?: string;               // Server UUID when editing; undefined for new options
  text: string;
};

// Constants (also exported from PollOptionsEditor):
// MIN_POLL_OPTIONS = 2
// MAX_POLL_OPTIONS = 10
```

### CalloutFormValues (integration layer — NOT in src/crd/)
```typescript
// These types live in the integration layer, not in CRD components.
// CRD form components receive individual field values via props.

type CalloutFormFieldProps = {
  title: { value: string; onChange: (v: string) => void; error?: string };
  description: { value: string; onChange: (v: string) => void; error?: string };
  tags: { value: string[]; onChange: (v: string[]) => void };
  framingType: { value: string; onChange: (v: string) => void; disabled: boolean };
  visibility: { value: 'draft' | 'published'; onChange: (v: string) => void };
  pollOptions: { value: PollOptionValue[]; onChange: (v: PollOptionValue[]) => void };
  // ... per-field binding pattern
};
```

### CommentData
```typescript
type CommentData = {
  id: string;
  author: { name: string; avatarUrl?: string };
  content: string;
  timestamp: string;          // ISO date
  parentId?: string;          // For threaded replies
};
```

### TemplateCardData
```typescript
type TemplateCardData = {
  id: string;
  name: string;
  description?: string;
  framingType: string;
};
```

## About Page

### SpaceAboutData
```typescript
type SpaceAboutData = {
  name: string;
  tagline?: string;
  description?: string;       // Raw markdown
  location?: string;
  metrics: { name: string; value: string }[];
  who?: string;               // Raw markdown
  why?: string;               // Raw markdown
  provider?: SpaceLeadData;
  leadUsers: SpaceLeadData[];
  leadOrganizations: SpaceLeadData[];
  guidelines?: string;        // Raw markdown
  references: CalloutReference[];
};
```
