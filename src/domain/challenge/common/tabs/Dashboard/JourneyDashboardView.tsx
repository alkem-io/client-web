import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import References from '../../../../../common/components/composite/common/References/References';
import { Reference } from '../../../../../core/apollo/generated/graphql-schema';
import { buildHubUrl, JourneyLocation } from '../../../../../common/utils/urlBuilders';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import CardsLayout from '../../../../shared/layout/CardsLayout/CardsLayout';
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

export interface JourneyDashboardViewProps<ChildEntity extends Identifiable>
  extends EntityDashboardContributors,
    EntityDashboardLeads,
    Partial<CoreEntityIdTypes> {
  vision?: string;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  community?: unknown;
  communityReadAccess?: boolean;
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  childEntities?: ChildEntity[];
  childEntityReadAccess?: boolean;
  childEntitiesCount?: number;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  journeyTypeName: JourneyTypeName;
  childEntityTitle?: string;
}

const JourneyDashboardView = <ChildEntity extends Identifiable>({
  vision = '',
  hubNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  childEntitiesCount,
  references,
  communityReadAccess = false,
  childEntityReadAccess = false,
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

  const showActivity = (!activities && activityLoading) || !!activities;

  const isHub = journeyTypeName === 'hub';
  const leadOrganizationsHeader = isHub
    ? 'pages.hub.sections.dashboard.organization'
    : 'community.leading-organizations';
  const leadUsersHeader = isHub ? 'community.host' : 'community.leads';

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
        {showActivity && (
          <PageContentBlock>
            <PageContentBlockHeader title={t('components.activity-log-section.title')} />
            <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
            <SeeMore subject={t('common.contributions')} to={EntityPageSection.Explore} />
          </PageContentBlock>
        )}
        {childEntityReadAccess && renderChildEntityCard && childEntityTitle && (
          <PageContentBlock>
            <PageContentBlockHeader title={withOptionalCount(childEntityTitle, childEntitiesCount)} />
            <CardsLayout items={childEntities} deps={[hubNameId]}>
              {renderChildEntityCard}
            </CardsLayout>
            <SeeMore subject={childEntityTitle} to="challenges" />
          </PageContentBlock>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default JourneyDashboardView;
