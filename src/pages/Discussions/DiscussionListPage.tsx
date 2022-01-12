import { Theme, useMediaQuery } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DiscussionCategorySelector from '../../components/composite/entities/Communication/DiscussionCategorySelector';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionCategoryFilter, useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { DiscussionListView } from '../../views/Discussions/DiscussionsListView';

interface DiscussionsPageProps {}

export const DiscussionListPage: FC<DiscussionsPageProps> = () => {
  const { t } = useTranslation();
  const { communityName } = useCommunityContext();
  const { discussionList, loading, permissions } = useDiscussionsContext();
  const { filtered, categoryFilter, setCategoryFilter } = useDiscussionCategoryFilter(discussionList);

  const mediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  return (
    <DiscussionsLayout
      title={t('components.discussions-list.name', { community: communityName })}
      newUrl={'new'}
      canCreateDiscussion={permissions.canCreateDiscussion}
      categorySelector={
        <DiscussionCategorySelector
          onSelect={selectedCategory => setCategoryFilter(selectedCategory)}
          value={categoryFilter}
          showLabels={!mediumScreen}
        />
      }
    >
      <DiscussionListView
        entities={{
          discussions: filtered,
        }}
        state={{
          loading: loading,
        }}
        actions={{}}
        options={{}}
      />
    </DiscussionsLayout>
  );
};
export default DiscussionListPage;
