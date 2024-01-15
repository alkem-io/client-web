import { useEffect, useMemo } from 'react';
import { uniqBy } from 'lodash';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import Gutters from '../../../../../core/ui/grid/Gutters';
import MyActivityView, { MyActivityViewProps } from './MyActivityView';
import {
  ActivityEventType,
  LatestContributionsQuery,
  LatestContributionsQueryVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import usePaginatedQuery from '../../../../../domain/shared/pagination/usePaginatedQuery';

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
    firstPageSize: MY_LATEST_CONTRIBUTIONS_COUNT,
    variables: {
      filter: {
        myActivity: true,
        types: ACTIVITY_TYPES,
      },
    },
  });

  const activities = useMemo(() => {
    return uniqBy(data?.activityFeed.activityFeed, activityItem => {
      return (activityItem as { callout?: Identifiable }).callout?.id;
    }).slice(0, MY_LATEST_CONTRIBUTIONS_COUNT);
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
        <Gutters>
          {activities?.map(activity => {
            return <MyActivityView key={activity.id} activity={activity as MyActivityViewProps['activity']} />;
          })}
        </Gutters>
      </ScrollerWithGradient>
    </PageContentBlock>
  );
};

export default MyLatestContributions;
