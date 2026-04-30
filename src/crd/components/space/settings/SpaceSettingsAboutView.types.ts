/**
 * Public types for SpaceSettingsAboutView. Plain TypeScript — no GraphQL
 * types, no Apollo imports. Consumed by the About mapper + data hook in
 * src/main/crdPages/topLevelPages/spaceSettings/about/.
 */

export type AboutVisual = {
  id: string;
  uri: string | null;
  altText: string | null;
};

export type AboutReference = {
  id: string;
  title: string;
  uri: string;
  description: string;
};

export type AboutFormValues = {
  name: string;
  tagline: string;
  country: string;
  city: string;
  avatar: AboutVisual;
  pageBanner: AboutVisual;
  cardBanner: AboutVisual;
  tagsetId: string;
  tags: string[];
  profileId: string;
  references: AboutReference[];
  what: string;
  why: string;
  who: string;
};

/**
 * Space hierarchy level. L0 is the root space; L1/L2 are subspaces. Subspaces
 * have no page banner — only avatar + card banner are editable (mirrors the
 * legacy MUI `EditVisualsView` filter on `space.level`).
 */
export type SpaceSettingsLevel = 'L0' | 'L1' | 'L2';

export type SpaceCardPreview = {
  name: string;
  tagline: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  tags: string[];
  color: string;
  initials: string;
  href: string;
  /** The "What" description — shown in the About preview's WHAT section. */
  what?: string;
  /** For future Explore card: leads, member count, etc. */
  leads?: ReadonlyArray<{ name: string; avatarUrl: string; type: 'person' | 'org' }>;
  memberCount?: number;
  isPrivate?: boolean;
};

/**
 * Logical "sections" inside About that can be saved independently. Each maps
 * to one visible field group in the UI and to one save handler in the hook.
 */
export type AboutSectionKey = 'name' | 'tagline' | 'location' | 'tags' | 'references' | 'what' | 'why' | 'who';

export type AboutSectionSaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };
