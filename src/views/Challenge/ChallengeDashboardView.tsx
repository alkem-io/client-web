import Grid from '@mui/material/Grid';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardDiscussionsSection from '../../domain/shared/components/DashboardSections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../domain/shared/components/DashboardSections/DashboardUpdatesSection';
import { Loading } from '../../components/core';
import Markdown from '../../components/core/Markdown';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { useChallenge, useConfig } from '../../hooks';
import OpportunityCard from '../../components/composite/common/cards/OpportunityCard/OpportunityCard';
import CardsLayout from '../../domain/shared/layout/CardsLayout/CardsLayout';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSectionAspects from '../../components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import EntityDashboardContributorsSection from '../../domain/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import { EntityDashboardContributors } from '../../domain/community/EntityDashboardContributorsSection/Types';
import EntityDashboardLeadsSection from '../../domain/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import CanvasesDashboardPreview from '../../domain/canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import { buildCanvasUrl, buildChallengeUrl } from '../../utils/urlBuilders';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';
import withOptionalCount from '../../domain/shared/utils/withOptionalCount';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

const CHALLENGES_NUMBER_IN_SECTION = 2;
const SPACING = 2;

interface ChallengeDashboardViewProps {
  entities: ChallengeContainerEntities & EntityDashboardContributors;
  state: ChallengeContainerState;
}

export const ChallengeDashboardView: FC<ChallengeDashboardViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();

  const { hubNameId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  const [, buildLinkToCanvas] = useBackToParentPage(buildChallengeUrl(hubNameId, challengeNameId));

  const buildCanvasLink = useCallback(
    (canvasNameId: string) => {
      const url = buildCanvasUrl(canvasNameId, hubNameId, challengeNameId);
      return buildLinkToCanvas(url);
    },
    [hubNameId, challengeNameId]
  );

  const { challenge, isMember, discussions, permissions, aspects, aspectsCount, canvases, canvasesCount } = entities;

  const { loading } = state;

  const communityId = challenge?.community?.id || '';

  const opportunities = challenge?.opportunities;
  const { communityReadAccess } = permissions;

  if (loading || loadingChallengeContext) return <Loading />;

  return (
    <>
      <Grid container spacing={SPACING}>
        <DashboardColumn>
          <DashboardGenericSection
            headerText={t('pages.challenge.about-this-challenge')}
            primaryAction={
              <ApplicationButtonContainer>
                {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
              </ApplicationButtonContainer>
            }
            navText={t('buttons.see-more')}
            navLink={EntityPageSection.About}
          >
            <Markdown children={challenge?.context?.vision || ''} />
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
              usersHeader={t('community.leads')}
              organizationsHeader={t('community.leading-organizations')}
              leadUsers={challenge?.community?.leadUsers}
              leadOrganizations={challenge?.community?.leadOrganizations}
            />
          )}
          {communityReadAccess && (
            <EntityDashboardContributorsSection
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
            />
          )}
        </DashboardColumn>
        <DashboardColumn>
          <DashboardGenericSection
            headerText={withOptionalCount(
              t('pages.challenge.sections.dashboard.opportunities.title'),
              entities.opportunitiesCount
            )}
            helpText={t('pages.challenge.sections.dashboard.opportunities.help-text')}
            navText={t('buttons.see-all')}
            navLink={'opportunities'}
          >
            {/* TODO check if flexBasis: '50%' was ever needed */}
            <CardsLayout
              items={opportunities?.slice(0, CHALLENGES_NUMBER_IN_SECTION) || []}
              deps={[hubNameId, challengeNameId]}
            >
              {opportunity => (
                <OpportunityCard opportunity={opportunity} hubNameId={hubNameId} challengeNameId={challengeNameId} />
              )}
            </CardsLayout>
          </DashboardGenericSection>
          <DashboardSectionAspects
            aspects={aspects}
            aspectsCount={aspectsCount}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
          />
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
