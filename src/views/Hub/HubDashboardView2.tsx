import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardDiscussionsSection from '../../components/composite/common/sections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import Markdown from '../../components/core/Markdown';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { Discussion } from '../../models/discussion/discussion';
import { ChallengeCardFragment } from '../../models/graphql-schema';
import ActivityView from '../Activity/ActivityView';
import AssociatedOrganizationsLazilyFetched from '../../domain/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardsLayout from '../../domain/shared/layout/CardsLayout/CardsLayout';
import { ActivityType, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { useConfig } from '../../hooks';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSectionAspects from '../../components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import EntityDashboardContributorsSection, {
  EntityDashboardContributorsSectionProps,
} from '../../domain/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';

export interface HubDashboardView2Props extends EntityDashboardContributorsSectionProps {
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
  community?: any;
  loading: boolean;
  isMember?: boolean;
  communityReadAccess?: boolean;
  challengesReadAccess?: boolean;
}

const SPACING = 2;

const HubDashboardView2: FC<HubDashboardView2Props> = ({
  bannerUrl,
  title,
  tagline = '',
  vision = '',
  challenges,
  hubNameId = '',
  communityId = '',
  organizationNameId,
  activity,
  discussions,
  aspects,
  aspectsCount,
  loading,
  isMember = false,
  communityReadAccess = false,
  challengesReadAccess = false,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();

  const orgNameIds = useMemo(() => (organizationNameId ? [organizationNameId] : []), [organizationNameId]);

  const challengesCount = useMemo(() => {
    return activity.find(({ type }) => type === ActivityType.Challenge)?.count;
  }, [activity]);

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
            <EntityDashboardContributorsSection
              memberUsers={memberUsers}
              memberUsersCount={memberUsersCount}
              memberOrganizations={memberOrganizations}
              memberOrganizationsCount={memberOrganizationsCount}
            />
          )}
        </DashboardColumn>
        <DashboardColumn>
          <AssociatedOrganizationsLazilyFetched
            title={t('pages.hub.sections.dashboard.organization')}
            organizationNameIDs={orgNameIds}
          />
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
        </DashboardColumn>
      </Grid>
    </>
  );
};

export default HubDashboardView2;
