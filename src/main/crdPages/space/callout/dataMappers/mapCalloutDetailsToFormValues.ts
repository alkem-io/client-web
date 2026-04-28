import type { CalloutContentQuery } from '@/core/apollo/generated/graphql-schema';
import {
  CalloutContributionType,
  CalloutFramingType,
  PollResultsDetail,
  PollResultsVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { allowedActorsFromServer } from '@/main/crdPages/space/callout/calloutFormMapper';
import type { CalloutFormValues, FramingChip, ResponseType } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

type CalloutData = NonNullable<CalloutContentQuery['lookup']['callout']>;

const FRAMING_TYPE_TO_CHIP: Record<CalloutFramingType, FramingChip> = {
  [CalloutFramingType.None]: 'none',
  [CalloutFramingType.Whiteboard]: 'whiteboard',
  [CalloutFramingType.Memo]: 'memo',
  [CalloutFramingType.Link]: 'cta',
  [CalloutFramingType.MediaGallery]: 'image',
  [CalloutFramingType.Poll]: 'poll',
};

const CONTRIBUTION_TYPE_TO_RESPONSE: Record<CalloutContributionType, ResponseType> = {
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Memo]: 'memo',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
};

const findDefaultTagset = (tagsets: CalloutData['framing']['profile']['tagsets']) => {
  if (!tagsets || tagsets.length === 0) return undefined;
  return tagsets.find(ts => ts.name === 'default') ?? tagsets[0];
};

const findTags = (tagsets: CalloutData['framing']['profile']['tagsets']): string => {
  const defaultTagset = findDefaultTagset(tagsets);
  return defaultTagset?.tags.join(', ') ?? '';
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

  const firstAllowedType = settings.contribution.allowedTypes[0];
  const responseType: ResponseType =
    settings.contribution.enabled && firstAllowedType
      ? (CONTRIBUTION_TYPE_TO_RESPONSE[firstAllowedType] ?? 'none')
      : 'none';

  const values: Partial<CalloutFormValues> = {
    title: framing.profile.displayName,
    description: framing.profile.description ?? '',
    tags: findTags(framing.profile.tagsets),
    framingChip,
    framingCommentsEnabled: settings.framing.commentsEnabled,
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
      whiteboardContent: contributionDefaults.whiteboardContent ?? '',
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

  return values;
};
