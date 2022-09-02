import Grid from '@mui/material/Grid';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/material/SvgIcon/SvgIcon';
import DashboardSectionAspects from '../../../common/components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import ApplicationButton from '../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import OpportunityCard from '../../../common/components/composite/common/cards/OpportunityCard/OpportunityCard';
import References from '../../../common/components/composite/common/References/References';
import ContextSectionIcon from '../../../common/components/composite/sections/ContextSectionIcon';
import DashboardColumn from '../../../common/components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSection from '../../../common/components/composite/sections/DashboardSection/DashboardSection';
import { Loading } from '../../../common/components/core';
import Markdown from '../../../common/components/core/Markdown';
import ApplicationButtonContainer from '../../../containers/application/ApplicationButtonContainer';
import {
  ChallengeContainerEntities,
  ChallengeContainerState,
} from '../../../containers/challenge/ChallengePageContainer';
import { useConfig } from '../../../hooks';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../../models/constants';
import { buildChallengeUrl, buildCanvasUrl } from '../../../common/utils/urlBuilders';
import CanvasesDashboardPreview from '../../canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import EntityDashboardContributorsSection from '../../community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import { EntityDashboardContributors } from '../../community/EntityDashboardContributorsSection/Types';
import DashboardDiscussionsSection from '../../shared/components/DashboardSections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../shared/components/DashboardSections/DashboardUpdatesSection';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';
import CardsLayout from '../../shared/layout/CardsLayout/CardsLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import { useChallenge } from '../hooks/useChallenge';
import EntityDashboardLeadsSection from '../../community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';

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
    (canvasNameId: string, calloutNameId: string) => {
      const url = buildCanvasUrl({ hubNameId, challengeNameId, calloutNameId, canvasNameId });
      return buildLinkToCanvas(url);
    },
    [hubNameId, challengeNameId]
  );

  const { challenge, isMember, discussions, permissions, aspects, aspectsCount, canvases, canvasesCount, references } =
    entities;

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
            <EntityDashboardLeadsSection
              usersHeader={t('community.leads')}
              organizationsHeader={t('community.leading-organizations')}
              leadUsers={challenge?.community?.leadUsers}
              leadOrganizations={challenge?.community?.leadOrganizations}
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
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
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
