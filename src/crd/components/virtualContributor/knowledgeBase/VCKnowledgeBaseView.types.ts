import type { ReactNode } from 'react';

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

  /** Knowledge-base description (may contain markdown — rendered read-only). */
  description?: string;

  refresh: VcKnowledgeBaseRefresh;

  /** The callouts body — supplied by the integration layer (CRD CalloutListConnector). */
  calloutsSlot: ReactNode;

  /** True when the knowledge base has no callouts yet. */
  isEmpty: boolean;
};
