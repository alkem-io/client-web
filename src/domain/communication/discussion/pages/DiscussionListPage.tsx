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
import CategorySelector, { CategoryConfig } from '../components/CategorySelector';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { useDiscussionsContext } from '../providers/DiscussionsProvider';
import { DiscussionListView } from '../views/DiscussionsListView';
import { PageProps } from '../../../shared/types/PageProps';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';

interface DiscussionsPageProps extends PageProps {}

// TODO use for Discussions Dialog?
/**
 * @deprecated
 * delete me
 */
export const DiscussionListPage: FC<DiscussionsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { discussionList, loading, permissions } = useDiscussionsContext();

  const showAllTitle = t('common.show-all');

  const categoryConfig = useMemo<CategoryConfig[]>(
    () => [
      { id: 'ALL', title: showAllTitle, icon: AllInclusive },
      { id: 'GENERAL', title: t('common.enums.discussion-category.GENERAL'), icon: QuestionAnswerOutlined },
      { id: 'IDEAS', title: t('common.enums.discussion-category.IDEAS'), icon: LightbulbOutlined },
      { id: 'QUESTIONS', title: t('common.enums.discussion-category.QUESTIONS'), icon: HelpOutlined },
      { id: 'SHARING', title: t('common.enums.discussion-category.SHARING'), icon: ShareOutlined },
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
