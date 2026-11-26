import type { Locale } from 'date-fns';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import type { ResponseCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { isFileAttachmentUrl } from '@/core/utils/links';
import type { CollaboraDocumentPreviewType } from '@/crd/lib/collaboraDocumentPreview';
import { formatShortDate } from '@/crd/lib/dateTimeFormat';
import { toCollaboraPreviewType } from '@/main/crdPages/space/callout/collaboraDocumentTypeMap';
import { collaboraDocumentType, documentContributionType } from './calloutDataMapper';

type ContributionCardData = {
  id: string;
  type: 'post' | 'memo' | 'whiteboard' | 'link' | 'document';
  title: string;
  author?: { name: string; avatarUrl?: string };
  createdDate?: string;
  href?: string;
  description?: string;
  commentCount?: number;
  tags?: string[];
  previewUrl?: string;
  markdownContent?: string;
  /** For memo contributions: the underlying memo id (different from the contribution wrapper id). */
  memoId?: string;
  /** Number of saved signatures that have an actionable PDF document. */
  signedCopiesCount?: number;
  /** For post contributions: the underlying post id (different from the contribution wrapper id). */
  postId?: string;
  linkUrl?: string;
  linkDescription?: string;
  /** For link contributions: the underlying link id (different from the contribution wrapper id). Used by update/delete mutations. */
  linkId?: string;
  /** For link contributions: whether the current user can update this specific link. */
  canEditLink?: boolean;
  /** For link contributions: whether the current user can delete this specific link. */
  canDeleteLink?: boolean;
  /** For link contributions: true when `linkUrl` points to our private storage (uploaded document) rather than an external URL. */
  linkIsFile?: boolean;
  /** For document contributions: the underlying CollaboraDocument id (different from the contribution wrapper id). Opens the editor. */
  documentId?: string;
  /** For document contributions: drives the type-differentiated icon (Word/Sheet/Slide/PDF). */
  documentType?: CollaboraDocumentPreviewType;
};

export type { ContributionCardData };

/** Shape consumed by `ContributionLinkList`. Kept identical across feed + dialog connectors so the mapping lives in one place. */
export type LinkListItem = {
  id: string;
  url: string;
  displayName: string;
  description?: string;
  isFile?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export const mapContributionToLinkItem = (c: ContributionCardData): LinkListItem => ({
  id: c.id,
  url: c.linkUrl ?? '',
  displayName: c.title,
  description: c.linkDescription,
  isFile: c.linkIsFile,
  canEdit: c.canEditLink,
  canDelete: c.canDeleteLink,
});

/**
 * Maps a contribution from the CalloutContributions query (union of post/whiteboard/memo/link)
 * to ContributionCardData. Extracts the correct sub-object from the union.
 */
type ContributionProfileBase = {
  id?: string;
  url?: string;
  displayName: string;
  description?: string | null;
  tagset?: { tags: string[] } | null;
  visual?: { uri: string } | null;
};

type ContributionAuthorBase = {
  id?: string;
  profile?: {
    displayName: string;
    avatar?: { uri: string } | null;
  } | null;
};

type AnyContributionItem = {
  id: string;
  sortOrder?: number;
  post?: {
    id: string;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: ContributionProfileBase;
    comments?: { id: string; messagesCount: number };
  } | null;
  whiteboard?: {
    id: string;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: ContributionProfileBase;
  } | null;
  memo?: {
    id: string;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: { id?: string; url?: string; displayName: string };
    markdown?: string;
    signatures?: Array<{ id: string; document?: { id: string } | null }>;
  } | null;
  link?: {
    id: string;
    uri: string;
    profile: { id?: string; displayName: string; description?: string | null };
    authorization?: { myPrivileges?: string[] };
  } | null;
  collaboraDocument?: {
    id: string;
    documentType?: string;
    previewUrl?: string | null;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: { id?: string; url?: string; displayName: string };
  } | null;
};

function toDateString(date: Date | string | undefined, locale?: Locale): string | undefined {
  // Short localized date (e.g. `05/13/2026` in en-US) — the contribution-card
  // surface only needs the day, not the precise timestamp the server returns.
  return formatShortDate(date, locale);
}

function extractAuthor(createdBy: ContributionAuthorBase | null | undefined) {
  if (!createdBy?.profile) return undefined;
  return {
    name: createdBy.profile.displayName,
    avatarUrl: createdBy.profile.avatar?.uri,
  };
}

export function mapAnyContributionToCardData(
  item: AnyContributionItem,
  locale?: Locale
): ContributionCardData | undefined {
  // Use `item.id` (contribution wrapper ID) — this is the ID the backend uses
  // to look up a contribution inside a callout (e.g. WhiteboardFromCallout query).
  if (item.post) {
    const post = item.post;
    return {
      id: item.id,
      type: 'post',
      title: post.profile.displayName,
      description: post.profile.description ?? undefined,
      href: post.profile.url,
      tags: post.profile.tagset?.tags ?? [],
      previewUrl: post.profile.visual?.uri,
      author: extractAuthor(post.createdBy),
      createdDate: toDateString(post.createdDate, locale),
      commentCount: post.comments?.messagesCount,
      postId: post.id,
    };
  }

  if (item.whiteboard) {
    const wb = item.whiteboard;
    return {
      id: item.id,
      type: 'whiteboard',
      title: wb.profile.displayName,
      href: wb.profile.url,
      previewUrl: wb.profile.visual?.uri,
      author: extractAuthor(wb.createdBy),
      createdDate: toDateString(wb.createdDate, locale),
    };
  }

  if (item.memo) {
    const memo = item.memo;
    return {
      id: item.id,
      type: 'memo',
      title: memo.profile.displayName,
      href: memo.profile.url,
      markdownContent: memo.markdown,
      memoId: memo.id,
      signedCopiesCount: memo.signatures?.filter(signature => signature.document).length ?? 0,
      author: extractAuthor(memo.createdBy),
      createdDate: toDateString(memo.createdDate, locale),
    };
  }

  if (item.link) {
    const link = item.link;
    const privileges = link.authorization?.myPrivileges ?? [];
    return {
      id: item.id,
      type: 'link',
      title: link.profile.displayName,
      linkUrl: link.uri,
      linkDescription: link.profile.description ?? undefined,
      linkId: link.id,
      canEditLink: privileges.includes('UPDATE'),
      canDeleteLink: privileges.includes('DELETE'),
      linkIsFile: isFileAttachmentUrl(link.uri),
    };
  }

  if (item.collaboraDocument) {
    const doc = item.collaboraDocument;
    return {
      id: item.id,
      type: 'document',
      title: doc.profile.displayName,
      href: doc.profile.url,
      documentId: doc.id,
      documentType: toCollaboraPreviewType(doc.documentType),
      previewUrl: doc.previewUrl ?? undefined,
      author: extractAuthor(doc.createdBy),
      createdDate: toDateString(doc.createdDate, locale),
    };
  }

  return undefined;
}

type ResponseContent = NonNullable<ResponseCardFragment['content']>;
type DocumentResponse = Extract<ResponseContent, { __typename: 'DocumentContent' }> | null | undefined;
type LinkResponse = Extract<ResponseContent, { __typename: 'LinkContent' }> | null | undefined;

/** 021 FR-009: one response of a post's preview or window, by its content kind, as the card it renders. */
export function mapResponseToCardData(response: ResponseCardFragment, locale?: Locale): ContributionCardData {
  const base = {
    id: response.id,
    title: response.about.displayName,
    href: response.url ?? undefined,
    author: response.author?.about
      ? { name: response.author.about.displayName, avatarUrl: response.author.about.avatar?.file.url }
      : undefined,
    createdDate: toDateString(response.createdAt, locale),
  };
  if (response.contentKind === 'link') {
    const link = (response.content as LinkResponse)?.link;
    return {
      id: response.id,
      type: 'link',
      title: link?.title ?? response.about.displayName,
      linkUrl: link?.uri,
      linkDescription: link?.description ?? undefined,
      linkId: link?.id,
      canEditLink: response.can.update,
      canDeleteLink: response.can.delete,
      linkIsFile: Boolean(link?.file) || isFileAttachmentUrl(link?.uri ?? ''),
    };
  }
  const document = response.contentKind === 'document' ? (response.content as DocumentResponse)?.document : undefined;
  if (!document) {
    return {
      ...base,
      type: 'post',
      description: response.about.description ?? undefined,
      tags: response.tags,
      commentCount: response.room?.messageCount,
      postId: response.id,
    };
  }
  const type = documentContributionType(document.docType);
  if (type === CalloutContributionType.Whiteboard) {
    return { ...base, type: 'whiteboard', previewUrl: document.preview?.url };
  }
  if (type === CalloutContributionType.Memo) {
    return {
      ...base,
      type: 'memo',
      markdownContent: document.textSnapshot ?? undefined,
      memoId: document.id,
      signedCopiesCount: 0,
    };
  }
  return {
    ...base,
    type: 'document',
    documentId: document.id,
    documentType: toCollaboraPreviewType(collaboraDocumentType(document.docType)),
    previewUrl: document.preview?.url,
  };
}
