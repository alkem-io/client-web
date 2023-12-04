import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import ScrollerWithGradient from '../../../../core/ui/overflow/ScrollerWithGradient';
import { useLatestContributionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  ActivityLogResultType,
  ActivityViewChooser,
} from '../../../../domain/shared/components/ActivityLog/ActivityComponent';
import Gutters from '../../../../core/ui/grid/Gutters';

const MY_LATEST_CONTRIBUTIONS_COUNT = 4;

const MyLatestContributions = () => {
  const { t } = useTranslation();

  const { data } = useLatestContributionsQuery({
    variables: {
      first: MY_LATEST_CONTRIBUTIONS_COUNT,
      myActivity: true,
    },
  });

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
      <ScrollerWithGradient>
        <Gutters>
          {data?.activityFeed.activityFeed.map(activity => {
            return (
              <ActivityViewChooser
                key={activity.id}
                activity={activity as ActivityLogResultType}
                journeyTypeName="space"
                journeyLocation={{ spaceNameId: activity.parentNameID }}
              />
            );
          })}
        </Gutters>
      </ScrollerWithGradient>
    </PageContentBlock>
  );
};

export default MyLatestContributions;
