import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import Gutters from '../../../../../core/ui/grid/Gutters';
import MyActivityView, { MyActivityViewProps } from './MyActivityView';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

const MY_LATEST_CONTRIBUTIONS_COUNT = 4;

const MyLatestContributions = () => {
  const { t } = useTranslation();

  const { data } = useLatestContributionsQuery({
    variables: {
      first: MY_LATEST_CONTRIBUTIONS_COUNT,
      myActivity: true,
      types: [
        ActivityEventType.CalloutPublished,
        ActivityEventType.CalloutPostCreated,
        ActivityEventType.CalloutPostComment,
      ],
    },
    errorPolicy: 'all',
  });

  const activities = data?.activityFeed.activityFeed;

  return (
    <PageContentBlock>
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
