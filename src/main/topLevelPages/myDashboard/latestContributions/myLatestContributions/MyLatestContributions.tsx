import { useEffect, useMemo } from 'react';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import {
  ActivityEventType,
  LatestContributionsQuery,
  LatestContributionsQueryVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import usePaginatedQuery from '../../../../../domain/shared/pagination/usePaginatedQuery';
import { Box } from '@mui/material';
import {
  ActivityLogResultType,
  ActivityViewChooser,
} from '../../../../../domain/collaboration/activity/ActivityLog/ActivityComponent';
import MyActivityViewFooter from '../../../../../domain/collaboration/activity/ActivityLog/views/MyActivityViewFooter';
import { CaptionSmall } from '../../../../../core/ui/typography/components';

const MY_LATEST_CONTRIBUTIONS_COUNT = 4;

const ACTIVITY_TYPES = [
  // Callout-related activities only
  ActivityEventType.CalloutPublished,
  ActivityEventType.CalloutPostCreated,
  ActivityEventType.CalloutPostComment,
  ActivityEventType.CalloutLinkCreated,
  ActivityEventType.CalloutWhiteboardCreated,
  ActivityEventType.DiscussionComment,
];

const MyLatestContributions = () => {
  const { t } = useTranslation();

  const { data, hasMore, loading, fetchMore } = usePaginatedQuery<
    LatestContributionsQuery,
    LatestContributionsQueryVariables
  >({
    useQuery: useLatestContributionsQuery,
    getPageInfo: data => data.activityFeed.pageInfo,
    pageSize: 1,
    firstPageSize: MY_LATEST_CONTRIBUTIONS_COUNT * 2, ////magic number, should not be needed. toDo Fix in https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/gh/alkem-io/server/3626
    variables: {
      filter: {
        myActivity: true,
        types: ACTIVITY_TYPES,
      },
    },
  });

  const activities = useMemo(() => {
    return data?.activityFeed.activityFeed.slice(0, MY_LATEST_CONTRIBUTIONS_COUNT);
  }, [data?.activityFeed.activityFeed]);

  useEffect(() => {
    if (!activities || !hasMore || loading) {
      return;
    }
    if (activities.length < MY_LATEST_CONTRIBUTIONS_COUNT) {
      fetchMore();
    }
  }, [activities, hasMore, loading]);

  return (
    <PageContentBlock halfWidth>
      <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
      <ScrollerWithGradient>
        <Box padding={1}>
          {activities && activities?.length > 0 ? (
            activities.map(activity => (
              <ActivityViewChooser
                key={activity.id}
                activity={activity as ActivityLogResultType}
                journeyUrl={activity.journey?.profile.url ?? ''}
                footerComponent={MyActivityViewFooter}
              />
            ))
          ) : (
            <Box padding={1}>
              <CaptionSmall>{t('pages.home.sections.myLatestContributions.noContributions')}</CaptionSmall>
            </Box>
          )}
        </Box>
      </ScrollerWithGradient>
    </PageContentBlock>
  );
};

export default MyLatestContributions;
