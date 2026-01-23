import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useScreenSize } from '@/core/ui/grid/constants';
import useNavigate from '@/core/routing/useNavigate';
import CategorySelector from '../components/CategorySelector';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { DiscussionListView } from '../views/DiscussionsListView';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import { ForumDiscussionUpdatedDocument, usePlatformDiscussionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { Discussion, useDiscussionMapper } from '../models/Discussion';
import { compact } from 'lodash';
import {
  AuthorizationPrivilege,
  ForumDiscussionUpdatedSubscription,
  ForumDiscussionUpdatedSubscriptionVariables,
  ForumDiscussionCategory,
  PlatformDiscussionsQuery,
} from '@/core/apollo/generated/graphql-schema';
import DiscussionIcon from '../views/DiscussionIcon';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../constants/DiscusionCategories';
import NewDiscussionDialog from '../views/NewDiscussionDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import UseSubscriptionToSubEntity from '@/core/apollo/subscriptions/useSubscriptionToSubEntity';
import useInnovationHubOutsideRibbon from '@/domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { ForumOutlined } from '@mui/icons-material';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { BlockTitle } from '@/core/ui/typography';
import { usePageTitle } from '@/core/routing/usePageTitle';

const ALL_CATEGORIES = DiscussionCategoryExtEnum.All;

const useSubscriptionToForum = UseSubscriptionToSubEntity<
  PlatformDiscussionsQuery['platform']['forum'],
  ForumDiscussionUpdatedSubscription,
  ForumDiscussionUpdatedSubscriptionVariables
>({
  subscriptionDocument: ForumDiscussionUpdatedDocument,
  getSubscriptionVariables: forum => ({ forumID: forum.id }),
  updateSubEntity: (communication, subscriptionData) => {
    if (!communication?.discussions) {
      return;
    }
    const discussion = communication.discussions.find(d => d.id === subscriptionData.forumDiscussionUpdated.id);
    if (!discussion) {
      return;
    }
    Object.assign(discussion, subscriptionData.forumDiscussionUpdated);
  },
});

enum DiscussionCategoryPlatform {
  RELEASES = 'releases',
  PLATFORM_FUNCTIONALITIES = 'platform-functionalities',
  COMMUNITY_BUILDING = 'community-building',
  CHALLENGE_CENTRIC = 'challenge-centric',
  HELP = 'help',
  OTHER = 'other',
}

export const ForumPage = ({
  dialog,
  categorySelected = ALL_CATEGORIES,
}: {
  dialog?: 'new';
  categorySelected?: DiscussionCategoryExt;
}) => {
  const { t } = useTranslation();

  // Set browser tab title to "Forum | Alkemio"
  usePageTitle(t('pages.titles.forum'));

  const navigate = useNavigate();
  const { platformPrivilegeWrapper: { hasPlatformPrivilege } = {}, loading: loadingUser } = useCurrentUserContext();

  const { data, loading: loadingDiscussions, subscribeToMore } = usePlatformDiscussionsQuery();

  // @ts-ignore react-18
  useSubscriptionToForum(data, data => data?.platform.forum, subscribeToMore);

  const isPlatformAdmin = hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);
  const validCategories = data?.platform.forum.discussionCategories ?? [];
  const discussionCreationCategories =
    (isPlatformAdmin
      ? data?.platform.forum.discussionCategories
      : data?.platform.forum.discussionCategories?.filter(category => category !== ForumDiscussionCategory.Releases)) ??
    [];
  const communicationId = data?.platform.forum.id;

  const canCreateDiscussion =
    data?.platform.forum.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateDiscussion) ?? false;

  const { discussionMapper } = useDiscussionMapper(compact(data?.platform.forum.discussions?.map(d => d.createdBy)));

  const discussions = useMemo(() => {
    return (
      data?.platform.forum.discussions
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

  const { isLargeScreen } = useScreenSize();
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
        <DiscussionsLayout
          canCreateDiscussion={!loading && canCreateDiscussion}
          categorySelector={
            <CategorySelector
              categories={categories}
              onSelect={category => {
                navigate(
                  Object.keys(DiscussionCategoryPlatform).includes(category)
                    ? `/forum/${DiscussionCategoryPlatform[category]}`
                    : '/forum'
                );
              }}
              value={categorySelected}
              showLabels={isLargeScreen}
            />
          }
        >
          <BlockTitle>{t('components.discussions-list.title', { count: discussions.length })}</BlockTitle>
          <DiscussionListView
            discussions={discussions}
            loading={loading}
            onClickDiscussion={discussion => handleClickDiscussion(discussion.url)}
            filterEnabled
          />
          {!loading && communicationId && (
            <NewDiscussionDialog
              forumId={communicationId}
              categories={discussionCreationCategories}
              open={dialog === 'new'}
              onClose={() => navigate('/forum')}
            />
          )}
        </DiscussionsLayout>
      </TopLevelPageLayout>
    </StorageConfigContextProvider>
  );
};

export default ForumPage;
