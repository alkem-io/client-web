import { List, ListItemText } from '@mui/material';
import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../../components/Admin/Common/Filter';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';
import { Discussion } from '../../models/discussion/discussion';
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
    <ProfileCard title={t('common.discussions')} helpText={t('components.discussions-list.help')}>
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
        <Filter data={discussions} sort={[{ key: 'createdAt', name: 'Date' }]}>
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
