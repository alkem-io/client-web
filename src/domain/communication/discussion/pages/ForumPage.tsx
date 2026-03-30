import { ForumOutlined } from '@mui/icons-material';
import { compact } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { ForumDiscussionUpdatedDocument, usePlatformDiscussionsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  ForumDiscussionCategory,
  type ForumDiscussionUpdatedSubscription,
  type ForumDiscussionUpdatedSubscriptionVariables,
  type PlatformDiscussionsQuery,
} from '@/core/apollo/generated/graphql-schema';
import UseSubscriptionToSubEntity from '@/core/apollo/subscriptions/useSubscriptionToSubEntity';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useScreenSize } from '@/core/ui/grid/constants';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { BlockTitle } from '@/core/ui/typography';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useInnovationHubOutsideRibbon from '@/domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import CategorySelector from '../components/CategorySelector';
import { type DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../constants/DiscusionCategories';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { type Discussion, useDiscussionMapper } from '../models/Discussion';
import DiscussionIcon from '../views/DiscussionIcon';
import { DiscussionListView } from '../views/DiscussionsListView';
import NewDiscussionDialog from '../views/NewDiscussionDialog';

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

  // @ts-expect-error react-18
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

  const discussions = (() => {
    return (
      data?.platform.forum.discussions
        ?.filter(d => categorySelected === ALL_CATEGORIES || d.category === categorySelected)
        .map<Discussion>(discussionMapper) ?? []
    );
  })();

  const categories = [
    {
      id: ALL_CATEGORIES,
      title: t('common.show-all'),
      icon: <DiscussionIcon category={ALL_CATEGORIES} />,
    },
    ...(validCategories?.map(id => ({
      id: id,
      title: t(`common.enums.discussion-category.${id}` as const),
      icon: <DiscussionIcon category={id} />,
    })) ?? []),
  ];

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
            filterEnabled={true}
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
