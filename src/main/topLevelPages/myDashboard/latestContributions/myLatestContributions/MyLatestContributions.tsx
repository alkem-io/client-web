import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import Gutters from '../../../../../core/ui/grid/Gutters';
import MyActivityBaseView, { MyActivityBaseViewProps } from './MyActivityBaseView';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

const MY_LATEST_CONTRIBUTIONS_COUNT = 4;

const MyLatestContributions = () => {
  const { t } = useTranslation();

  const { data } = useLatestContributionsQuery({
    variables: {
      first: 20,
      myActivity: true,
    },
    errorPolicy: 'all',
  });

  const activities = data?.activityFeed.activityFeed
    .filter(
      activity =>
        activity.type === ActivityEventType.CalloutPublished ||
        activity.type === ActivityEventType.CalloutPostCreated ||
        activity.type === ActivityEventType.CalloutPostComment
    )
    .slice(0, MY_LATEST_CONTRIBUTIONS_COUNT);

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
      <ScrollerWithGradient>
        <Gutters>
          {activities?.map(activity => {
            return <MyActivityBaseView key={activity.id} activity={activity as MyActivityBaseViewProps['activity']} />;
          })}
        </Gutters>
      </ScrollerWithGradient>
    </PageContentBlock>
  );
};

export default MyLatestContributions;
