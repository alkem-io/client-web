/**
 * Pure mapping helpers for **Callout templates** (T025) — bridging the CRD callout-form value shape
 * (`CalloutFormValues`, from `useCrdCalloutForm`) and the GraphQL inputs the template mutations need:
 *
 *  - `calloutFormValuesToCreateCalloutInput` → `CreateCalloutInput` (for `createTemplate({ calloutData })`)
 *  - `calloutFormValuesToUpdateCalloutEntityInput` → `UpdateCalloutEntityInput`
 *    (for `updateCalloutTemplate({ calloutData })`) — unlike the *live*-callout update mapper this one
 *    DOES send the whiteboard / memo / Collabora body, because a template stores that content statically
 *  - `calloutTemplateContentToFormValues` ← the loaded `CalloutTemplateContentFragment` (Duplicate / Edit)
 *
 * No Apollo, no side effects.
 */

import {
  CalloutContributionType,
  CalloutFramingType,
  type CalloutTemplateContentFragment,
  CalloutVisibility,
  type CreateCalloutInput,
  PollResultsDetail,
  PollResultsVisibility,
  type UpdateCalloutEntityInput,
} from '@/core/apollo/generated/graphql-schema';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import {
  allowedActorsFromServer,
  framingChipToServer,
  mapFormToCalloutCreationInput,
  mapFormToCalloutUpdateInput,
} from '@/main/crdPages/space/callout/calloutFormMapper';
import type { CalloutFormValues, FramingChip, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

export type CalloutTemplateMapperFallbacks = {
  /** i18n-resolved fallback used when a whiteboard / memo framing has no title. */
  whiteboardFallbackDisplayName: string;
  /** i18n-resolved fallback used when a Collabora-document framing has no title. */
  collaboraFallbackDisplayName: string;
};

/**
 * `CalloutFormValues` → `CreateCalloutInput` for `createTemplate({ ..., calloutData })`.
 * Reuses the live-callout creation mapper (its output is, by construction, a `CreateCalloutOnCalloutsSetInput`
 * minus `calloutsSetID` — i.e. structurally a `CreateCalloutInput`); `visibility` is irrelevant for a
 * template (the create-template mutation ignores `settings.visibility`) so we pass a fixed value.
 */
export function calloutFormValuesToCreateCalloutInput(
  values: CalloutFormValues,
  fallbacks: CalloutTemplateMapperFallbacks
): CreateCalloutInput {
  const { input } = mapFormToCalloutCreationInput(values, {
    visibility: CalloutVisibility.Published,
    whiteboardFallbackDisplayName: fallbacks.whiteboardFallbackDisplayName,
    collaboraFallbackDisplayName: fallbacks.collaboraFallbackDisplayName,
  });
  // Pick only the fields `CreateCalloutInput` accepts (drops `sendNotification` / `classification`,
  // which are concrete-callout concerns and meaningless on a template).
  return {
    framing: input.framing,
    settings: input.settings,
    contributionDefaults: input.contributionDefaults,
  };
}

/**
 * `CalloutFormValues` → `UpdateCalloutEntityInput` for `updateCalloutTemplate({ calloutData })`.
 * Starts from the live-callout update mapper (handles profile / references / tagsets / link / poll-title /
 * settings / contributionDefaults) then layers on the static body fields a *template* keeps —
 * whiteboard content + preview settings, memo content — which the live mapper deliberately omits
 * (a live callout edits those through its collaborative dialogs; a template stores them directly).
 */
export function calloutFormValuesToUpdateCalloutEntityInput(
  values: CalloutFormValues,
  calloutId: string
): UpdateCalloutEntityInput {
  const { input } = mapFormToCalloutUpdateInput(values, { calloutId });
  const framingType = framingChipToServer(values.framingChip);
  if (input.framing && framingType === CalloutFramingType.Whiteboard) {
    input.framing.whiteboardContent = values.whiteboardContent;
    input.framing.whiteboardPreviewSettings = values.whiteboardPreviewSettings;
  }
  if (input.framing && framingType === CalloutFramingType.Memo && values.memoMarkdown.trim()) {
    input.framing.memoContent = values.memoMarkdown;
  }
  return input;
}

// ---------------------------------------------------------------------------
// Loaded template content → editable form values (Duplicate / Edit)
// ---------------------------------------------------------------------------

const FRAMING_TYPE_TO_CHIP: Record<CalloutFramingType, FramingChip> = {
  [CalloutFramingType.None]: 'none',
  [CalloutFramingType.Whiteboard]: 'whiteboard',
  [CalloutFramingType.Memo]: 'memo',
  [CalloutFramingType.CollaboraDocument]: 'document',
  [CalloutFramingType.Link]: 'cta',
  [CalloutFramingType.MediaGallery]: 'image',
  [CalloutFramingType.Poll]: 'poll',
};

const CONTRIBUTION_TYPE_TO_RESPONSE: Record<CalloutContributionType, ResponseType | 'none'> = {
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Memo]: 'memo',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
  [CalloutContributionType.CollaboraDocument]: 'none',
};

type FramingProfile = CalloutTemplateContentFragment['framing']['profile'];

const findDefaultTagset = (tagsets: FramingProfile['tagsets']) => {
  if (!tagsets || tagsets.length === 0) return undefined;
  return tagsets.find(ts => ts.name === 'default') ?? tagsets[0];
};

/**
 * `CalloutTemplateContentFragment` → CRD callout-form values. Unlike the live-callout edit prefill,
 * the whiteboard / memo body IS copied across (a template stores it statically). Media-gallery
 * framing carries only the existing visuals' URIs (no re-uploadable `File`s) — duplicating an
 * image-framing template preserves the gallery slot but not new uploads (TODO 098).
 */
export function calloutTemplateContentToFormValues(
  callout: CalloutTemplateContentFragment
): Partial<CalloutFormValues> {
  const { framing, settings, contributionDefaults } = callout;
  const framingChip = FRAMING_TYPE_TO_CHIP[framing.type];
  const collaboraDocumentType = framing.collaboraDocument?.documentType;
  // `responseType` is the user's chosen contribution type — it must come from
  // `allowedTypes` ALONE (spec D14, 2026-05-18). `enabled` / `canAddContributions`
  // are an orthogonal "who can add right now?" concern that maps to the actor
  // switches, NOT to the chip strip. AND-ing the chip on `enabled` here would
  // silently reset it to "None" on every edit-dialog open whenever the toggles
  // are off, and the update mapper would then commit that loss back to the
  // server. Mirrors `mapCalloutDetailsToFormValues.ts:74-84`.
  const firstAllowedType = settings.contribution.allowedTypes[0];
  const responseType: ResponseType = firstAllowedType
    ? (CONTRIBUTION_TYPE_TO_RESPONSE[firstAllowedType] ?? 'none')
    : 'none';

  return {
    title: framing.profile.displayName,
    description: framing.profile.description ?? '',
    tags: findDefaultTagset(framing.profile.tagsets)?.tags ?? [],
    framingChip,
    framingCommentsEnabled: settings.framing.commentsEnabled,
    memoMarkdown: framing.memo?.markdown ?? '',
    linkUrl: framing.link?.uri ?? '',
    linkDisplayName: framing.link?.profile.displayName ?? '',
    pollQuestion: framing.poll?.title ?? '',
    pollOptions: framing.poll
      ? [...framing.poll.options].sort((a, b) => a.sortOrder - b.sortOrder).map(o => ({ id: o.id, text: o.text }))
      : [],
    pollAllowMultiple: framing.poll ? framing.poll.settings.maxResponses !== 1 : false,
    pollAllowCustomOptions: framing.poll?.settings.allowContributorsAddOptions ?? false,
    pollHideResultsUntilVoted: framing.poll?.settings.resultsVisibility === PollResultsVisibility.Hidden,
    pollShowVoterAvatars: framing.poll?.settings.resultsDetail !== PollResultsDetail.Count,
    whiteboardContent: framing.whiteboard?.content || EmptyWhiteboardString,
    whiteboardPreviewImages: [],
    whiteboardPreviewSettings: framing.whiteboard?.previewSettings ?? DefaultWhiteboardPreviewSettings,
    // Server-rendered preview image (D16, 2026-05-18) — shown by `InlineWhiteboardPreview` as the
    // read-time fallback when no fresh in-form blob exists. `WhiteboardDetails.profile.preview` is
    // the Visual selected on `WHITEBOARD_PREVIEW`; the backend stamps it when content changes.
    whiteboardPreviewServerUrl: framing.whiteboard?.profile.preview?.uri || undefined,
    whiteboardConfigured: framing.type === CalloutFramingType.Whiteboard,
    mediaGalleryVisuals:
      framing.mediaGallery?.visuals.map(v => ({
        id: v.id,
        uri: v.uri,
        altText: v.alternativeText,
        sortOrder: v.sortOrder,
      })) ?? [],
    ...(collaboraDocumentType ? { collaboraDocumentType } : {}),
    responseType,
    allowedActors: allowedActorsFromServer(settings.contribution.canAddContributions),
    contributionCommentsEnabled: settings.contribution.commentsEnabled,
    contributionDefaults: {
      defaultDisplayName: contributionDefaults.defaultDisplayName ?? '',
      postDescription: contributionDefaults.postDescription ?? '',
      whiteboardContent:
        !contributionDefaults.whiteboardContent || contributionDefaults.whiteboardContent === EmptyWhiteboardString
          ? ''
          : contributionDefaults.whiteboardContent,
    },
    prePopulateLinkRows: [],
    referenceRows:
      framing.profile.references?.map(r => ({
        id: r.id,
        title: r.name,
        url: r.uri,
        description: r.description ?? '',
      })) ?? [],
    notifyMembers: false,
    editMeta: {
      framingProfileTagsetId: findDefaultTagset(framing.profile.tagsets)?.id,
      framingLinkId: framing.link?.id,
      pollId: framing.poll?.id,
      memoId: framing.memo?.id,
      whiteboardId: framing.whiteboard?.id,
    },
  };
}
