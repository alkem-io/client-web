// Contract: VC Knowledge Base page (US2) — CRD presentational props (plain TS, no GraphQL types)
// Layer 3 component: src/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView.tsx
// Mounted by src/main/crdPages/topLevelPages/vcPages/knowledgeBase/CrdVCKnowledgeBasePage.tsx
// at /vc/:nameId/knowledge-base (route already exists in CrdVCRoutes — repoint from MUI to CRD).

import type { ReactNode } from 'react';

export type VcKnowledgeBaseRefresh = {
  canRefresh: boolean; // Create privilege on the KB
  lastUpdatedIso?: string;
  onRefresh: () => void;
  refreshing: boolean;
};

export type VcKnowledgeBaseViewProps = {
  loading: boolean;

  // identity header
  displayName: string;
  avatarUrl?: string;
  avatarColor: string; // pickColorFromId(vcId)

  // editable description (only if canEditDescription)
  description: string;
  canEditDescription: boolean;
  onSaveDescription: (next: string) => void;
  descriptionSaving: boolean;

  refresh: VcKnowledgeBaseRefresh;

  // The callouts body is supplied as a slot — reuses the shared CalloutsGroupView
  // (kept until the callouts subsystem is itself CRD). The CRD page only owns chrome.
  calloutsSlot: ReactNode;

  // empty state when the knowledge base has no callouts yet
  isEmpty: boolean;
  emptyStateTitle: string;
  emptyStateDescription: string;
};
