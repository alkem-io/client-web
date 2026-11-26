import {
  CalloutContributionType,
  CalloutFramingType,
  type CalloutsIndexListQuery,
} from '@/core/apollo/generated/graphql-schema';
import { DocType, type PostCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import type { CalloutListItem } from '@/crd/components/callout/CalloutListView';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { type CrdSpaceTranslator, responseContributionType } from './calloutDataMapper';

type IndexCallout = NonNullable<CalloutsIndexListQuery['lookup']['calloutsSet']>['callouts'][number];

/**
 * Bracketed response count i18n keys — kept in parity with
 * `CONTRIBUTION_COUNT_KEY` in `calloutDataMapper.ts`. The Post Index renders the
 * same "(2 memos)" summary as the inline list rows.
 */
const CONTRIBUTION_COUNT_KEY = {
  [CalloutContributionType.Post]: 'knowledge.count.post',
  [CalloutContributionType.Whiteboard]: 'knowledge.count.whiteboard',
  [CalloutContributionType.Memo]: 'knowledge.count.memo',
  [CalloutContributionType.Link]: 'knowledge.count.link',
  [CalloutContributionType.CollaboraDocument]: 'knowledge.count.document',
} as const satisfies Record<CalloutContributionType, string>;

function formatResponseMeta(callout: IndexCallout, t: CrdSpaceTranslator): string | undefined {
  const count = callout.activity ?? 0;
  const contributionType = callout.settings.contribution.allowedTypes[0];
  if (count <= 0 || !contributionType) {
    return undefined;
  }
  return t(CONTRIBUTION_COUNT_KEY[contributionType], { count });
}

/**
 * Maps the lazy Post Index query result to the `CalloutListView` rows, sorted by
 * the same sort order the feed uses so the index mirrors the feed's ordering.
 */
export function mapPostIndexToListItems(
  callouts: IndexCallout[],
  tabSectionNumber: number,
  t: CrdSpaceTranslator
): CalloutListItem[] {
  return [...callouts]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(callout => {
      const url = callout.framing.profile.url;
      return {
        id: callout.id,
        title: callout.framing.profile.displayName,
        type: callout.framing.type === CalloutFramingType.Whiteboard ? 'whiteboard' : 'text',
        href: url ? buildSpaceSectionUrl(url, tabSectionNumber) : undefined,
        meta: formatResponseMeta(callout, t),
      };
    });
}

/** An index row: one of the space's own posts in its space tree (SpaceTree). */
type IndexRow = PostCardFragment;

type IndexDocument = { document?: { docType: DocType } } | null | undefined;

/** 021 D9: the index rows of one stage, in server order, with the legacy response-count meta. */
export function mapPostIndexRowsToListItems(
  rows: IndexRow[],
  tabSectionNumber: number,
  t: CrdSpaceTranslator
): CalloutListItem[] {
  return rows.map(row => {
    const responseType = responseContributionType(row.responseKind, row.responsePolicy);
    const docType = row.contentKind === 'document' ? (row.content as IndexDocument)?.document?.docType : undefined;
    return {
      id: row.id,
      title: row.about.displayName,
      type: docType === DocType.Excalidraw ? 'whiteboard' : 'text',
      href: row.url ? buildSpaceSectionUrl(row.url, tabSectionNumber) : undefined,
      meta:
        responseType && row.responseCount > 0
          ? t(CONTRIBUTION_COUNT_KEY[responseType], { count: row.responseCount })
          : undefined,
    };
  });
}
