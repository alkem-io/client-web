import {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutFramingType,
  CalloutVisibility,
  PollResultsDetail,
  PollResultsVisibility,
  type UpdateCalloutEntityInput,
  type UpdateReferenceInput,
} from '@/core/apollo/generated/graphql-schema';
import type { CalloutCreationType } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import type { MemoFieldSubmittedValues } from '@/domain/collaboration/memo/model/MemoFieldSubmittedValues';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import type {
  AllowedActors,
  CalloutFormValues,
  FramingChip,
  ReferenceRow,
  ResponseType,
} from '@/main/crdPages/space/hooks/useCrdCalloutForm';

/**
 * Pure mapping helpers between the CRD callout form state and the server input
 * shape. No Apollo, no side effects. Imported by `CalloutFormConnector`.
 */

const FRAMING_CHIP_TO_SERVER: Record<FramingChip, CalloutFramingType> = {
  none: CalloutFramingType.None,
  whiteboard: CalloutFramingType.Whiteboard,
  memo: CalloutFramingType.Memo,
  document: CalloutFramingType.None, // disabled chip — never reaches submit
  cta: CalloutFramingType.Link,
  image: CalloutFramingType.MediaGallery,
  poll: CalloutFramingType.Poll,
};

const RESPONSE_TO_CONTRIBUTION_TYPE: Record<ResponseType, CalloutContributionType | undefined> = {
  none: undefined,
  link: CalloutContributionType.Link,
  post: CalloutContributionType.Post,
  memo: CalloutContributionType.Memo,
  whiteboard: CalloutContributionType.Whiteboard,
  document: undefined, // disabled chip — never reaches submit
};

export const framingChipToServer = (chip: FramingChip): CalloutFramingType => FRAMING_CHIP_TO_SERVER[chip];
export const responseTypeToServer = (type: ResponseType): CalloutContributionType | undefined =>
  RESPONSE_TO_CONTRIBUTION_TYPE[type];

/**
 * Maps `allowedActors` (two independent switches with a hierarchy rule — plan D4)
 * to the server enum `CalloutAllowedActors`.
 *
 * - `{ members: true,  admins: true  }` → Members
 * - `{ members: false, admins: true  }` → Admins
 * - `{ members: false, admins: false }` → None
 * - `{ members: true,  admins: false }` → unreachable (hierarchy enforces admins=true)
 */
export const allowedActorsToServer = (actors: AllowedActors): CalloutAllowedActors => {
  if (actors.members && actors.admins) return CalloutAllowedActors.Members;
  if (!actors.members && actors.admins) return CalloutAllowedActors.Admins;
  return CalloutAllowedActors.None;
};

/** Inverse of `allowedActorsToServer`, used on edit pre-fill. */
export const allowedActorsFromServer = (value: CalloutAllowedActors | undefined): AllowedActors => {
  switch (value) {
    case CalloutAllowedActors.Members:
      return { members: true, admins: true };
    case CalloutAllowedActors.Admins:
      return { members: false, admins: true };
    default:
      return { members: false, admins: false };
  }
};

/**
 * Splits a comma-separated tags string into a deduplicated array. Empty strings
 * are dropped, whitespace trimmed. See spec D3 / FR-61.
 */
export const tagsStringToArray = (raw: string): string[] =>
  Array.from(
    new Set(
      raw
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    )
  );

export type MapFormOptions = {
  visibility: CalloutVisibility;
  /** i18n-resolved fallback used when the framing has no title. */
  whiteboardFallbackDisplayName: string;
};

/**
 * Local extension of `CalloutCreationType.framing` to include the `memo` field
 * that the server supports but the domain's base interface omits. The server
 * accepts this shape — `CalloutCreationTypeWithPreviewImages.framing.memo` is
 * the canonical model — but we cannot use the "WithPreviewImages" alias here
 * because it *requires* `whiteboard.previewImages`, and we pass preview blobs
 * out-of-band via `MapFormResult.whiteboardPreviewImages`.
 */
export type CalloutCreationInput = Omit<CalloutCreationType, 'framing'> & {
  framing: CalloutCreationType['framing'] & {
    memo?: MemoFieldSubmittedValues;
  };
};

export type MapFormResult = {
  input: CalloutCreationInput;
  /**
   * Whiteboard preview blobs, set only when the framing is Whiteboard and the
   * user saved a whiteboard in the single-user dialog. The connector uploads
   * these against the newly-created whiteboard's visual IDs after the create
   * mutation resolves.
   */
  whiteboardPreviewImages?: WhiteboardPreviewImage[];
};

/**
 * Pure mapper: form values → server create input + client-only preview blobs.
 * Preview blobs are NOT sent with the mutation; the connector uploads them
 * afterwards against the visual IDs returned by the server.
 */
export const mapFormToCalloutCreationInput = (values: CalloutFormValues, options: MapFormOptions): MapFormResult => {
  const framingType = framingChipToServer(values.framingChip);
  const responseType = responseTypeToServer(values.responseType);
  const tagsArray = tagsStringToArray(values.tags);
  const hasResponseType = responseType !== undefined;

  const referencesData = values.referenceRows
    .filter(row => row.title.trim() && row.url.trim())
    .map(row => ({
      name: row.title.trim(),
      uri: row.url.trim(),
      description: row.description.trim() || undefined,
    }));

  // Settings: match MUI defaults (DefaultCalloutSettings) — `enabled: true`
  // with empty `allowedTypes` is the "no response type" shape that MUI ships
  // and the server treats as the permissive default. Sending `enabled: false`
  // with just framing (Whiteboard / MediaGallery) triggered server-side
  // rejection/loss of the framing entity.
  const contributionSettings = hasResponseType
    ? {
        enabled: allowedActorsToServer(values.allowedActors) !== CalloutAllowedActors.None,
        allowedTypes: [responseType],
        canAddContributions: allowedActorsToServer(values.allowedActors),
        commentsEnabled: values.responseType === 'post' ? values.contributionCommentsEnabled : true,
      }
    : {
        enabled: true,
        allowedTypes: [],
        canAddContributions: CalloutAllowedActors.Members,
        commentsEnabled: true,
      };

  // On CREATE, tags go in `framing.tags: string[]` (MUI parity — see
  // mapProfileTagsToCreateTags + CreateCalloutDialog). The server auto-creates
  // the default tagset; sending `framing.profile.tagsets` on create would
  // create a duplicate/conflict that the Whiteboard + MediaGallery framings
  // reject on the server.
  const callout: CalloutCreationInput = {
    framing: {
      type: framingType,
      profile: {
        displayName: values.title.trim(),
        description: values.description || undefined,
        ...(referencesData.length > 0 ? { referencesData } : {}),
      },
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    },
    settings: {
      visibility: options.visibility,
      framing: {
        commentsEnabled: values.framingCommentsEnabled,
      },
      contribution: contributionSettings,
    },
    sendNotification: values.notifyMembers && options.visibility !== CalloutVisibility.Draft,
  };

  // Contribution defaults — spec FR-40..46, D5. Mirror MUI's response-type
  // filter: only send `postDescription` for post/memo responses, only send
  // `whiteboardContent` for whiteboard responses. Sending whiteboardContent on
  // a post callout (or vice-versa) trips backend DTO validation. An empty
  // form value means "user did not configure a default" — omit it.
  if (hasResponseType) {
    const defaults = values.contributionDefaults;
    const isWhiteboardResponse = values.responseType === 'whiteboard';
    const isPostOrMemoResponse = values.responseType === 'post' || values.responseType === 'memo';
    const defaultDisplayName = defaults.defaultDisplayName.trim() || undefined;
    const postDescription = isPostOrMemoResponse ? defaults.postDescription.trim() || undefined : undefined;
    const whiteboardContent =
      isWhiteboardResponse && defaults.whiteboardContent ? defaults.whiteboardContent : undefined;
    if (defaultDisplayName || postDescription || whiteboardContent) {
      callout.contributionDefaults = { defaultDisplayName, postDescription, whiteboardContent };
    }
  }

  // Pre-populate link contributions (spec D19, US8) — create mode only.
  if (values.responseType === 'link') {
    const rows = values.prePopulateLinkRows
      .filter(r => r.url.trim() && r.title.trim())
      .map(r => ({
        type: CalloutContributionType.Link,
        link: {
          uri: r.url.trim(),
          profile: {
            displayName: r.title.trim(),
            description: r.description?.trim() || undefined,
          },
        },
      }));
    if (rows.length > 0) callout.contributions = rows;
  }

  // Framing-specific branches. Note: `whiteboard.previewImages` is NOT
  // included here — preview blobs travel out-of-band via the returned
  // `whiteboardPreviewImages` field so the connector can upload them after
  // the mutation resolves.
  if (framingType === CalloutFramingType.Whiteboard) {
    callout.framing.whiteboard = {
      content: values.whiteboardContent,
      profile: { displayName: values.title.trim() || options.whiteboardFallbackDisplayName },
      previewSettings: values.whiteboardPreviewSettings,
    };
  }

  if (framingType === CalloutFramingType.Memo) {
    callout.framing.memo = {
      // Match MUI: send undefined rather than empty string when the user hasn't
      // typed anything — the server normalizes both but undefined is the
      // canonical shape from CalloutFormFramingSettings.
      markdown: values.memoMarkdown.trim() ? values.memoMarkdown : undefined,
      profile: { displayName: values.title.trim() || options.whiteboardFallbackDisplayName },
    };
  }

  // Media-gallery framing: nothing to set here. The server auto-creates the
  // MediaGallery entity when `framing.type === MediaGallery` and returns its
  // id; the connector uploads the selected files post-save via
  // `useUploadMediaGalleryVisuals`. (MUI's CreateCalloutDialog destructures
  // `mediaGallery` out of the framing before sending — same effect.)

  if (framingType === CalloutFramingType.Link && values.linkUrl) {
    callout.framing.link = {
      uri: values.linkUrl.trim(),
      profile: { displayName: values.linkDisplayName.trim() || values.linkUrl.trim() },
    };
  }

  if (framingType === CalloutFramingType.Poll && values.pollQuestion) {
    callout.framing.poll = {
      title: values.pollQuestion,
      options: values.pollOptions.filter(o => o.text.trim()).map(o => o.text.trim()),
      settings: {
        allowContributorsAddOptions: values.pollAllowCustomOptions,
        minResponses: 1,
        maxResponses: values.pollAllowMultiple ? 0 : 1,
        resultsVisibility: values.pollHideResultsUntilVoted
          ? PollResultsVisibility.Hidden
          : PollResultsVisibility.Visible,
        resultsDetail: values.pollShowVoterAvatars ? PollResultsDetail.Full : PollResultsDetail.Count,
      },
    };
  }

  return {
    input: callout,
    whiteboardPreviewImages:
      framingType === CalloutFramingType.Whiteboard && values.whiteboardPreviewImages.length > 0
        ? values.whiteboardPreviewImages
        : undefined,
  };
};

/** Re-exported for the connector's type-only usage. */
export type { CalloutCreationType };

export type MapUpdateOptions = {
  calloutId: string;
};

export type MapUpdateResult = {
  input: UpdateCalloutEntityInput;
  /** Preview blobs carried out-of-band for the whiteboard upload after the mutation. */
  whiteboardPreviewImages?: WhiteboardPreviewImage[];
};

/**
 * Pure mapper: form values → `UpdateCalloutEntityInput` (edit mode). Mirrors
 * the MUI `EditCalloutDialog` mapping at lines 236-268 (spec plan T044):
 *
 * - Omits `settings.contribution.allowedTypes` — read-only on edit.
 * - Sends framing profile via `UpdateProfileInput`, reusing tagset + reference
 *   IDs captured in `values.editMeta`.
 * - Whiteboard content travels on `framing.whiteboardContent`, not
 *   `framing.whiteboard` (the server uses the former on update).
 * - Memo content travels on `framing.memoContent` (same scalar, separate
 *   from the create-time `framing.memo.markdown`). On edit, the memo body
 *   is edited through `CrdMemoDialog` so `memoMarkdown` is normally empty —
 *   we only include `memoContent` when it was explicitly edited in the form.
 * - Link framing uses `UpdateLinkInput` (requires `ID`).
 * - Poll framing is title-only on update; options flow through the
 *   dedicated poll-option mutations.
 * - Pre-populate links are never sent on update (spec D19).
 */
export const mapFormToCalloutUpdateInput = (values: CalloutFormValues, options: MapUpdateOptions): MapUpdateResult => {
  const framingType = framingChipToServer(values.framingChip);
  const responseType = responseTypeToServer(values.responseType);
  const tagsArray = tagsStringToArray(values.tags);
  const hasResponseType = responseType !== undefined;

  const references: UpdateReferenceInput[] = values.referenceRows
    .filter(
      (row): row is ReferenceRow & { id: string } =>
        Boolean(row.id) && row.title.trim().length > 0 && row.url.trim().length > 0
    )
    .map(row => ({
      ID: row.id,
      name: row.title.trim(),
      uri: row.url.trim(),
      description: row.description.trim(),
    }));

  const tagsetId = values.editMeta?.framingProfileTagsetId;
  const tagsets = tagsetId
    ? [
        {
          ID: tagsetId,
          name: 'default',
          tags: tagsArray,
        },
      ]
    : undefined;

  const framing: UpdateCalloutEntityInput['framing'] = {
    type: framingType,
    profile: {
      displayName: values.title.trim(),
      description: values.description || undefined,
      ...(references.length > 0 ? { references } : {}),
      ...(tagsets ? { tagsets } : {}),
    },
  };

  // Whiteboard and memo content are NOT sent on update (T048 / T048a). Both
  // framings are edited through their dedicated collaborative dialogs
  // (`CrdWhiteboardView` / `CrdMemoDialog`), which persist via their own
  // mutations. Re-sending content from this form would either be rejected by
  // the server or overwrite live edits made in the collaborative dialog.
  // Preview settings are handled by the whiteboard dialog's preview-settings
  // flow (`useUpdateWhiteboardPreviewSettings`), not by this update payload.

  if (framingType === CalloutFramingType.Link) {
    const linkId = values.editMeta?.framingLinkId;
    if (linkId) {
      framing.link = {
        ID: linkId,
        uri: values.linkUrl.trim(),
        profile: {
          displayName: values.linkDisplayName.trim() || values.linkUrl.trim(),
        },
      };
    }
  }

  if (framingType === CalloutFramingType.Poll) {
    framing.poll = { title: values.pollQuestion };
  }

  // Contribution settings: omit `allowedTypes` on update (server-enforced
  // read-only) and skip the whole sub-object when none apply.
  const canAddContributions = hasResponseType ? allowedActorsToServer(values.allowedActors) : undefined;
  const contributionSettings = hasResponseType
    ? {
        enabled: canAddContributions !== CalloutAllowedActors.None,
        canAddContributions,
        commentsEnabled: values.responseType === 'post' ? values.contributionCommentsEnabled : true,
      }
    : undefined;

  const settings: UpdateCalloutEntityInput['settings'] = {
    framing: { commentsEnabled: values.framingCommentsEnabled },
  };
  if (contributionSettings) settings.contribution = contributionSettings;

  const whiteboardDefault = values.contributionDefaults.whiteboardContent;
  const contributionDefaultsInput: UpdateCalloutEntityInput['contributionDefaults'] | undefined = hasResponseType
    ? {
        defaultDisplayName: values.contributionDefaults.defaultDisplayName.trim() || undefined,
        postDescription:
          values.responseType === 'post' || values.responseType === 'memo'
            ? values.contributionDefaults.postDescription.trim() || undefined
            : undefined,
        whiteboardContent: values.responseType === 'whiteboard' && whiteboardDefault ? whiteboardDefault : undefined,
      }
    : undefined;

  const input: UpdateCalloutEntityInput = {
    ID: options.calloutId,
    framing,
    settings,
  };
  if (contributionDefaultsInput) input.contributionDefaults = contributionDefaultsInput;

  return {
    input,
    whiteboardPreviewImages:
      framingType === CalloutFramingType.Whiteboard && values.whiteboardPreviewImages.length > 0
        ? values.whiteboardPreviewImages
        : undefined,
  };
};
