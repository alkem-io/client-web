import { Grid } from '@mui/material';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardDiscussionsSection from '../../domain/shared/components/DashboardSections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../domain/shared/components/DashboardSections/DashboardUpdatesSection';
import Markdown from '../../components/core/Markdown';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { Discussion } from '../../models/discussion/discussion';
import {
  AssociatedOrganizationDetailsFragment,
  CanvasDetailsFragment,
  ChallengeCardFragment,
} from '../../models/graphql-schema';
import ActivityView from '../Activity/ActivityView';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardsLayout from '../../domain/shared/layout/CardsLayout/CardsLayout';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { useConfig } from '../../hooks';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSectionAspects from '../../components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import EntityDashboardContributorsSection from '../../domain/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../domain/community/EntityDashboardContributorsSection/Types';
import EntityDashboardLeadsSection from '../../domain/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { ActivityType } from '../../domain/activity/ActivityType';
import CanvasesDashboardPreview from '../../domain/canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import { buildCanvasUrl } from '../../utils/urlBuilders';

export interface HubDashboardView2Props extends EntityDashboardContributors {
  title?: string;
  bannerUrl?: string;
  tagline?: string;
  vision?: string;
  hubId?: string;
  hubNameId?: string;
  communityId?: string;
  organizationNameId?: string;
  activity: ActivityItem[];
  discussions: Discussion[];
  organization?: any;
  challenges: ChallengeCardFragment[];
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
  canvases: CanvasDetailsFragment[];
  canvasesCount: number | undefined;
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
  bannerUrl,
  title,
  tagline = '',
  vision = '',
  challenges,
  hubNameId = '',
  communityId = '',
  activity,
  discussions,
  aspects,
  aspectsCount,
  canvases,
  canvasesCount,
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

  const challengesCount = useMemo(() => {
    return activity.find(({ type }) => type === ActivityType.Challenge)?.count;
  }, [activity]);

  const hostOrganizations = useMemo(() => hostOrganization && [hostOrganization], [hostOrganization]);

  const buildCanvasLink = useCallback(
    (canvasNameId: string) => {
      const url = buildCanvasUrl(canvasNameId, hubNameId);
      return { url };
    },
    [hubNameId]
  );

  return (
    <>
      <Grid container spacing={SPACING}>
        <DashboardColumn>
          <DashboardGenericSection
            bannerUrl={bannerUrl}
            headerText={title}
            primaryAction={
              <ApplicationButtonContainer>
                {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
              </ApplicationButtonContainer>
            }
            navText={t('buttons.see-more')}
            navLink={'context'}
          >
            <Markdown children={tagline} />
            <Markdown children={vision} />
          </DashboardGenericSection>
          <DashboardGenericSection headerText={t('pages.hub.sections.dashboard.activity')}>
            <ActivityView activity={activity} loading={loading} />
          </DashboardGenericSection>
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
            <EntityDashboardLeadsSection
              organizationsHeader={t('pages.hub.sections.dashboard.organization')}
              usersHeader={t('community.host')}
              leadUsers={leadUsers}
              leadOrganizations={hostOrganizations}
            />
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
          {challengesReadAccess && (
            <DashboardGenericSection
              headerText={`${t('pages.hub.sections.dashboard.challenges.title')} (${challengesCount})`}
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
