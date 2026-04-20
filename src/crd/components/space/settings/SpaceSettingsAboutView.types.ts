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

export type FieldAutosaveState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

export type AboutFieldKey =
  | 'name'
  | 'tagline'
  | 'location'
  | 'avatar'
  | 'pageBanner'
  | 'cardBanner'
  | 'tags'
  | 'references'
  | 'what'
  | 'why'
  | 'who';

export type AboutAutosaveStateMap = Partial<Record<AboutFieldKey, FieldAutosaveState>>;
