import { ApolloError } from '@apollo/client';
import { Button, Grid } from '@mui/material';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import EntityContributionCard from '../../components/composite/common/cards/ContributionCard/EntityContributionCard';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import DashboardUpdatesSection from '../../domain/shared/components/DashboardSections/DashboardUpdatesSection';
import InterestModal from '../../components/composite/entities/Hub/InterestModal';
import Markdown from '../../components/core/Markdown';
import { useChallenge, useHub, useOpportunity, useUserContext } from '../../hooks';
import { Discussion } from '../../models/discussion/discussion';
import {
  CanvasDetailsFragment,
  OpportunityPageFragment,
  OpportunityPageRelationsFragment,
  Reference,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSectionAspects from '../../components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import EntityDashboardContributorsSection from '../../domain/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import { EntityDashboardContributors } from '../../domain/community/EntityDashboardContributorsSection/Types';
import EntityDashboardLeadsSection from '../../domain/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import CanvasesDashboardPreview from '../../domain/canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import { buildCanvasUrl, buildOpportunityUrl } from '../../utils/urlBuilders';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';

const SPACING = 2;
const PROJECTS_NUMBER_IN_SECTION = 2;

// TODO flat props
export interface OpportunityDashboardViewEntities {
  opportunity: OpportunityPageFragment;
  // activity: ActivityItem[];
  availableActorGroupNames: string[];
  existingAspectNames: string[];
  discussions: Discussion[];
  url: string;
  links: Reference[];
  meme?: Reference;
  relations: {
    incoming: OpportunityPageRelationsFragment[];
    outgoing: OpportunityPageRelationsFragment[];
  };
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
  canvases: CanvasDetailsFragment[];
  canvasesCount: number | undefined;
}

export interface OpportunityDashboardViewActions {
  onInterestOpen: () => void;
  onInterestClose: () => void;
  onAddActorGroupOpen: () => void;
  onAddActorGroupClose: () => void;
}

export interface OpportunityDashboardViewState {
  loading: boolean;
  showInterestModal: boolean;
  showActorGroupModal: boolean;
  error?: ApolloError;
}

export interface OpportunityDashboardViewOptions {
  editAspect: boolean;
  editActorGroup: boolean;
  editActors: boolean;
  removeRelations: boolean;
  isMemberOfOpportunity: boolean;
  isNoRelations: boolean;
  isAuthenticated: boolean;
  communityReadAccess: boolean;
}

export interface OpportunityDashboardViewProps
  extends ViewProps<
    OpportunityDashboardViewEntities & EntityDashboardContributors,
    OpportunityDashboardViewActions,
    OpportunityDashboardViewState,
    OpportunityDashboardViewOptions
  > {}

const OpportunityDashboardView: FC<OpportunityDashboardViewProps> = ({ entities, state, options, actions }) => {
  const { t } = useTranslation();

  const { hubNameId } = useHub();
  const { challengeNameId } = useChallenge();
  const { hubId, opportunityId } = useOpportunity();

  const [, buildLinkToCanvas] = useBackToParentPage(
    buildOpportunityUrl(hubNameId, challengeNameId, entities.opportunity.nameID)
  );

  const buildCanvasLink = useCallback(
    (canvasNameId: string) => {
      const url = buildCanvasUrl(canvasNameId, hubNameId, challengeNameId, entities.opportunity.nameID);
      return buildLinkToCanvas(url);
    },
    [hubNameId, challengeNameId, entities.opportunity]
  );

  const { user: userMetadata } = useUserContext();

  const isNotMember = opportunityId && userMetadata ? !userMetadata.ofOpportunity(opportunityId) : true;

  const { opportunity } = entities;
  const communityId = opportunity?.community?.id || '';
  const projects = opportunity?.projects || [];
  const { communityReadAccess } = options;

  const { id, collaboration } = opportunity;
  const { id: collaborationId } = collaboration ?? {};

  const { loading } = state;

  return (
    <>
      <Grid container spacing={2}>
        <DashboardColumn>
          <DashboardGenericSection
            headerText={t('pages.opportunity.about-this-opportunity')}
            primaryAction={
              isNotMember && (
                <Button onClick={actions.onInterestOpen} variant="contained">
                  {t('pages.opportunity.sections.apply')}
                </Button>
              )
            }
          >
            <Markdown children={opportunity?.context?.vision || ''} />
          </DashboardGenericSection>
          {communityReadAccess && (
            <EntityDashboardLeadsSection
              usersHeader={t('community.leads')}
              organizationsHeader={t('community.leading-organizations')}
              leadUsers={opportunity?.community?.leadUsers}
              leadOrganizations={opportunity?.community?.leadOrganizations}
            />
          )}
          {communityReadAccess && (
            <>
              <DashboardUpdatesSection entities={{ hubId: hubId, communityId: communityId }} />
              {/* The discussions are not loaded, check OpportunityPageContainer if you try to enable them. */}
              {/* <SectionSpacer />
              <DashboardDiscussionsSection discussions={discussions} isMember={options.isMemberOfOpportunity} /> */}
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
          <DashboardGenericSection
            headerText={t('pages.opportunity.sections.dashboard.projects.title')}
            helpText={t('pages.opportunity.sections.dashboard.projects.help-text')}
            navText={t('buttons.see-all')}
            navLink={'projects'}
          >
            <Grid container item spacing={SPACING}>
              {projects.slice(0, PROJECTS_NUMBER_IN_SECTION).map((x, i) => {
                return (
                  <Grid key={i} item>
                    <EntityContributionCard
                      loading={loading}
                      activities={[]}
                      details={{
                        headerText: x.displayName,
                        mediaUrl: '',
                        url: `../projects/${x.nameID}`,
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </DashboardGenericSection>
          <DashboardSectionAspects
            aspects={entities.aspects}
            aspectsCount={entities.aspectsCount}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunity.nameID}
          />
          <CanvasesDashboardPreview
            canvases={entities.canvases}
            canvasesCount={entities.canvasesCount}
            noItemsMessage={t('pages.canvas.no-canvases')}
            buildCanvasLink={buildCanvasLink}
            loading={loading}
          />
        </DashboardColumn>
      </Grid>
      <InterestModal
        onHide={actions.onInterestClose}
        show={state.showInterestModal}
        collaborationId={collaborationId}
        opportunityId={id}
      />
    </>
  );
};
export default OpportunityDashboardView;
