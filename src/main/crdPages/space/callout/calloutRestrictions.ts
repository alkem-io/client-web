import type { FramingChipId } from '@/crd/forms/callout/FramingChipStrip';
import type { ResponseTypeChipId } from '@/crd/forms/callout/ResponseTypeChipStrip';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

/**
 * CRD equivalent of the MUI `CalloutRestrictions` concept
 * (`src/domain/collaboration/callout/CalloutRestrictionsTypes.ts`), expressed in
 * the CRD create-callout form's chip vocabulary. A consumer passes one of these
 * to `CalloutFormConnector` to hide or limit callout features; the restriction →
 * presentational-prop derivation lives in the connector, so the CRD components
 * (`FramingChipStrip`, `ResponseTypeChipStrip`, `ResponsePanel`) stay free of
 * business logic. When no descriptor is supplied the dialog behaves exactly as
 * before (full feature set — no regression).
 */
export type CrdCalloutRestrictions = {
  /** When set, only these framing chips are offered. `[]` = None-only (the framing
   *  strip + editor are omitted entirely). `undefined` = all framing chips. */
  allowedFramingChips?: FramingChipId[];
  /** When set, only these response-type chips are offered. `undefined` = all. */
  allowedResponseChips?: ResponseTypeChipId[];
  /** Hide the framing-level "Allow comments" toggle and default it off. */
  disableFramingComments?: boolean;
  /** Hide the contribution-level (Posts) comments toggle and default it off. */
  disableContributionComments?: boolean;
  /** Disable image / rich-media upload in the callout description editor (link-only). */
  disableRichMedia?: boolean;
};

/**
 * Preset applied to a Virtual Contributor's Knowledge Base "Add callout" flow.
 * Behavioral parity with MUI `virtualContributorsCalloutRestrictions`, with
 * framing forced to None-only and responses limited to Posts + Links & Files —
 * the only callout features a VC's knowledge base supports.
 */
export const VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS: CrdCalloutRestrictions = {
  allowedFramingChips: [], // None only
  allowedResponseChips: ['post', 'link'], // Posts + Links & Files
  disableFramingComments: true,
  disableContributionComments: true,
  disableRichMedia: true,
};

/**
 * Clamp externally-sourced **create-mode** form values (a picked template, or an
 * active flow state's default template) to a restriction descriptor, so a
 * template can never reintroduce a disallowed framing / response type or
 * re-enable comments. Mirrors the MUI seam
 * `mapCalloutTemplateToCalloutForm(template, calloutRestrictions)`.
 *
 * Edit-mode prefill of an existing callout MUST NOT be clamped — the stored
 * callout's own settings are authoritative there.
 */
export function clampFormValuesToRestrictions(
  values: Partial<CalloutFormValues>,
  restrictions?: CrdCalloutRestrictions
): Partial<CalloutFormValues> {
  if (!restrictions) return values;
  const next: Partial<CalloutFormValues> = { ...values };

  // Disallowed framing → None. (Stale poll/whiteboard/document fields are ignored
  // by the create mapper once `framingChip` is `'none'`.)
  if (
    restrictions.allowedFramingChips &&
    next.framingChip &&
    next.framingChip !== 'none' &&
    !restrictions.allowedFramingChips.includes(next.framingChip)
  ) {
    next.framingChip = 'none';
  }
  // Disallowed response type → None (the user must pick an allowed one).
  if (
    restrictions.allowedResponseChips &&
    next.responseType &&
    next.responseType !== 'none' &&
    !restrictions.allowedResponseChips.includes(next.responseType)
  ) {
    next.responseType = 'none';
  }
  if (restrictions.disableFramingComments) next.framingCommentsEnabled = false;
  if (restrictions.disableContributionComments) next.contributionCommentsEnabled = false;

  return next;
}
