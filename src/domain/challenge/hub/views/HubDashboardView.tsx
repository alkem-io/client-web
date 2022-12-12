/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO cleanup imports and props
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/material/SvgIcon/SvgIcon';
import DashboardSectionAspects from '../../../collaboration/aspect/DashboardSectionAspects/DashboardSectionAspects';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import { AspectCardAspect } from '../../../collaboration/aspect/AspectCard/AspectCard';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import References from '../../../../common/components/composite/common/References/References';
import ContextSectionIcon from '../../../../common/components/composite/sections/ContextSectionIcon';
import DashboardColumn from '../../../../common/components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSection from '../../../../common/components/composite/sections/DashboardSection/DashboardSection';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import { useConfig } from '../../../platform/config/useConfig';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../../platform/config/features.constants';
import {
  ChallengeCardFragment,
  AssociatedOrganizationDetailsFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import { buildHubUrl, buildCanvasUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';
import { CanvasCard } from '../../../collaboration/callout/canvas/CanvasCallout';
import CanvasesDashboardPreview from '../../../collaboration/canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import EntityDashboardContributorsSection from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardDiscussionsSection from '../../../shared/components/DashboardSections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import withOptionalCount from '../../../shared/utils/withOptionalCount';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { Discussion } from '../../../communication/discussion/models/discussion';
import { ActivityComponent, ActivityLogResultType, ActivitySection } from '../../../shared/components/ActivityLog';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';

export interface HubDashboardView2Props extends EntityDashboardContributors {
  vision?: string;
  hubId?: string;
  hubNameId?: string;
  communityId?: string;
  organizationNameId?: string;
  challengesCount: number | undefined;
  discussions: Discussion[];
  organization?: unknown;
  challenges: ChallengeCardFragment[];
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
  canvases: CanvasCard[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  community?: unknown;
  loading: boolean;
  isMember?: boolean;
  communityReadAccess?: boolean;
  challengesReadAccess?: boolean;
  hostOrganization: AssociatedOrganizationDetailsFragment | undefined;
  leadUsers: EntityDashboardLeads['leadUsers'];
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
}

const HubDashboardView: FC<HubDashboardView2Props> = ({
  vision = '',
  challenges,
  hubNameId = '',
  communityId = '',
  challengesCount,
  discussions,
  aspects,
  aspectsCount,
  canvases,
  canvasesCount,
  references,
  loading,
  isMember = false,
  communityReadAccess = false,
  challengesReadAccess = false,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  hostOrganization,
  leadUsers,
  activities,
  activityLoading,
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();

  const hostOrganizations = useMemo(() => hostOrganization && [hostOrganization], [hostOrganization]);

  const [, buildLinkToCanvas] = useBackToParentPage(buildHubUrl(hubNameId));

  const buildCanvasLink = useCallback(
    (canvasNameId: string, calloutNameId: string) => {
      const url = buildCanvasUrl(calloutNameId, canvasNameId, { hubNameId });
      return buildLinkToCanvas(url);
    },
    [hubNameId, buildLinkToCanvas]
  );

  const journeyLocation: JourneyLocation = {
    hubNameId,
  };

  const showActivity = (!activities && activityLoading) || !!activities;

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock accent>
          <WrapperMarkdown>{vision}</WrapperMarkdown>
        </PageContentBlock>
        <ShareButton
          title={t('share-dialog.share-this', { entity: t('common.hub') })}
          url={buildHubUrl(hubNameId)}
          entityTypeName="hub"
        />
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
        {challengesReadAccess && (
          <PageContentBlock>
            <PageContentBlockHeader
              title={withOptionalCount(t('pages.hub.sections.dashboard.challenges.title'), challengesCount)}
            />
            <CardsLayout items={challenges} deps={[hubNameId]}>
              {challenge => <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
            </CardsLayout>
            <SeeMore subject={t('common.challenges')} to="challenges" />
          </PageContentBlock>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default HubDashboardView;
