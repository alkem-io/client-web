import { List, ListItemText } from '@mui/material';
import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { Filter } from '../../../platform/admin/components/Common/Filter';
import DiscussionOverview from './DiscussionOverview';
import { Discussion } from '../models/Discussion';
import { ViewProps } from '@/core/container/view';

interface DiscussionListViewEntities {
  discussions: Discussion[];
}

interface DiscussionListViewState {
  loading: boolean;
}

interface DiscussionListViewActions {
  onClickDiscussion: (discussion: Discussion) => void;
}

interface DiscussionListViewOptions {
  filterEnabled: boolean;
}

interface DiscussionListViewProps
  extends ViewProps<
    DiscussionListViewEntities,
    DiscussionListViewActions,
    DiscussionListViewState,
    DiscussionListViewOptions
  > {}

export const DiscussionListView: FC<DiscussionListViewProps> = ({ entities, state, actions, options }) => {
  const { discussions } = entities;
  const { loading } = state;

  return (
    <>
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
      {!loading && options.filterEnabled && (
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
                <DiscussionOverview key={index} discussion={item} onClick={actions.onClickDiscussion} />
              ))}
            </List>
          )}
        </Filter>
      )}
      {!loading && !options.filterEnabled && (
        <List>
          {discussions.map((item, index) => (
            <DiscussionOverview key={index} discussion={item} onClick={actions.onClickDiscussion} />
          ))}
        </List>
      )}
    </>
  );
};
