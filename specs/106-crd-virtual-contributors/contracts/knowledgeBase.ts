// Contract: VC Knowledge Base page (US2) — CRD presentational props (plain TS, no GraphQL types)
// Layer 3 component: src/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView.tsx
// Mounted by src/main/crdPages/topLevelPages/vcPages/knowledgeBase/CrdVCKnowledgeBasePage.tsx
// at /vc/:nameId/knowledge-base (route already exists in CrdVCRoutes — repoints MUI → CRD).

import type { ReactNode } from 'react';
// MarkdownUploadProps = { onImageUpload?, iframeAllowedUrls?, onError? } from
// src/crd/forms/markdown/MarkdownEditor — wiring for the in-place description editor.
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';

export type VcKnowledgeBaseRefresh = {
  canRefresh: boolean; // Create privilege on the KB
  lastUpdatedValue?: string; // pre-formatted by the integration layer (undefined = never)
  onRefresh: () => void;
  refreshing: boolean;
};

export type VcKnowledgeBaseViewProps = {
  loading: boolean;
  // True when the viewer lacks read access to the knowledge base.
  noAccess: boolean;

  // identity header
  displayName: string;
  avatarUrl?: string;
  avatarColor: string; // pickColorFromId(vcId)

  // Description — MARKDOWN. Rendered read-only (MarkdownContent) for viewers;
  // edited in place (pencil → MarkdownEditor with Save/Cancel) when canEditDescription.
  // Saved via updateVirtualContributor(knowledgeBaseData.profile.description).
  description?: string;
  canEditDescription?: boolean; // KB Create privilege
  onSaveDescription?: (next: string) => Promise<boolean>; // resolves true on success
  descriptionMaxLength?: number; // LONG_MARKDOWN_TEXT_LENGTH
  descriptionUpload?: MarkdownUploadProps; // image-upload wiring for the editor

  refresh: VcKnowledgeBaseRefresh;

  // "Add callout" capability (US7 addendum) — Create privilege on the KB.
  canAddCallout?: boolean;
  onAddCallout?: () => void;

  // The callouts body is supplied as a slot — the CRD callouts feed
  // (CalloutListConnector) injected by the integration layer.
  calloutsSlot: ReactNode;

  // empty state when the knowledge base has no callouts yet
  isEmpty: boolean;
};
