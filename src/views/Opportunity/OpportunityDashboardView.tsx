import { ApolloError } from '@apollo/client';
import { Button, Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import EntityContributionCard from '../../components/composite/common/cards/ContributionCard/EntityContributionCard';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardOpportunityStatistics from '../../components/composite/common/sections/DashboardOpportunityStatistics';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import InterestModal from '../../components/composite/entities/Hub/InterestModal';
import Markdown from '../../components/core/Markdown';
import { useChallenge, useHub, useOpportunity, useUserContext } from '../../hooks';
import { Discussion } from '../../models/discussion/discussion';
import { OpportunityPageFragment, Reference } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { getVisualBanner } from '../../utils/visuals.utils';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSectionAspects from '../../components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import EntityDashboardContributorsSection, {
  EntityDashboardContributorsSectionProps,
} from '../../domain/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import AssociatedOrganizationsView from '../../domain/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import OrganizationCard from '../../components/composite/common/cards/Organization/OrganizationCard';
import { mapToAssociatedOrganization } from '../../domain/organization/AssociatedOrganizations/AssociatedOrganization';

const SPACING = 2;
const PROJECTS_NUMBER_IN_SECTION = 2;

// TODO flat props
export interface OpportunityDashboardViewEntities {
  opportunity: OpportunityPageFragment;
  activity: ActivityItem[];
  availableActorGroupNames: string[];
  existingAspectNames: string[];
  discussions: Discussion[];
  url: string;
  links: Reference[];
  meme?: Reference;
  relations: {
    incoming: OpportunityPageFragment['relations'];
    outgoing: OpportunityPageFragment['relations'];
  };
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
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
    OpportunityDashboardViewEntities & EntityDashboardContributorsSectionProps,
    OpportunityDashboardViewActions,
    OpportunityDashboardViewState,
    OpportunityDashboardViewOptions
  > {}

const OpportunityDashboardView: FC<OpportunityDashboardViewProps> = ({ entities, state, options, actions }) => {
  const { t } = useTranslation();

  const { hubNameId } = useHub();
  const { challengeNameId } = useChallenge();
  const { hubId } = useOpportunity();

  const { user: userMetadata } = useUserContext();
  const isNotMember = !userMetadata?.ofOpportunity(userMetadata?.user.id ?? 'tempId') ?? true;

  const { opportunity } = entities;
  const lifecycle = opportunity?.lifecycle;
  const communityId = opportunity?.community?.id || '';
  const projects = opportunity?.projects || [];
  const { communityReadAccess } = options;

  const { id, context, displayName } = opportunity;
  const { visuals, tagline = '', vision = '' } = context ?? {};
  const banner = getVisualBanner(visuals);

  const { loading } = state;

  const { user } = useUserContext();

  const leadOrganizations = useMemo(
    () =>
      opportunity?.community?.leadOrganizations?.map(org => mapToAssociatedOrganization(org, org.id, user?.user, t)),
    [opportunity]
  );

  return (
    <>
      <Grid container spacing={2}>
        <DashboardColumn>
          <DashboardGenericSection
            bannerUrl={banner}
            headerText={displayName}
            primaryAction={
              isNotMember && (
                <Button onClick={actions.onInterestOpen} variant="contained">
                  {t('pages.opportunity.sections.apply')}
                </Button>
              )
            }
          >
            <Markdown children={tagline} />
            <Markdown children={vision} />
          </DashboardGenericSection>
          <DashboardOpportunityStatistics
            headerText={t('pages.opportunity.sections.dashboard.statistics.title')}
            activities={entities.activity}
            lifecycle={lifecycle}
            loading={loading}
          />
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
          <AssociatedOrganizationsView
            title={t('community.leading-organizations')}
            organizations={leadOrganizations}
            organizationCardComponent={OrganizationCard}
          />
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
        </DashboardColumn>
      </Grid>
      <InterestModal onHide={actions.onInterestClose} show={state.showInterestModal} opportunityId={id} />
    </>
  );
};
export default OpportunityDashboardView;
