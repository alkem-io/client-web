import type { CalloutContentQuery } from '@/core/apollo/generated/graphql-schema';
import {
  CalloutContributionType,
  CalloutFramingType,
  PollResultsDetail,
  PollResultsVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { allowedActorsFromServer } from '@/main/crdPages/space/callout/calloutFormMapper';
import { contributorCollectionFromServer } from '@/main/crdPages/space/callout/contributorCollectionMapper';
import type { CalloutFormValues, FramingChip, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

type CalloutData = NonNullable<CalloutContentQuery['lookup']['callout']>;

const FRAMING_TYPE_TO_CHIP: Record<CalloutFramingType, FramingChip> = {
  [CalloutFramingType.None]: 'none',
  [CalloutFramingType.Whiteboard]: 'whiteboard',
  [CalloutFramingType.Memo]: 'memo',
  [CalloutFramingType.CollaboraDocument]: 'document',
  [CalloutFramingType.Link]: 'cta',
  [CalloutFramingType.MediaGallery]: 'image',
  [CalloutFramingType.Poll]: 'poll',
  [CalloutFramingType.Contributors]: 'contributors',
};

// Documents are framing-only in P1 — no `document` response type. Existing
// callouts with `CalloutContributionType.CollaboraDocument` in `allowedTypes`
// (provisioned during the Documents MVP before this iteration) collapse to
// `'none'` on prefill, since the response surface no longer renders them.
const CONTRIBUTION_TYPE_TO_RESPONSE: Record<CalloutContributionType, ResponseType | 'none'> = {
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Memo]: 'memo',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
  [CalloutContributionType.CollaboraDocument]: 'none',
};

const findDefaultTagset = (tagsets: CalloutData['framing']['profile']['tagsets']) => {
  if (!tagsets || tagsets.length === 0) return undefined;
  return tagsets.find(ts => ts.name === 'default') ?? tagsets[0];
};

const findTags = (tagsets: CalloutData['framing']['profile']['tagsets']): string[] => {
  const defaultTagset = findDefaultTagset(tagsets);
  return defaultTagset?.tags ?? [];
};

/**
 * Pure mapper: `useCalloutContentQuery` data → CRD form values. Mirrors the
 * MUI `EditCalloutDialog` prefill at lines 56-122. Reset IDs are not copied
 * across — the edit form owns its own transient state and server IDs flow
 * through `calloutId` passed to the connector.
 *
 * Decisions baked in:
 * - On edit, `memoMarkdown` stays empty (plan T048a / FR-21a — memo content is
 *   edited through `CrdMemoDialog`, not the form). `mapFormToCalloutUpdateInput`
 *   never sends `memoContent` on update.
 * - On edit, `whiteboardContent` is omitted from the prefill (T048 — whiteboard
 *   content is edited through `CrdWhiteboardView`, not the form).
 *   `mapFormToCalloutUpdateInput` never sends `whiteboardContent` on update.
 *   The whiteboard preview settings are still copied so the launched dialog
 *   re-opens with the same crop.
 * - On edit, `prePopulateLinkRows` is always empty — existing link
 *   contributions are managed via the detail dialog (plan D19).
 * - `notifyMembers` is always `false` on edit; notifications are offered only
 *   through the visibility-change dialog (plan D10 / FR-72).
 */
export const mapCalloutDetailsToFormValues = (data: CalloutContentQuery | undefined): Partial<CalloutFormValues> => {
  const callout = data?.lookup.callout;
  if (!callout) return {};

  const { framing, settings, contributionDefaults } = callout;
  const framingChip = FRAMING_TYPE_TO_CHIP[framing.type];

  // `responseType` is the user's chosen contribution type — it must come from
  // `allowedTypes` ALONE. `enabled` is a separate "is anyone currently allowed
  // to add?" flag that flips to false when the user turns both Members/Admins
  // toggles off, but the callout is still a contribution-collecting callout.
  // AND-ing `responseType` on `enabled` here would silently reset the chip to
  // "None" on every edit-dialog open whenever the toggles are off, and the
  // update mapper would then commit that loss back to the server.
  const firstAllowedType = settings.contribution.allowedTypes[0];
  const responseType: ResponseType = firstAllowedType
    ? (CONTRIBUTION_TYPE_TO_RESPONSE[firstAllowedType] ?? 'none')
    : 'none';

  const values: Partial<CalloutFormValues> = {
    title: framing.profile.displayName,
    description: framing.profile.description ?? '',
    tags: findTags(framing.profile.tagsets),
    framingChip,
    framingCommentsEnabled: settings.framing.commentsEnabled,
    // Contributor-collection config prefill (feature 008). Falls back to the
    // default (all types) when the callout is not a contributors framing.
    contributorCollection: contributorCollectionFromServer(settings.framing.contributors),
    memoMarkdown: '',
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
    whiteboardPreviewImages: [],
    whiteboardPreviewSettings: framing.whiteboard?.previewSettings ?? DefaultWhiteboardPreviewSettings,
    // Server-rendered preview image (D16, 2026-05-18) — the inline framing preview's read-time
    // fallback when no fresh in-form blob exists. `CalloutContent.graphql` exposes
    // `framing.whiteboard.profile.preview` as `visual(type: WHITEBOARD_PREVIEW)`. Mirrors
    // `calloutTemplateContentToFormValues` (the Callout-template prefill mapper).
    whiteboardPreviewServerUrl: framing.whiteboard?.profile.preview?.uri || undefined,
    whiteboardConfigured: framing.type === CalloutFramingType.Whiteboard,
    mediaGalleryVisuals:
      framing.mediaGallery?.visuals.map(v => ({
        id: v.id,
        uri: v.uri,
        altText: v.alternativeText,
        sortOrder: v.sortOrder,
      })) ?? [],
    responseType,
    allowedActors: allowedActorsFromServer(settings.contribution.canAddContributions),
    contributionCommentsEnabled: settings.contribution.commentsEnabled,
    contributionDefaults: {
      defaultDisplayName: contributionDefaults.defaultDisplayName ?? '',
      postDescription: contributionDefaults.postDescription ?? '',
      // Legacy callouts may have `EmptyWhiteboardString` persisted as the
      // default-whiteboard sentinel from a prior buggy create path. Normalize
      // it back to "" so the form treats this as "no default configured" and
      // the mapper omits it on update — instead of round-tripping the sentinel.
      whiteboardContent:
        !contributionDefaults.whiteboardContent || contributionDefaults.whiteboardContent === EmptyWhiteboardString
          ? ''
          : contributionDefaults.whiteboardContent,
    },
    prePopulateLinkRows: [],
    referenceRows:
      framing.profile.references?.map(r => ({
        id: r.id,
        name: r.name,
        uri: r.uri,
        description: r.description ?? '',
      })) ?? [],
    notifyMembers: false,
    editMeta: {
      framingProfileTagsetId: findDefaultTagset(framing.profile.tagsets)?.id,
      framingLinkId: framing.link?.id,
      pollId: framing.poll?.id,
      memoId: framing.memo?.id,
      whiteboardId: framing.whiteboard?.id,
      framingProfileId: framing.profile.id,
      originalReferenceIds: framing.profile.references?.map(r => r.id) ?? [],
    },
  };

  return values;
};
