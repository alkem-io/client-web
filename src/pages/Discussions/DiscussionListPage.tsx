import { Theme, useMediaQuery } from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CategorySelector, {
  CATEGORY_ALL,
  CategoryConfig,
} from '../../components/composite/common/CategorySelector/CategorySelector';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { DiscussionListView } from '../../views/Discussions/DiscussionsListView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import { HelpOutlined, LightbulbOutlined, QuestionAnswerOutlined, ShareOutlined } from '@mui/icons-material';

const categoryConfig: CategoryConfig[] = [
  { title: 'General', icon: QuestionAnswerOutlined },
  { title: 'Ideas', icon: LightbulbOutlined },
  { title: 'Questions', icon: HelpOutlined },
  { title: 'Sharing', icon: ShareOutlined },
];

interface DiscussionsPageProps extends PageProps {}

export const DiscussionListPage: FC<DiscussionsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { communityName } = useCommunityContext();
  const { discussionList, loading, permissions } = useDiscussionsContext();

  const [category, setCategory] = useState<string>();

  const filtered = useMemo(
    () => discussionList?.filter(d => category === CATEGORY_ALL || d.category === category),
    [discussionList, category]
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
