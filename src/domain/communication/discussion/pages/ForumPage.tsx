import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategorySelector from '../components/CategorySelector';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { DiscussionListView } from '../views/DiscussionsListView';
import TopLevelPageLayout from '../../../../main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import {
  CommunicationDiscussionUpdatedDocument,
  usePlatformDiscussionsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Discussion, useDiscussionMapper } from '../models/Discussion';
import { compact } from 'lodash';
import {
  AuthorizationPrivilege,
  CommunicationDiscussionUpdatedSubscription,
  CommunicationDiscussionUpdatedSubscriptionVariables,
  DiscussionCategory,
  PlatformDiscussionsQuery,
} from '../../../../core/apollo/generated/graphql-schema';
import DiscussionIcon from '../views/DiscussionIcon';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../constants/DiscusionCategories';
import NewDiscussionDialog from '../views/NewDiscussionDialog';
import { useUserContext } from '../../../community/user';
import ImageBackdrop from '../../../shared/components/Backdrops/ImageBackdrop';
import UseSubscriptionToSubEntity from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';
import useInnovationHubOutsideRibbon from '../../../innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { ForumOutlined } from '@mui/icons-material';
import BreadcrumbsItem from '../../../../core/ui/navigation/BreadcrumbsItem';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { BlockTitle } from '../../../../core/ui/typography';

const ALL_CATEGORIES = DiscussionCategoryExtEnum.All;
const FORUM_GRAYED_OUT_IMAGE = '/forum/forum-grayed.png';

const useSubscriptionToCommunication = UseSubscriptionToSubEntity<
  PlatformDiscussionsQuery['platform']['communication'],
  CommunicationDiscussionUpdatedSubscription,
  CommunicationDiscussionUpdatedSubscriptionVariables
>({
  subscriptionDocument: CommunicationDiscussionUpdatedDocument,
  getSubscriptionVariables: communication => ({ communicationID: communication.id }),
  updateSubEntity: (communication, subscriptionData) => {
    if (!communication?.discussions) {
      return;
    }
    const discussion = communication.discussions.find(d => d.id === subscriptionData.communicationDiscussionUpdated.id);
    if (!discussion) {
      return;
    }
    Object.assign(discussion, subscriptionData.communicationDiscussionUpdated);
  },
});

interface ForumPageProps {
  dialog?: 'new';
}

export const ForumPage: FC<ForumPageProps> = ({ dialog }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: { hasPlatformPrivilege } = {}, isAuthenticated, loading: loadingUser } = useUserContext();

  const [categorySelected, setCategorySelected] = useState<DiscussionCategoryExt>(ALL_CATEGORIES);
  const { data, loading: loadingDiscussions, subscribeToMore } = usePlatformDiscussionsQuery();
  useSubscriptionToCommunication(data, data => data?.platform.communication, subscribeToMore);

  const isGlobalAdmin = hasPlatformPrivilege?.(AuthorizationPrivilege.GrantGlobalAdmins);
  const validCategories =
    (isGlobalAdmin
      ? data?.platform.communication.discussionCategories
      : data?.platform.communication.discussionCategories?.filter(
          category => category !== DiscussionCategory.Releases
        )) ?? [];
  const communicationId = data?.platform.communication.id;

  const canCreateDiscussion =
    data?.platform.communication.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateDiscussion) ??
    false;

  const { discussionMapper } = useDiscussionMapper(
    compact(data?.platform.communication.discussions?.map(d => d.createdBy))
  );

  const discussions = useMemo(() => {
    return (
      data?.platform.communication.discussions
        ?.filter(d => categorySelected === ALL_CATEGORIES || d.category === categorySelected)
        .map<Discussion>(discussionMapper) ?? []
    );
  }, [data, discussionMapper, categorySelected]);

  const categories = useMemo(
    () => [
      {
        id: ALL_CATEGORIES,
        title: t('common.show-all'),
        icon: <DiscussionIcon category={ALL_CATEGORIES} />,
      },
      ...validCategories?.map(id => ({
        id: id,
        title: t(`common.enums.discussion-category.${id}` as const),
        icon: <DiscussionIcon category={id} />,
      })),
    ],
    [validCategories, t]
  );

  const mediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));
  const loading = loadingDiscussions || loadingUser;

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.forum' });

  const handleClickDiscussion = (discussionUrl: string) => {
    navigate(discussionUrl);
  };

  return (
    <StorageConfigContextProvider locationType="platform">
      <TopLevelPageLayout
        title={t('pages.forum.title')}
        subtitle={t('pages.forum.subtitle')}
        iconComponent={ForumOutlined}
        ribbon={ribbon}
        breadcrumbs={
          <TopLevelPageBreadcrumbs>
            <BreadcrumbsItem iconComponent={ForumOutlined} uri="/forum">
              {t('pages.forum.shortName')}
            </BreadcrumbsItem>
          </TopLevelPageBreadcrumbs>
        }
      >
        {!loading && !isAuthenticated ? (
          <ImageBackdrop
            src={FORUM_GRAYED_OUT_IMAGE}
            backdropMessage={'login'}
            blockName={'all-contributing-users'}
            imageSx={{ filter: 'blur(2px)' }}
            messageSx={theme => ({
              [theme.breakpoints.up('sm')]: {
                fontWeight: 'bold',
              },
              [theme.breakpoints.up('lg')]: {
                marginTop: theme.spacing(10),
                marginBottom: theme.spacing(-10),
              },
            })}
          />
        ) : (
          <DiscussionsLayout
            canCreateDiscussion={!loading && canCreateDiscussion}
            categorySelector={
              <CategorySelector
                categories={categories}
                onSelect={setCategorySelected}
                value={categorySelected}
                showLabels={!mediumScreen}
              />
            }
          >
            <BlockTitle>{t('components.discussions-list.title', { count: discussions.length })}</BlockTitle>
            <DiscussionListView
              entities={{
                discussions,
              }}
              state={{
                loading: loading,
              }}
              actions={{
                onClickDiscussion: discussion => handleClickDiscussion(discussion.url),
              }}
              options={{
                filterEnabled: true,
              }}
            />
            {!loading && communicationId && (
              <NewDiscussionDialog
                communicationId={communicationId}
                categories={validCategories}
                open={dialog === 'new'}
                onClose={() => navigate('/forum')}
              />
            )}
          </DiscussionsLayout>
        )}
      </TopLevelPageLayout>
    </StorageConfigContextProvider>
  );
};

export default ForumPage;
