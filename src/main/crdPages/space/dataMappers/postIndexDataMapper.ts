import {
  CalloutContributionType,
  CalloutFramingType,
  type CalloutsIndexListQuery,
} from '@/core/apollo/generated/graphql-schema';
import type { CalloutListItem } from '@/crd/components/callout/CalloutListView';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import type { CrdSpaceTranslator } from './calloutDataMapper';

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
