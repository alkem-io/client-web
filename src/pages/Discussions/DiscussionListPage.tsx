import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, useMediaQuery } from '@mui/material';
import {
  HelpOutlined,
  LightbulbOutlined,
  QuestionAnswerOutlined,
  ShareOutlined,
  AllInclusive,
} from '@mui/icons-material';
import CategorySelector, {
  CategoryConfig,
} from '../../common/components/composite/common/CategorySelector/CategorySelector';
import DiscussionsLayout from '../../common/components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../domain/community/CommunityContext';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { DiscussionListView } from '../../views/Discussions/DiscussionsListView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

interface DiscussionsPageProps extends PageProps {}

// TODO use for Discussions Dialog?
export const DiscussionListPage: FC<DiscussionsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { communityName } = useCommunityContext();
  const { discussionList, loading, permissions } = useDiscussionsContext();

  const showAllTitle = t('common.show-all');

  const categoryConfig = useMemo<CategoryConfig[]>(
    () => [
      { title: showAllTitle, icon: AllInclusive },
      { title: t('common.enums.discussion-category.GENERAL'), icon: QuestionAnswerOutlined },
      { title: t('common.enums.discussion-category.IDEAS'), icon: LightbulbOutlined },
      { title: t('common.enums.discussion-category.QUESTIONS'), icon: HelpOutlined },
      { title: t('common.enums.discussion-category.SHARING'), icon: ShareOutlined },
    ],
    [showAllTitle, t]
  );

  const [category, setCategory] = useState<string>(categoryConfig[0].title);
  const shouldSkipFiltering = !category || category === showAllTitle;

  const filtered = useMemo(
    () => (shouldSkipFiltering ? discussionList : discussionList?.filter(d => d.category === category)),
    [discussionList, category, shouldSkipFiltering]
  );

  const mediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  useUpdateNavigation({ currentPaths: paths });

  return (
    <DiscussionsLayout
      title={t('components.discussions-list.name', { community: communityName })}
      newUrl={'new'}
      canCreateDiscussion={permissions.canCreateDiscussion}
      categorySelector={
        <CategorySelector
          categories={categoryConfig}
          onSelect={setCategory}
          value={category}
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
