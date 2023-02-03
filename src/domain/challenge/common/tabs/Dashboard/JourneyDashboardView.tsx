import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import References from '../../../../shared/components/References/References';
import { DashboardTopCalloutFragment, Reference } from '../../../../../core/apollo/generated/graphql-schema';
import { buildCalloutUrl, buildHubUrl, JourneyLocation } from '../../../../../common/utils/urlBuilders';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import withOptionalCount from '../../../../shared/utils/withOptionalCount';
import EntityDashboardLeadsSection from '../../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { ActivityComponent, ActivityLogResultType } from '../../../../shared/components/ActivityLog';
import ShareButton from '../../../../shared/components/ShareDialog/ShareButton';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import JourneyDashboardVision from './JourneyDashboardVision';
import { CoreEntityIdTypes } from '../../../../shared/types/CoreEntityIds';
import { Identifiable } from '../../../../shared/types/Identifiable';
import { JourneyTypeName } from '../../../JourneyTypeName';
import TopCalloutDetails from '../../../../collaboration/callout/TopCallout/TopCalloutDetails';
import { RecommendationIcon } from '../../../../shared/components/References/icons/RecommendationIcon';
import getChildJourneyRoute from '../../utils/getChildJourneyRoute';
import ScrollableCardsLayout from '../../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import DashboardCalendarSection from '../../../../shared/components/DashboardSections/DashboardCalendarSection';
import { Caption } from '../../../../../core/ui/typography/components';

export interface JourneyDashboardViewProps<ChildEntity extends Identifiable>
  extends EntityDashboardContributors,
    EntityDashboardLeads,
    Partial<CoreEntityIdTypes> {
  vision?: string;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
  community?: unknown;
  communityReadAccess?: boolean;
  timelineReadAccess?: boolean;
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  childEntities?: ChildEntity[];
  entityReadAccess?: boolean;
  readUsersAccess?: boolean;
  childEntitiesCount?: number;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  journeyTypeName: JourneyTypeName;
  childEntityTitle?: string;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
}

const JourneyDashboardView = <ChildEntity extends Identifiable>({
  vision = '',
  hubNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  childEntitiesCount,
  references,
  recommendations,
  communityReadAccess = false,
  timelineReadAccess = false,
  entityReadAccess = false,
  readUsersAccess = false,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  leadOrganizations,
  leadUsers,
  activities,
  activityLoading,
  childEntities = [],
  renderChildEntityCard,
  journeyTypeName,
  childEntityTitle,
  topCallouts,
}: JourneyDashboardViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  const journeyLocation: JourneyLocation | undefined =
    typeof hubNameId === 'undefined'
      ? undefined
      : {
          hubNameId,
          challengeNameId,
          opportunityNameId,
        };

  const showActivities = activities || activityLoading;

  const isHub = journeyTypeName === 'hub';
  const leadOrganizationsHeader = isHub
    ? 'pages.hub.sections.dashboard.organization'
    : 'community.leading-organizations';
  const leadUsersHeader = isHub ? 'community.host' : 'community.leads';

  const validRecommendations = recommendations?.filter(rec => rec.uri) || [];
  const hasRecommendations = validRecommendations.length > 0;
  const hasTopCallouts = (topCallouts ?? []).length > 0;

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <JourneyDashboardVision vision={vision} journeyTypeName={journeyTypeName} />
        <ShareButton
          title={t('share-dialog.share-this', { entity: t(`common.${journeyTypeName}` as const) })}
          url={hubNameId && buildHubUrl(hubNameId)}
          entityTypeName="hub"
        />
        {communityReadAccess && (
          <EntityDashboardLeadsSection
            usersHeader={t(leadUsersHeader)}
            organizationsHeader={t(leadOrganizationsHeader)}
            leadUsers={leadUsers}
            leadOrganizations={leadOrganizations}
          />
        )}
        {timelineReadAccess && <DashboardCalendarSection journeyLocation={journeyLocation} />}
        <PageContentBlock>
          <PageContentBlockHeader title={t('components.referenceSegment.title')} />
          <References references={references} />
          {/* TODO figure out the URL for references */}
          <SeeMore subject={t('common.references')} to={EntityPageSection.About} />
        </PageContentBlock>
        {communityReadAccess && <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />}
        {communityReadAccess && (
          <EntityDashboardContributorsSection
            memberUsers={memberUsers}
            memberUsersCount={memberUsersCount}
            memberOrganizations={memberOrganizations}
            memberOrganizationsCount={memberOrganizationsCount}
          />
        )}
      </PageContentColumn>

      <PageContentColumn columns={8}>
        {hasRecommendations && (
          <PageContentBlock halfWidth>
            <PageContentBlockHeader title={t('pages.generic.sections.recommendations.title')} />
            <References references={validRecommendations} icon={RecommendationIcon} />
          </PageContentBlock>
        )}
        {hasTopCallouts && (
          <PageContentBlock halfWidth={hasRecommendations}>
            <PageContentBlockHeader title={t('components.top-callouts.title')} />
            {topCallouts?.map(callout => (
              <TopCalloutDetails
                key={callout.id}
                title={callout.displayName}
                description={callout.description}
                activity={callout.activity}
                type={callout.type}
                calloutUri={journeyLocation && buildCalloutUrl(callout.nameID, journeyLocation)}
              />
            ))}
          </PageContentBlock>
        )}
        <PageContentBlock>
          <PageContentBlockHeader title={t('components.activity-log-section.title')} />
          {readUsersAccess && entityReadAccess && showActivities && (
            <>
              <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
              <SeeMore subject={t('common.contributions')} to={EntityPageSection.Contribute} />
            </>
          )}
          {!entityReadAccess && readUsersAccess && (
            <Caption>
              {t(`components.activity-log-section.activity-join-error-message.${journeyTypeName}` as const)}
            </Caption>
          )}
          {!readUsersAccess && entityReadAccess && (
            <Caption>{t('components.activity-log-section.activity-sign-in-error-message')}</Caption>
          )}
          {!entityReadAccess && !readUsersAccess && (
            <Caption>
              {t(`components.activity-log-section.activity-sign-in-and-join-error-message.${journeyTypeName}` as const)}
            </Caption>
          )}
        </PageContentBlock>
        {entityReadAccess && renderChildEntityCard && childEntityTitle && (
          <PageContentBlock>
            <PageContentBlockHeader title={withOptionalCount(childEntityTitle, childEntitiesCount)} />
            <ScrollableCardsLayout items={childEntities} deps={[hubNameId]}>
              {renderChildEntityCard}
            </ScrollableCardsLayout>
            <SeeMore subject={childEntityTitle} to={getChildJourneyRoute(journeyTypeName)} />
          </PageContentBlock>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default JourneyDashboardView;
