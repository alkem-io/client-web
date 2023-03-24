import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategorySelector from '../components/CategorySelector';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { DiscussionListView } from '../views/DiscussionsListView';
import TopLevelDesktopLayout from '../../../platform/ui/PageLayout/TopLevelDesktopLayout';
import { usePlatformDiscussionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Discussion } from '../models/Discussion';
import { useAuthorsDetails } from '../../communication/useAuthorsDetails';
import { compact } from 'lodash';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import DiscussionIcon from '../views/DiscussionIcon';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum, ForumCategories } from '../constants/DiscusionCategories';
import NewDiscussionDialog from '../views/NewDiscussionDialog';

const ALL_CATEGORIES = DiscussionCategoryExtEnum.All;

interface ForumPageProps {
  dialog?: 'new' | undefined;
}

export const ForumPage: FC<ForumPageProps> = ({ dialog }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [categorySelected, setCategorySelected] = useState<DiscussionCategoryExt>(ALL_CATEGORIES);
  const { data, loading } = usePlatformDiscussionsQuery();

  const communicationId = data?.platform.communication.id;

  const canCreateDiscussion =
    data?.platform.communication.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateDiscussion) ??
    false;

  const authors = useAuthorsDetails(compact(data?.platform.communication.discussions?.map(d => d.createdBy)));

  const discussions = useMemo(() => {
    return (
      data?.platform.communication.discussions
        ?.filter(d => categorySelected === ALL_CATEGORIES || d.category === categorySelected)
        .map<Discussion>(d => ({
          id: d.id,
          title: d.title,
          category: d.category,
          myPrivileges: d.authorization?.myPrivileges,
          author: d.createdBy ? authors.getAuthor(d.createdBy) : undefined,
          authors: authors.authors ?? [],
          description: d.description,
          createdAt: d.timestamp ? new Date(d.timestamp) : undefined,
          commentsCount: d.commentsCount,
        })) ?? []
    );
  }, [data, authors, authors.authors, categorySelected]);

  const categories = useMemo(
    () => [
      {
        id: ALL_CATEGORIES,
        title: t('common.show-all'),
        icon: <DiscussionIcon category={ALL_CATEGORIES} />,
      },
      ...ForumCategories.map(id => ({
        id: id,
        title: t(`common.enums.discussion-category.${id}` as const),
        icon: <DiscussionIcon category={id} />,
      })),
    ],
    [t]
  );

  const mediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));
  return (
    <TopLevelDesktopLayout>
      <DiscussionsLayout
        canCreateDiscussion={canCreateDiscussion}
        categorySelector={
          <CategorySelector
            categories={categories}
            onSelect={setCategorySelected}
            value={categorySelected}
            showLabels={!mediumScreen}
          />
        }
      >
        <DiscussionListView
          entities={{
            discussions,
          }}
          state={{
            loading: loading,
          }}
          actions={{}}
          options={{}}
        />
        {!loading && communicationId && (
          <NewDiscussionDialog
            communicationId={communicationId}
            categories={ForumCategories}
            open={dialog === 'new'}
            onClose={() => navigate('/forum')}
          />
        )}
      </DiscussionsLayout>
    </TopLevelDesktopLayout>
  );
};

export default ForumPage;
