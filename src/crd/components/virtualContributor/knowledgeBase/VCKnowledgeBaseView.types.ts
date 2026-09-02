import type { ReactNode } from 'react';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';

export type VcKnowledgeBaseRefresh = {
  /** Whether the viewer may refresh the Body of Knowledge (admin/Create privilege). */
  canRefresh: boolean;
  /** Pre-formatted last-ingestion date (formatted by the integration layer),
   *  or undefined when it has never run. */
  lastUpdatedValue?: string;
  onRefresh: () => void;
  refreshing: boolean;
};

export type VcKnowledgeBaseViewProps = {
  loading: boolean;
  /** True when the viewer lacks read access to the knowledge base. */
  noAccess: boolean;

  // identity header
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;

  /** Knowledge-base description (markdown). Rendered read-only for viewers; edited
   *  in place (pencil → markdown editor) when `canEditDescription`. */
  description?: string;
  /** Whether the viewer may edit the description (KB Create privilege). */
  canEditDescription?: boolean;
  /** Persists an edited description. Resolves true on success, false on failure
   *  (wired by the integration layer). Required whenever `canEditDescription`. */
  onSaveDescription?: (next: string) => Promise<boolean>;
  /** Max length enforced by the description markdown editor. */
  descriptionMaxLength?: number;
  /** Image-upload wiring for the description editor (from the integration layer). */
  descriptionUpload?: MarkdownUploadProps;

  refresh: VcKnowledgeBaseRefresh;

  /** Whether the viewer may add a callout to the knowledge base (Create privilege). */
  canAddCallout?: boolean;
  /** Opens the create-callout dialog (wired by the integration layer). */
  onAddCallout?: () => void;

  /** The callouts body — supplied by the integration layer (CRD CalloutListConnector). */
  calloutsSlot: ReactNode;

  /** True when the knowledge base has no callouts yet. */
  isEmpty: boolean;
};
