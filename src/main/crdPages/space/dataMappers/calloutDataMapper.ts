import type { TFunction } from 'i18next';
import {
  type CalloutContributionType,
  CalloutFramingType,
  CollaboraDocumentType,
} from '@/core/apollo/generated/graphql-schema';
import { isFileAttachmentUrl } from '@/core/utils/links';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';
import type { CalloutDetailDialogData } from '@/crd/components/callout/CalloutDetailDialog';
import type { ReferencesAndTagsStripReference } from '@/crd/components/callout/ReferencesAndTagsStrip';
import type { PostCardData, PostType } from '@/crd/components/space/PostCard';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type { CalloutModelLightExtended } from '@/domain/collaboration/callout/models/CalloutModelLight';
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
};

function mapFramingTypeToPostType(framingType: CalloutFramingType): PostType {
  return FRAMING_TYPE_TO_POST_TYPE[framingType] ?? 'text';
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
 * Maps a lightweight callout (from the list query) to PostCardData.
 * Only has title and type — no description, no content previews.
 */
export function mapCalloutLightToPostCard(callout: CalloutModelLightExtended, t: CrdSpaceTranslator): PostCardData {
  const { author, timestamp } = resolveAuthorAndTimestamp(callout, t);
  return {
    id: callout.id,
    type: mapFramingTypeToPostType(callout.framing.type),
    title: callout.framing.profile.displayName,
    snippet: undefined, // Not available in list query
    isDraft: callout.draft,
    timestamp,
    author,
    commentCount: callout.activity ?? 0,
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
    commentCount: callout.comments?.messagesCount ?? callout.activity ?? 0,
    commentsEnabled: callout.settings.framing.commentsEnabled,
    framingImageUrl:
      callout.framing.type === CalloutFramingType.Whiteboard
        ? callout.framing.whiteboard?.profile.preview?.uri
        : undefined,
    framingMemoMarkdown: callout.framing.type === CalloutFramingType.Memo ? callout.framing.memo?.markdown : undefined,
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

export function mapCalloutsToPostCards(callouts: CalloutModelLightExtended[], t: CrdSpaceTranslator): PostCardData[] {
  return [...callouts].sort((a, b) => a.sortOrder - b.sortOrder).map(callout => mapCalloutLightToPostCard(callout, t));
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
    commentCount: callout.comments?.messagesCount ?? callout.activity ?? 0,
    reactionCount: 0,
    // `framing.profile.tagset` is the default (single) tagset for the
    // user-authored tags. Classification tagsets (FLOW_STATE etc.) live on a
    // separate `classification.tagsets` field and don't surface in this strip.
    tags: callout.framing.profile.tagset?.tags ?? [],
    references: (callout.framing.profile.references ?? []).map(mapReferenceToStripData),
  };
}
