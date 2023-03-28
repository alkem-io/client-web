import { List, ListItemText } from '@mui/material';
import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../../../platform/admin/components/Common/Filter';
import DiscussionOverview from './DiscussionOverview';
import { Discussion } from '../models/Discussion';
import { ViewProps } from '../../../../core/container/view';
import { BlockTitle } from '../../../../core/ui/typography';

interface DiscussionListViewEntities {
  discussions: Discussion[];
}
interface DiscussionListViewState {
  loading: boolean;
}
interface DiscussionListViewActions {}
interface DiscussionListViewOptions {}

interface DiscussionListViewProps
  extends ViewProps<
    DiscussionListViewEntities,
    DiscussionListViewActions,
    DiscussionListViewState,
    DiscussionListViewOptions
  > {}

export const DiscussionListView: FC<DiscussionListViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();

  const { discussions } = entities;
  const { loading } = state;

  return (
    <>
      <BlockTitle>{t('components.discussions-list.title', { count: discussions.length })}</BlockTitle>
      {loading && (
        <List>
          <ListItemText
            primary={<Skeleton />}
            secondary={
              <>
                <Skeleton />
                <Skeleton />
              </>
            }
          />
        </List>
      )}
      {!loading && (
        <Filter
          data={discussions}
          limitKeys={['title']}
          sort={[
            { key: 'createdAt', name: 'Newest', order: 'desc', default: true },
            { key: 'createdAt', name: 'Oldest', order: 'asc' },
          ]}
        >
          {filteredData => (
            <List>
              {filteredData.map((item, index) => (
                <DiscussionOverview key={index} discussion={item} />
              ))}
            </List>
          )}
        </Filter>
      )}
    </>
  );
};
