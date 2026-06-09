// Contract: Add VC to community — preview step (US3) — plain TS props.
// New: src/crd/components/virtualContributor/community/VirtualContributorPreview.tsx
// Existing (reuse): VirtualContributorInviteDialog + VirtualContributorInviteConnector.
// Gap closed here = the preview step (no CRD equivalent of legacy PreviewContributorDialog),
// plus wiring the connector into the CRD community entry point.

export type VcPreviewHost = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  href?: string;
};

export type VcPreviewData = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  tags: string[];
  description: string;
  host?: VcPreviewHost;
};

export type VirtualContributorPreviewProps = {
  data?: VcPreviewData; // undefined while loading
  loading: boolean;
  onBack: () => void; // return to the list
  onAction: () => void; // add (account) or proceed to invite (library)
  actionLabel: string; // localized 'Add' | 'Invite'
};

// Additive extension to the EXISTING VirtualContributorInviteDialog props so selection
// can route through a preview before add/invite. Existing fields unchanged.
export type VirtualContributorInviteDialogPreviewExtension = {
  /** when provided, selecting a VC opens the preview view instead of jumping to add/message */
  previewSlot?: import('react').ReactNode;
  onPreview?: (id: string) => void;
};
