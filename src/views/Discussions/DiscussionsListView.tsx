import { List } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../../components/Admin/Common/Filter';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import DiscussionOverview, {
  DiscussionOverviewProps,
} from '../../components/composite/entities/Communication/DiscussionOverview';
import { DiscussionDetailsFragment } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';

interface DiscussionListViewEntities {
  discussions: DiscussionDetailsFragment[];
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

export const DiscussionListView: FC<DiscussionListViewProps> = ({ entities }) => {
  const { t } = useTranslation();

  const { discussions } = entities;

  const data = discussions.map<DiscussionOverviewProps>(x => ({
    id: x.id,
    title: x.title,
    description: '',
    date: new Date(),
    avatars: [],
    count: 0,
  }));

  return (
    <ProfileCard title={t('common.discussions')} helpText={t('components.discussions-list.help')}>
      <Filter data={data} sort={[{ key: 'date', name: 'Date' }]}>
        {filteredData => (
          <List>
            {filteredData.map((item, index) => (
              <DiscussionOverview key={index} {...item} />
            ))}
          </List>
        )}
      </Filter>
    </ProfileCard>
  );
};
