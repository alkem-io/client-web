import type { TFunction } from 'i18next';
import {
  AuthorizationPrivilege,
  CalloutAllowedActors,
  CalloutContributionType,
  type CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
  CalloutFramingType,
  CalloutVisibility,
  CollaboraDocumentType,
  type PollResultsDetail,
  type PollResultsVisibility,
  PollStatus,
  TagsetType,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import {
  DocType,
  type PostBodyFragment,
  PostStatus,
  type ResponseCardFragment,
} from '@/core/apollo/generated-v2/graphql-schema';
import { isFileAttachmentUrl } from '@/core/utils/links';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import type { CalloutDetailDialogData } from '@/crd/components/callout/CalloutDetailDialog';
import type { ReferencesAndTagsStripReference } from '@/crd/components/callout/ReferencesAndTagsStrip';
import type { ContributionPreviewKind } from '@/crd/components/contribution/ContributionsPreviewSkeleton';
import type { PostCardData, PostType } from '@/crd/components/space/PostCard';
import type {
  CalloutDetailsModel,
  CalloutDetailsModelExtended,
} from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { WhiteboardPreviewVisualDimensions } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardVisualsDimensions';
import { mapLinkToCallToActionProps } from './callToActionDataMapper';
import { mapMediaGalleryToViewProps } from './mediaGalleryDataMapper';

/**
 * `t` from `useTranslation('crd-space')`, strictly typed against the namespace
 * via the i18next module augmentation in `@types/i18next.d.ts`. Only keys that
 * exist in `space.en.json` type-check; no `as never` / `String(...)` laundering
 * needed at the call site.
 */
export type CrdSpaceTranslator = TFunction<'crd-space'>;

/**
 * Maps every server framing type to the PostCard's PostType. The default
 * (`CalloutFramingType.None`) → 'text'. Each non-None type must be mapped
 * explicitly; the icon/label for each PostType lives in `POST_TYPE_DESCRIPTORS`
 * so adding a new server framing type only needs one mapping entry here and
 * one descriptor entry there.
 */
const FRAMING_TYPE_TO_POST_TYPE: Record<CalloutFramingType, PostType> = {
  [CalloutFramingType.None]: 'text',
  [CalloutFramingType.Whiteboard]: 'whiteboard',
  [CalloutFramingType.Memo]: 'memo',
  [CalloutFramingType.CollaboraDocument]: 'document',
  [CalloutFramingType.MediaGallery]: 'mediaGallery',
  [CalloutFramingType.Link]: 'callToAction',
  [CalloutFramingType.Poll]: 'poll',
  [CalloutFramingType.Form]: 'form',
  [CalloutFramingType.Contributors]: 'contributors',
  [CalloutFramingType.Spaces]: 'spaces',
};

function mapFramingTypeToPostType(framingType: CalloutFramingType): PostType {
  return FRAMING_TYPE_TO_POST_TYPE[framingType] ?? 'text';
}

/** Maps a contribution type to the placeholder kind `ContributionsPreviewSkeleton` reserves space for. */
const CONTRIBUTION_TYPE_TO_PREVIEW_KIND: Record<CalloutContributionType, ContributionPreviewKind> = {
  [CalloutContributionType.Post]: 'post',
  [CalloutContributionType.Whiteboard]: 'whiteboard',
  [CalloutContributionType.Memo]: 'memo',
  [CalloutContributionType.Link]: 'link',
  [CalloutContributionType.CollaboraDocument]: 'document',
};

export function mapContributionTypeToPreviewKind(contributionType: CalloutContributionType): ContributionPreviewKind {
  return CONTRIBUTION_TYPE_TO_PREVIEW_KIND[contributionType];
}

/**
 * Maps a GraphQL Reference to the plain CRD shape consumed by
 * `ReferencesAndTagsStrip` and `CalloutPostPreview`. Centralised so the
 * file-vs-link detection (`isFileAttachmentUrl`) lives in one place — every
 * surface that lists references picks up new logic automatically.
 */
export function mapReferenceToStripData(ref: {
  id: string;
  name: string;
  uri: string;
  description?: string | null;
}): ReferencesAndTagsStripReference {
  return {
    id: ref.id,
    name: ref.name,
    uri: ref.uri,
    description: ref.description ?? undefined,
    isFile: isFileAttachmentUrl(ref.uri),
  };
}

function mapCollaboraDocumentTypeToPreviewType(type: string | undefined): CollaboraDocumentPreviewType | undefined {
  if (type === CollaboraDocumentType.Spreadsheet) return 'spreadsheet';
  if (type === CollaboraDocumentType.Presentation) return 'presentation';
  if (type === CollaboraDocumentType.Wordprocessing) return 'text';
  if (type === CollaboraDocumentType.Drawing) return 'text';
  if (type === CollaboraDocumentType.Pdf) return 'pdf';
  return undefined;
}

/**
 * Structural subset shared by `CalloutModelLightExtended` and
 * `CalloutDetailsModelExtended` — both expose published/created authorship
 * fields with the same shape. Kept narrow so callers can pass either.
 */
type CalloutAuthorshipSource = {
  publishedBy?: { profile?: { displayName: string; url?: string; avatar?: { uri: string } } };
  publishedDate?: Date;
  createdBy?: { profile?: { displayName: string; url?: string; avatar?: { uri: string } } };
  createdDate?: Date;
};

/**
 * Resolves the display author and timestamp for a callout, falling back from
 * the published-* fields to the created-* fields. Shared by every callout
 * mapper so the precedence rule lives in one place.
 */
function resolveAuthorAndTimestamp(
  source: CalloutAuthorshipSource,
  t: CrdSpaceTranslator
): { author?: { name: string; avatarUrl?: string; profileUrl?: string }; timestamp?: string } {
  const authorSource = source.publishedBy ?? source.createdBy;
  const dateSource = source.publishedDate ?? source.createdDate;
  return {
    author: authorSource?.profile
      ? {
          name: authorSource.profile.displayName,
          avatarUrl: authorSource.profile.avatar?.uri,
          profileUrl: authorSource.profile.url,
        }
      : undefined,
    timestamp: dateSource ? formatRelativeDate(dateSource, t) : undefined,
  };
}

/**
 * Maps a fully-loaded callout (from CalloutDetailsQuery) to PostCardData.
 * Has description, content previews, author details, contribution counts.
 */
export function mapCalloutDetailsToPostCard(callout: CalloutDetailsModelExtended, t: CrdSpaceTranslator): PostCardData {
  const { author, timestamp } = resolveAuthorAndTimestamp(callout, t);
  return {
    id: callout.id,
    type: mapFramingTypeToPostType(callout.framing.type),
    title: callout.framing.profile.displayName,
    snippet: callout.framing.profile.description ?? undefined,
    isDraft: callout.draft,
    timestamp,
    author,
    commentCount: callout.comments?.messagesCount ?? 0,
    commentsEnabled: callout.settings.framing.commentsEnabled,
    framingImageUrl:
      callout.framing.type === CalloutFramingType.Whiteboard
        ? callout.framing.whiteboard?.profile.preview?.uri
        : undefined,
    framingMemoMarkdown: callout.framing.type === CalloutFramingType.Memo ? callout.framing.memo?.markdown : undefined,
    memoSignedCopiesCount:
      callout.framing.type === CalloutFramingType.Memo
        ? callout.framing.memo?.signatures?.filter(signature => signature.document).length
        : undefined,
    framingMediaGallery:
      callout.framing.type === CalloutFramingType.MediaGallery
        ? (() => {
            const mapped = mapMediaGalleryToViewProps(callout.framing.mediaGallery);
            return { thumbnails: mapped.feedThumbnails, totalCount: mapped.totalCount };
          })()
        : undefined,
    framingDocumentType:
      callout.framing.type === CalloutFramingType.CollaboraDocument
        ? mapCollaboraDocumentTypeToPreviewType(callout.framing.collaboraDocument?.documentType)
        : undefined,
    framingDocumentPreviewUrl:
      callout.framing.type === CalloutFramingType.CollaboraDocument
        ? (callout.framing.collaboraDocument?.previewUrl ?? undefined)
        : undefined,
    framingCallToAction:
      callout.framing.type === CalloutFramingType.Link
        ? (() => {
            const mapped = mapLinkToCallToActionProps(callout.framing.link);
            return mapped
              ? {
                  uri: mapped.url,
                  displayName: mapped.displayName,
                  isExternal: mapped.isExternal,
                  isValid: mapped.isValid,
                }
              : undefined;
          })()
        : undefined,
    // User-authored tags (default tagset) and external references — surfaced
    // on the feed card by `ReferencesAndTagsStrip` (the same component the
    // detail dialog uses). MUI parity: `CalloutHeader`.
    tags: callout.framing.profile.tagset?.tags ?? [],
    references: (callout.framing.profile.references ?? []).map(mapReferenceToStripData),
  };
}

export function getCalloutContributionType(callout: CalloutDetailsModelExtended): CalloutContributionType | undefined {
  const allowedTypes = callout.settings.contribution.allowedTypes;
  return allowedTypes.length > 0 ? allowedTypes[0] : undefined;
}

export function formatRelativeDate(date: Date, t: CrdSpaceTranslator): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return t('dates.today');
  if (days === 1) return t('dates.yesterday');
  if (days < 7) return t('dates.daysAgo', { count: days });
  if (days < 30) return t('dates.weeksAgo', { count: Math.floor(days / 7) });
  return date.toLocaleDateString();
}

/**
 * Maps a fully-loaded callout to the shape required by CalloutDetailDialog.
 */
export function mapCalloutDetailsToDialogData(
  callout: CalloutDetailsModelExtended,
  t: CrdSpaceTranslator
): CalloutDetailDialogData {
  const { author, timestamp } = resolveAuthorAndTimestamp(callout, t);
  return {
    id: callout.id,
    title: callout.framing.profile.displayName,
    description: callout.framing.profile.description ?? undefined,
    timestamp,
    author,
    commentCount: callout.comments?.messagesCount ?? 0,
    reactionCount: 0,
    // `framing.profile.tagset` is the default (single) tagset for the
    // user-authored tags. Classification tagsets (FLOW_STATE etc.) live on a
    // separate `classification.tagsets` field and don't surface in this strip.
    tags: callout.framing.profile.tagset?.tags ?? [],
    references: (callout.framing.profile.references ?? []).map(mapReferenceToStripData),
  };
}

type NativeContent = NonNullable<PostBodyFragment['content']>;
type ContentOf<K extends NativeContent['__typename']> = Extract<NativeContent, { __typename: K }> | null | undefined;
type NativeFraming = Omit<CalloutDetailsModel['framing'], 'profile'>;
type ResponsePolicy = {
  who?: 'members' | 'admins';
  read?: 'all' | 'admins' | 'own';
  max_per_contributor?: number | null;
  accept_new?: boolean;
  comments_on_responses?: boolean;
  allowed_document_types?: string[];
};
/** The post's served response defaults: a form's heading, else the defaults of a new response (import:008). */
type ResponseDefaults = { title?: string; description?: string; default_collapsed?: boolean; display_name?: string };
type FormQuestion = {
  id: string;
  prompt: string;
  type: string;
  required?: boolean;
  explanation?: string;
  options?: { id: string; label: string }[];
};
type PollSettings = {
  min?: number;
  max?: number;
  allow_add?: boolean;
  results_detail?: string;
  results_visibility?: string;
};

// Storage buckets are not served (021 tasks.md): upload controls of these surfaces have no bucket.
const NO_BUCKET = { id: '', allowedMimeTypes: [], maxFileSize: 0 };

const COLLABORA_TYPE: Partial<Record<DocType, CollaboraDocumentType>> = {
  [DocType.OfficeText]: CollaboraDocumentType.Wordprocessing,
  [DocType.OfficeSheet]: CollaboraDocumentType.Spreadsheet,
  [DocType.OfficeSlides]: CollaboraDocumentType.Presentation,
  [DocType.OfficeDrawing]: CollaboraDocumentType.Drawing,
  [DocType.Pdf]: CollaboraDocumentType.Pdf,
};

/** The legacy type of a document, from its docType or the policy's allowed_document_types value. */
export const documentContributionType = (docType: string): CalloutContributionType =>
  docType.toUpperCase() === DocType.Excalidraw
    ? CalloutContributionType.Whiteboard
    : docType.toUpperCase() === DocType.Richtext
      ? CalloutContributionType.Memo
      : CalloutContributionType.CollaboraDocument;

export const collaboraDocumentType = (docType: DocType): string => COLLABORA_TYPE[docType] ?? '';

const RESPONSE_TYPE: Record<string, CalloutContributionType> = {
  text: CalloutContributionType.Post,
  task: CalloutContributionType.Post,
  link: CalloutContributionType.Link,
};

const CAN_PRIVILEGES: [keyof PostBodyFragment['can'], AuthorizationPrivilege[]][] = [
  ['read', [AuthorizationPrivilege.Read]],
  ['update', [AuthorizationPrivilege.Update]],
  ['delete', [AuthorizationPrivilege.Delete]],
  [
    'respond',
    [AuthorizationPrivilege.Contribute, AuthorizationPrivilege.CreatePost, AuthorizationPrivilege.CreateWhiteboard],
  ],
  ['moveTask', [AuthorizationPrivilege.MoveTask]],
];

const nativeActor = (actor: PostBodyFragment['author']) =>
  actor?.about
    ? {
        id: actor.id,
        profile: {
          displayName: actor.about.displayName,
          url: actor.url ?? '',
          avatar: actor.about.avatar ? { id: actor.id, uri: actor.about.avatar.file.url } : undefined,
        },
      }
    : undefined;

function documentFraming(post: PostBodyFragment): NativeFraming {
  const document = (post.content as ContentOf<'DocumentContent'>)?.document;
  if (!document) return { type: CalloutFramingType.None };
  const displayName = document.about?.displayName ?? post.about.displayName;
  const myPrivileges = document.can.edit
    ? [AuthorizationPrivilege.Read, AuthorizationPrivilege.UpdateContent]
    : [AuthorizationPrivilege.Read];
  const type = documentContributionType(document.docType);
  if (type === CalloutContributionType.Whiteboard) {
    const preview = document.preview && {
      id: document.id,
      uri: document.preview.url,
      ...WhiteboardPreviewVisualDimensions,
    };
    return {
      type: CalloutFramingType.Whiteboard,
      whiteboard: {
        id: document.id,
        nameID: document.id,
        authorization: { myPrivileges },
        profile: {
          id: document.id,
          displayName,
          storageBucket: NO_BUCKET,
          preview: preview ?? undefined,
          url: document.url ?? undefined,
        },
        previewSettings: DefaultWhiteboardPreviewSettings,
      },
    };
  }
  if (type === CalloutContributionType.Memo) {
    return { type: CalloutFramingType.Memo, memo: { id: document.id, markdown: document.textSnapshot ?? undefined } };
  }
  return {
    type: CalloutFramingType.CollaboraDocument,
    collaboraDocument: {
      id: document.id,
      documentType: collaboraDocumentType(document.docType),
      previewUrl: document.preview?.url,
      authorization: { myPrivileges },
      profile: { id: document.id, displayName, url: document.url ?? '' },
    },
  };
}

function linkFraming(post: PostBodyFragment): NativeFraming {
  const link = (post.content as ContentOf<'LinkContent'>)?.link;
  return {
    type: CalloutFramingType.Link,
    link: link && {
      id: link.id,
      uri: link.uri,
      profile: { displayName: link.title ?? '', description: link.description ?? undefined },
    },
  };
}

function nativePoll(post: PostBodyFragment, poll: NonNullable<ContentOf<'PollContent'>>): PollDetailsModel {
  const settings = (poll.settings ?? {}) as PollSettings;
  return {
    id: post.id,
    title: poll.question,
    status: poll.status === 'CLOSED' ? PollStatus.Closed : PollStatus.Open,
    settings: {
      allowContributorsAddOptions: settings.allow_add ?? false,
      minResponses: settings.min ?? 1,
      maxResponses: settings.max ?? 1,
      resultsVisibility: (settings.results_visibility ?? 'visible')
        .toUpperCase()
        .replace('-', '_') as PollResultsVisibility,
      resultsDetail: (settings.results_detail ?? 'full').toUpperCase() as PollResultsDetail,
    },
    totalVotes: poll.totalVotes ?? undefined,
    canSeeDetailedResults: poll.options.some(option => option.votes != null || option.percentage != null),
    options: poll.options.map(option => ({
      id: option.id,
      text: option.value,
      sortOrder: option.sortOrder,
      voteCount: option.votes ?? undefined,
      votePercentage: option.percentage ?? undefined,
      voters: option.voters?.map(voter => ({
        id: voter.id,
        profile: voter.about
          ? {
              id: voter.id,
              displayName: voter.about.displayName,
              visual: voter.about.avatar ? { id: voter.id, uri: voter.about.avatar.file.url } : undefined,
            }
          : undefined,
      })),
    })),
    myVote: poll.myVotes.length > 0 ? { id: post.id, selectedOptions: poll.myVotes.map(id => ({ id })) } : undefined,
  };
}

/** One framing per content kind (021 FR-008); a kind without its own treatment renders as a plain post. */
const FRAMING_BY_KIND: Record<string, (post: PostBodyFragment) => NativeFraming> = {
  document: documentFraming,
  link: linkFraming,
  cta: linkFraming,
  gallery: post => ({
    type: CalloutFramingType.MediaGallery,
    mediaGallery: {
      id: post.id,
      visuals: ((post.content as ContentOf<'GalleryContent'>)?.images ?? []).map(image => ({
        id: image.file.id,
        uri: image.file.url,
        name: image.file.mime.startsWith('video/') ? VisualType.MediaGalleryVideo : VisualType.MediaGalleryImage,
        alternativeText: image.alt ?? undefined,
      })),
    },
  }),
  poll: post => {
    const poll = post.content as ContentOf<'PollContent'>;
    return { type: CalloutFramingType.Poll, poll: poll ? nativePoll(post, poll) : undefined };
  },
  contributors: () => ({ type: CalloutFramingType.Contributors }),
  spaces: () => ({ type: CalloutFramingType.Spaces }),
  form: post => {
    const form = post.content as ContentOf<'FormContent'>;
    const policy = (post.responsePolicy ?? {}) as ResponsePolicy;
    const defaults = (post.responseDefaults ?? {}) as ResponseDefaults;
    return {
      type: CalloutFramingType.Form,
      form: form
        ? {
            id: post.id,
            title: defaults.title,
            description: defaults.description,
            questions: (form.questions as FormQuestion[]).map(question => ({
              id: question.id,
              prompt: question.prompt,
              explanation: question.explanation,
              type: question.type.toUpperCase() as CalloutFormQuestionType,
              required: question.required ?? false,
              options: question.options,
            })),
            settings: {
              visibility:
                policy.read === 'all' ? CalloutFormResponseVisibility.Members : CalloutFormResponseVisibility.Admins,
              responseMode:
                policy.max_per_contributor === 1 ? CalloutFormResponseMode.Single : CalloutFormResponseMode.Multiple,
              state: policy.accept_new === false ? CalloutFormState.Closed : CalloutFormState.Open,
              defaultCollapsed: defaults.default_collapsed ?? false,
            },
          }
        : undefined,
    };
  },
};

/** The legacy contribution type a post collects, from its response kind (and allowed document types). */
export function responseContributionType(
  responseKind: string | null | undefined,
  responsePolicy: unknown
): CalloutContributionType | undefined {
  const firstDocumentType = (responsePolicy as ResponsePolicy | null)?.allowed_document_types?.[0];
  if (responseKind === 'document') return firstDocumentType ? documentContributionType(firstDocumentType) : undefined;
  return responseKind ? RESPONSE_TYPE[responseKind] : undefined;
}

/**
 * 021 FR-008: the callout model the feed card, its dialog and their controls render, filled from the post the
 * page already holds (PostBody) and the responses it has (the card's preview or the dialog's window).
 * Unserved parts are absent: reactions, save-as-template, the phase classification.
 */
export function mapPostToCallout(
  post: PostBodyFragment,
  responses: ResponseCardFragment[],
  calloutsSetId?: string
): CalloutDetailsModelExtended {
  const policy = (post.responsePolicy ?? {}) as ResponsePolicy;
  const visibility = post.postStatus === PostStatus.Draft ? CalloutVisibility.Draft : CalloutVisibility.Published;
  const acceptsNew = policy.accept_new !== false;
  const responseType = responseContributionType(post.responseKind, post.responsePolicy);
  const defaults = (post.responseDefaults ?? {}) as ResponseDefaults;
  return {
    id: post.id,
    sortOrder: post.sortOrder,
    calloutsSetId,
    authorization: { myPrivileges: CAN_PRIVILEGES.flatMap(([can, privileges]) => (post.can[can] ? privileges : [])) },
    draft: visibility === CalloutVisibility.Draft,
    editable: post.can.update,
    movable: post.can.move,
    canBeSavedAsTemplate: false,
    classificationTagsets: [],
    publishedDate: post.publishedAt ? new Date(post.publishedAt) : undefined,
    publishedBy: nativeActor(post.publishedBy),
    createdDate: new Date(post.createdAt),
    createdBy: nativeActor(post.author),
    framing: {
      profile: {
        id: post.id,
        displayName: post.about.displayName,
        description: post.about.description ?? undefined,
        tagset: { id: post.id, name: 'default', tags: post.tags, allowedValues: [], type: TagsetType.Freeform },
        references: post.links.map(link => ({
          id: link.id,
          name: link.title ?? '',
          uri: link.uri,
          description: link.description ?? undefined,
        })),
        url: post.url ?? '',
        storageBucket: NO_BUCKET,
      },
      ...(FRAMING_BY_KIND[post.contentKind]?.(post) ?? { type: CalloutFramingType.None }),
    },
    settings: {
      contribution: {
        enabled: acceptsNew,
        allowedTypes: responseType ? [responseType] : [],
        canAddContributions: !acceptsNew
          ? CalloutAllowedActors.None
          : policy.who === 'admins'
            ? CalloutAllowedActors.Admins
            : CalloutAllowedActors.Members,
        commentsEnabled: policy.comments_on_responses ?? true,
      },
      framing: { commentsEnabled: post.commentsEnabled },
      visibility,
    },
    contributionDefaults: { defaultDisplayName: defaults.display_name, postDescription: defaults.description },
    comments: post.room
      ? {
          id: post.room.id,
          messagesCount: post.room.messageCount,
          // The post's own comment grant (can.comment): the room's grants are not read (spaces 2026-11-26).
          authorization: {
            myPrivileges: post.can.comment
              ? [AuthorizationPrivilege.CreateMessage, AuthorizationPrivilege.CreateMessageReply]
              : [],
          },
          messages: [],
          vcInteractions: [],
        }
      : undefined,
    contributions: responses.map(({ id, sortOrder }) => ({ id, sortOrder })),
    reactionsSummary: null,
  };
}
