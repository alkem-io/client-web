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
export type FramingChip =
  | 'none'
  | 'whiteboard'
  | 'memo'
  | 'document'
  | 'cta'
  | 'image'
  | 'poll'
  | 'contributors'
  | 'spaces';

/**
 * Contributor-collection callout config (feature 008). Carried in the callout
 * form values and serialized into `settings.framing.contributors`. Plain TS —
 * the three contributor types are a fixed string union mirroring the server
 * `ActorType` enum, kept design-system-agnostic here.
 */
export type ContributorTypeId = 'user' | 'organization' | 'virtualContributor';
export type ContributorViewId = 'list' | 'map';

/**
 * Admin-fixed initial map view. Plain TS — mirrors the server
 * `CalloutContributorsMapView` shape (three floats). `null` means automatic
 * framing (fit to plotted contributor bounds; Europe fallback when empty).
 */
export type ContributorMapFixedViewConfig = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export type ContributorCollectionConfig = {
  /** Selected contributor types (>=1; save is blocked on zero). */
  types: ContributorTypeId[];
  /** Default type shown first; must be one of `types` (auto-heals to the first selected). */
  defaultType: ContributorTypeId;
  /** Default display; auto-heals to `list` when the selection is VC-only. */
  defaultView: ContributorViewId;
  /**
   * Admin-fixed initial map view. null = automatic framing.
   * The heal functions never touch this field (isolated from type-healing).
   */
  mapView: ContributorMapFixedViewConfig | null;
};

/**
 * Response-type chip id. Maps to the server enum `CalloutContributionType`
 * (single value, not an array) at submit time via the calloutFormMapper.
 * `'document'` maps to `CalloutContributionType.CollaboraDocument` — an
 * upload-only response type (no blank-create path; story #10083).
 */
export type ResponseType = 'none' | 'link' | 'post' | 'memo' | 'whiteboard' | 'document';

export type AllowedActors = {
  members: boolean;
  admins: boolean;
};

export type ReferenceRow = {
  /** Server id, set only when the row comes from an existing reference (edit mode). Rows added by the user during editing keep `id: undefined`. */
  id?: string;
  /** Field names mirror the GraphQL `Reference` type (`name` / `uri`) — the canonical shape shared with `@/crd/forms/references/ReferencesEditor`. */
  name: string;
  uri: string;
  description?: string;
};

export type LinkRow = {
  title: string;
  url: string;
  description: string;
};

export type ContributionDefaults = {
  defaultDisplayName: string;
  postDescription: string;
  /** Whether the persisted defaults currently contain a canonical whiteboard snapshot. */
  whiteboardContentAvailable: boolean;
  /** A selected template whiteboard to copy server-side when the callout is saved. */
  sourceWhiteboardId?: string;
  /** Source callout used when applying or duplicating a callout template's internal default. */
  sourceCalloutId?: string;
  /** Explicit removal; omission preserves an existing default on update. */
  clearWhiteboardContent?: boolean;
};
