import { Grid } from '@mui/material';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/material/SvgIcon/SvgIcon';
import DashboardSectionAspects from '../../../common/components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import ApplicationButton from '../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import { AspectCardAspect } from '../../../common/components/composite/common/cards/AspectCard/AspectCard';
import ChallengeCard from '../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import References from '../../../common/components/composite/common/References/References';
import ContextSectionIcon from '../../../common/components/composite/sections/ContextSectionIcon';
import DashboardColumn from '../../../common/components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSection from '../../../common/components/composite/sections/DashboardSection/DashboardSection';
import Markdown from '../../../common/components/core/Markdown';
import ApplicationButtonContainer from '../../../containers/application/ApplicationButtonContainer';
import { useConfig } from '../../../hooks';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../../models/constants';
import {
  ChallengeCardFragment,
  AssociatedOrganizationDetailsFragment,
  Reference,
} from '../../../models/graphql-schema';
import { buildHubUrl, buildCanvasUrl } from '../../../common/utils/urlBuilders';
import { CanvasCard } from '../../callout/canvas/CanvasCallout';
import CanvasesDashboardPreview from '../../canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import EntityDashboardContributorsSection from '../../community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../community/EntityDashboardContributorsSection/Types';
import DashboardDiscussionsSection from '../../shared/components/DashboardSections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../shared/components/DashboardSections/DashboardUpdatesSection';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';
import CardsLayout from '../../shared/layout/CardsLayout/CardsLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import EntityDashboardLeadsSection from '../../community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { Discussion } from '../../../models/discussion/discussion';

export interface HubDashboardView2Props extends EntityDashboardContributors {
  vision?: string;
  hubId?: string;
  hubNameId?: string;
  communityId?: string;
  organizationNameId?: string;
  challengesCount: number | undefined;
  discussions: Discussion[];
  organization?: any;
  challenges: ChallengeCardFragment[];
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
  canvases: CanvasCard[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  community?: any;
  loading: boolean;
  isMember?: boolean;
  communityReadAccess?: boolean;
  challengesReadAccess?: boolean;
  hostOrganization: AssociatedOrganizationDetailsFragment | undefined;
  leadUsers: EntityDashboardLeads['leadUsers'];
}

const SPACING = 2;

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
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();

  const hostOrganizations = useMemo(() => hostOrganization && [hostOrganization], [hostOrganization]);

  const [, buildLinkToCanvas] = useBackToParentPage(buildHubUrl(hubNameId));

  const buildCanvasLink = useCallback(
    (canvasNameId: string, calloutNameId: string) => {
      const url = buildCanvasUrl({ hubNameId, calloutNameId, canvasNameId });
      return buildLinkToCanvas(url);
    },
    [hubNameId]
  );

  return (
    <>
      <Grid container spacing={SPACING}>
        <DashboardColumn>
          <DashboardGenericSection
            headerText={t('pages.hub.about-this-hub')}
            primaryAction={
              <ApplicationButtonContainer>
                {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
              </ApplicationButtonContainer>
            }
            navText={t('buttons.see-more')}
            navLink={EntityPageSection.About}
          >
            <Markdown children={vision} />
          </DashboardGenericSection>
          {communityReadAccess && (
            <EntityDashboardLeadsSection
              organizationsHeader={t('pages.hub.sections.dashboard.organization')}
              usersHeader={t('community.host')}
              leadUsers={leadUsers}
              leadOrganizations={hostOrganizations}
            />
          )}
          {communityReadAccess && (
            <>
              <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />
              <SectionSpacer />
              {isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS) && (
                <DashboardDiscussionsSection discussions={discussions} isMember={isMember} />
              )}
            </>
          )}
          {communityReadAccess && (
            <EntityDashboardContributorsSection
              memberUsers={memberUsers}
              memberUsersCount={memberUsersCount}
              memberOrganizations={memberOrganizations}
              memberOrganizationsCount={memberOrganizationsCount}
            />
          )}
        </DashboardColumn>
        <DashboardColumn>
          <DashboardSection
            headerText={t('components.referenceSegment.title')}
            primaryAction={<ContextSectionIcon component={SchoolIcon} />}
            collapsible
          >
            <References references={references} />
          </DashboardSection>
          {challengesReadAccess && (
            <DashboardGenericSection
              headerText={withOptionalCount(t('pages.hub.sections.dashboard.challenges.title'), challengesCount)}
              helpText={t('pages.hub.sections.dashboard.challenges.help-text')}
              navText={t('buttons.see-all')}
              navLink={'challenges'}
            >
              <CardsLayout items={challenges} deps={[hubNameId]}>
                {challenge => <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
              </CardsLayout>
            </DashboardGenericSection>
          )}
          <DashboardSectionAspects aspects={aspects} aspectsCount={aspectsCount} hubNameId={hubNameId} />
          <CanvasesDashboardPreview
            canvases={canvases}
            canvasesCount={canvasesCount}
            noItemsMessage={t('pages.canvas.no-canvases')}
            buildCanvasLink={buildCanvasLink}
            loading={loading}
          />
        </DashboardColumn>
      </Grid>
    </>
  );
};

export default HubDashboardView;
