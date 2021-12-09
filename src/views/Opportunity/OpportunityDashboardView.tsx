import { ApolloError } from '@apollo/client';
import { Button, Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { ContributionCard } from '../../components/composite/common/cards';
import DashboardCommunitySectionV2 from '../../components/composite/common/sections/DashboardCommunitySectionV2';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardOpportunityStatistics from '../../components/composite/common/sections/DashboardOpportunityStatistics';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import InterestModal from '../../components/composite/entities/Ecoverse/InterestModal';
import Markdown from '../../components/core/Markdown';
import { Header as SectionHeader } from '../../components/core/Section';
import { SectionSpacer } from '../../components/core/Section/Section';
import Typography from '../../components/core/Typography';
import { useOpportunity } from '../../hooks';
import { Discussion } from '../../models/discussion/discussion';
import { OpportunityPageFragment, Reference, User } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';

const SPACING = 2;
const PROJECTS_NUMBER_IN_SECTION = 2;

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
  isAspectAddAllowed: boolean;
  isAuthenticated: boolean;
  communityReadAccess: boolean;
}

export interface OpportunityDashboardViewProps
  extends ViewProps<
    OpportunityDashboardViewEntities,
    OpportunityDashboardViewActions,
    OpportunityDashboardViewState,
    OpportunityDashboardViewOptions
  > {}

const OpportunityDashboardView: FC<OpportunityDashboardViewProps> = ({ entities, state, options, actions }) => {
  const { t } = useTranslation();

  const { ecoverseId } = useOpportunity();

  const { opportunity } = entities;
  const lifecycle = opportunity?.lifecycle;
  const communityId = opportunity?.community?.id || '';
  const members = (opportunity?.community?.members || []) as User[]; // TODO [ATS]:
  const projects = opportunity?.projects || [];
  const { communityReadAccess } = options;

  const { id, context, displayName } = opportunity;
  const { visual, tagline = '', vision = '' } = context ?? {};
  const banner = visual?.banner;

  const { loading } = state;
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <DashboardGenericSection
            bannerUrl={banner}
            headerText={displayName}
            primaryAction={
              <Button onClick={actions.onInterestOpen} variant="contained">
                {t('pages.opportunity.sections.potential.buttons.apply.text')}
              </Button>
            }
          >
            <Typography component={Markdown} variant="body1" children={tagline}></Typography>
            <SectionHeader text={t('components.contextSegment.vision.title')}></SectionHeader>
            <Typography component={Markdown} variant="body1" children={vision}></Typography>
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardOpportunityStatistics
            headerText={t('pages.opportunity.sections.dashboard.statistics.title')}
            activities={entities.activity}
            lifecycle={lifecycle}
            loading={loading}
          />
          {communityReadAccess && (
            <>
              <SectionSpacer />
              <DashboardUpdatesSection entities={{ ecoverseId: ecoverseId, communityId: communityId }} />
              {/* The discussions are not loaded, check OpportunityPageContainer if you try to enable them. */}
              {/* <SectionSpacer />
              <DashboardDiscussionsSection discussions={discussions} isMember={options.isMemberOfOpportunity} /> */}
            </>
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
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
                    <ContributionCard
                      loading={loading}
                      details={{
                        name: x.displayName,
                        tags: ['no tags'],
                        image: '',
                        url: 'projects',
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </DashboardGenericSection>
          {communityReadAccess && (
            <>
              <SectionSpacer />
              <DashboardCommunitySectionV2 members={members} />
            </>
          )}
        </Grid>
      </Grid>
      <InterestModal onHide={actions.onInterestClose} show={state.showInterestModal} opportunityId={id} />
    </>
  );
};
export default OpportunityDashboardView;
