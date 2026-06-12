// Contract: Virtual Contributor badge (US5) — plain TS props.
// New: src/crd/components/common/VirtualContributorBadge.tsx
// Rendered on CRD contributor surfaces (e.g. src/crd/components/comment/CommentItem.tsx)
// when the author is a VC. Does NOT reuse the MUI VirtualContributorLabel chip.
//
// Watch-item (Constitution III): the CRD comment author payload must expose whether the
// author is a VC (type / isVirtualContributor). If the field is missing, add it to the
// comment/message GraphQL fragment, run `pnpm codegen`, and commit generated outputs in-PR.

export type VirtualContributorBadgeProps = {
  /** defaults to localized "Virtual Contributor" — term stays English per the glossary */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
};
