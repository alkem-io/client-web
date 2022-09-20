import { List, ListItemText } from '@mui/material';
import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../../domain/admin/components/Common/Filter';
import ProfileCard from '../../common/components/composite/common/cards/ProfileCard/ProfileCard';
import DiscussionOverview from '../../common/components/composite/entities/Communication/DiscussionOverview';
import { Discussion } from '../../domain/communication/discussion/models/discussion';
import { ViewProps } from '../../models/view';

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
    <ProfileCard
      title={t('components.discussions-list.title', { count: discussions.length })}
      helpText={t('components.discussions-list.help')}
    >
      {loading && (
        <List>
          <ListItemText
            primary={<Skeleton animation="wave" />}
            secondary={
              <>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
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
    </ProfileCard>
  );
};
