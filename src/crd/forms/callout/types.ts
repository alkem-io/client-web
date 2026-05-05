/**
 * Plain TypeScript types shared by CRD callout form components.
 *
 * These live in the CRD layer so the design-system components remain
 * self-contained — `@/main/*` consumers (hooks, mappers, connectors) import
 * from here, never the other way around.
 */

/**
 * Framing chip id. Maps to the server `CalloutFramingType` at submit time
 * via the calloutFormMapper. `'document'` is a disabled placeholder chip.
 */
export type FramingChip = 'none' | 'whiteboard' | 'memo' | 'document' | 'cta' | 'image' | 'poll';

/**
 * Response-type chip id. Maps to the server enum `CalloutContributionType`
 * (single value, not an array) at submit time via the calloutFormMapper.
 * `'document'` is a disabled placeholder chip.
 */
export type ResponseType = 'none' | 'link' | 'post' | 'memo' | 'whiteboard' | 'document';

export type AllowedActors = {
  members: boolean;
  admins: boolean;
};

export type ReferenceRow = {
  /** Server id, set only when the row comes from an existing reference (edit mode). Rows added by the user during editing keep `id: undefined`. */
  id?: string;
  title: string;
  url: string;
  description: string;
};

export type LinkRow = {
  title: string;
  url: string;
  description: string;
};

export type ContributionDefaults = {
  defaultDisplayName: string;
  postDescription: string;
  whiteboardContent: string;
};
