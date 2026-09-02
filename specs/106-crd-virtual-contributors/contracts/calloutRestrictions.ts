// Contract: CRD callout restrictions (US7) — plain TS, no GraphQL types.
// New impl: src/main/crdPages/space/callout/calloutRestrictions.ts (integration layer).
//
// Mirrors the MUI `CalloutRestrictions` concept
// (src/domain/collaboration/callout/CalloutRestrictionsTypes.ts) but expressed in the CRD
// create-callout form's chip vocabulary, so a consumer can hide/limit features of the shared
// CalloutFormConnector. The restriction → presentational-prop derivation lives in the integration
// layer; the CRD components (FramingChipStrip, ResponseTypeChipStrip, ResponsePanel) receive only
// plain optional props (allow-lists / visibility flags) and stay business-logic-free.
//
// These are DESIGN CONTRACTS for /speckit.tasks — refine names during implementation.

import type { FramingChipId } from '@/crd/forms/callout/FramingChipStrip';
import type { ResponseTypeChipId } from '@/crd/forms/callout/ResponseTypeChipStrip';

export type CrdCalloutRestrictions = {
  /** When set, only these framing chips are offered. `[]` = None-only (the framing
   *  strip + editor are omitted entirely). `undefined` = all framing chips (default). */
  allowedFramingChips?: FramingChipId[];
  /** When set, only these response-type chips are offered. `undefined` = all (default). */
  allowedResponseChips?: ResponseTypeChipId[];
  /** Hide the framing-level "Allow comments" toggle and default `framingCommentsEnabled` off. */
  disableFramingComments?: boolean;
  /** Hide the contribution-level (Posts) comments toggle and default
   *  `contributionCommentsEnabled` off. */
  disableContributionComments?: boolean;
  /** Disable image / rich-media upload in the callout description editor (link-only). */
  disableRichMedia?: boolean;
};

// Preset applied to a Virtual Contributor's Knowledge Base "Add callout" flow.
// Behavioral parity with MUI `virtualContributorsCalloutRestrictions`, with framing forced to
// None-only and responses limited to Posts + Links & Files (the only callout features a VC's
// knowledge base supports).
export const VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS: CrdCalloutRestrictions = {
  allowedFramingChips: [], // None only
  allowedResponseChips: ['post', 'link'], // Posts + Links & Files
  disableFramingComments: true,
  disableContributionComments: true,
  disableRichMedia: true,
};
