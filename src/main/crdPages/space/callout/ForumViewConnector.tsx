import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForumCalloutListQuery } from '@/core/apollo/generated/apollo-hooks';
import { type ForumRow, ForumView } from '@/crd/components/space/ForumView';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { formatRelativeDate } from '../dataMappers/calloutDataMapper';
import { ForumCalloutDialog } from './ForumCalloutDialog';

type ForumViewConnectorProps = {
  calloutsSetId: string | undefined;
  classificationTagsets: ClassificationTagsetModel[];
};

/**
 * Forum mode (POC) integration. Eagerly loads every callout in the flow state,
 * maps them to forum rows, owns the client-side title/author/description search,
 * and opens the standard callout detail dialog when a row is clicked.
 */
export function ForumViewConnector({ calloutsSetId, classificationTagsets }: ForumViewConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [search, setSearch] = useState('');
  const [openCalloutId, setOpenCalloutId] = useState<string | undefined>();

  const { data, loading } = useForumCalloutListQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    fetchPolicy: 'cache-and-network',
    skip: !calloutsSetId,
  });

  const callouts = data?.lookup.calloutsSet?.callouts ?? [];

  // Map once to a searchable row, then filter. Author + date fall back from the
  // published-* fields to the created-* fields (same precedence as the feed).
  const rows: ForumRow[] = [...callouts]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(callout => {
      const authorProfile = (callout.publishedBy ?? callout.createdBy)?.profile;
      const date = callout.publishedDate ?? callout.createdDate;
      return {
        id: callout.id,
        title: callout.framing.profile.displayName,
        description: callout.framing.profile.description ?? '',
        authorName: authorProfile?.displayName,
        authorAvatarUrl: authorProfile?.avatar?.uri,
        timestamp: date ? formatRelativeDate(new Date(date), t) : undefined,
        commentCount: callout.comments?.messagesCount ?? 0,
      };
    });

  const query = search.trim().toLowerCase();
  const filtered: ForumRow[] = query
    ? rows.filter(
        row =>
          row.title.toLowerCase().includes(query) ||
          (row.description ?? '').toLowerCase().includes(query) ||
          (row.authorName ?? '').toLowerCase().includes(query)
      )
    : rows;

  return (
    <>
      <ForumView
        rows={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={setOpenCalloutId}
        loading={loading && callouts.length === 0}
        searchPlaceholder={t('forum.searchPlaceholder')}
        searchAriaLabel={t('forum.searchLabel')}
        columns={{
          title: t('forum.columns.title'),
          author: t('forum.columns.author'),
          date: t('forum.columns.date'),
          comments: t('forum.columns.comments'),
        }}
        emptyLabel={t('forum.empty')}
        listLabel={t('forum.listLabel')}
        commentCountLabel={count => t('forum.commentCount', { count })}
      />

      <ForumCalloutDialog
        calloutId={openCalloutId}
        calloutsSetId={calloutsSetId}
        onClose={() => setOpenCalloutId(undefined)}
      />
    </>
  );
}
