import { ApolloError } from '@apollo/client';
import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { ContributionCard } from '../../components/composite/common/cards';
import DashboardCommunitySectionV2 from '../../components/composite/common/sections/DashboardCommunitySectionV2';
import DashboardDiscussionsSection from '../../components/composite/common/sections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardOpportunityStatistics from '../../components/composite/common/sections/DashboardOpportunityStatistics';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
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
}

export interface OpportunityDashboardViewProps
  extends ViewProps<
    OpportunityDashboardViewEntities,
    OpportunityDashboardViewActions,
    OpportunityDashboardViewState,
    OpportunityDashboardViewOptions
  > {}

const OpportunityDashboardView: FC<OpportunityDashboardViewProps> = ({ entities, state, options }) => {
  const { t } = useTranslation();

  const { ecoverseId } = useOpportunity();

  const { opportunity, discussions } = entities;
  const lifecycle = opportunity?.lifecycle;
  const communityId = opportunity?.community?.id || '';
  const members = (opportunity?.community?.members || []) as User[]; // TODO [ATS]:
  const projects = opportunity?.projects || [];

  const { context, displayName } = opportunity;
  const { visual, tagline = '', vision = '' } = context ?? {};
  const banner = visual?.banner;

  const { loading } = state;
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <DashboardGenericSection bannerUrl={banner} headerText={displayName}>
            <Typography component={Markdown} variant="body1" children={tagline}></Typography>
            <SectionHeader text={t('components.contextSegment.vision.title')}></SectionHeader>
            <Typography component={Markdown} variant="body1" children={vision}></Typography>
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardOpportunityStatistics
            headerText={'Opportunity Statistic'}
            activities={entities.activity}
            helpText={'Some help here'}
            lifecycle={lifecycle}
            loading={loading}
          />
          <SectionSpacer />
          <DashboardUpdatesSection entities={{ ecoverseId: ecoverseId, communityId: communityId }} />
          <SectionSpacer />
          <DashboardDiscussionsSection discussions={discussions} isMember={options.isMemberOfOpportunity} />
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
          <SectionSpacer />
          <DashboardCommunitySectionV2 members={members} />
        </Grid>
      </Grid>

      {/* <Section
        classes={{
          background: theme =>
            visual?.banner ? `url("${visual.banner}") no-repeat center center / cover` : theme.palette.neutral.main,
          coverBackground: theme => hexToRGBA(theme.palette.neutral.main, 0.4),
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
        details={
          <ActivityCard
            title={t('pages.activity.title', { blockName: t('pages.opportunity.title') })}
            lifecycle={opportunity.lifecycle}
            items={entities.activity}
            classes={{ padding: theme => theme.spacing(4) }}
          />
        }
      >
        <Box component={Body} display={'flex'} flexDirection={'column'} flexGrow={1}>
          <Box display={'flex'} alignItems={'center'} flexGrow={1}>
            <SectionHeader
              text={displayName}
              className={clsx('flex-grow-1', styles.title)}
              classes={{
                color: theme => theme.palette.neutralLight.main,
              }}
            />
          </Box>
          <Box flexDirection={'row'}>
            <Button
              as={RouterLink}
              to={`${url}/projects`}
              className={styles.offset}
              inset
              variant="semiTransparent"
              text={t('pages.opportunity.sections.header.buttons.projects.text')}
            />
            <>
              {entities.links.map((l, i) => (
                <Button
                  key={i}
                  as="a"
                  className={clsx(styles.offset, styles.link)}
                  inset
                  variant="semiTransparent"
                  text={l.name}
                  href={l.uri}
                  target="_blank"
                />
              ))}
            </>
          </Box>
        </Box>
      </Section>
      <AuthenticationBackdrop blockName={t('pages.opportunity.sections.community.header')}>
        <DiscussionsProvider>
          <OpportunityCommunitySection
            title={t('pages.opportunity.sections.community.header')}
            subTitle={t('pages.opportunity.sections.community.subheader')}
            ecoverseId={ecoverseId}
            opportunityId={id}
            body={context?.who}
            shuffle={true}
          />
        </DiscussionsProvider>
      </AuthenticationBackdrop>

      <Section hideDetails avatar={<Icon component={PersonCheckIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.potential.header')}>
          {options.isAuthenticated && !options.isMemberOfOpportunity && (
            <Box marginLeft={4}>
              <Button
                text={t('pages.opportunity.sections.potential.buttons.apply.text')}
                onClick={actions.onInterestOpen}
              />
            </Box>
          )}
        </SectionHeader>
        <SubHeader text={t('pages.opportunity.sections.potential.subheader')} />
      </Section>

      {options.isNoRelations ? (
        <Box display={'flex'} justifyContent={{ lg: 'center' }} alignItems={{ lg: 'center' }}>
          <Icon component={PeopleIcon} size={'xl'} color={'neutralMedium'} />
          <Typography variant={'h3'} color={'neutralMedium'}>
            {t('pages.opportunity.sections.collaborators.missing-collaborators')}
          </Typography>
        </Box>
      ) : (
        <>
          {entities.relations.incoming && entities.relations.incoming.length > 0 && (
            <CardContainer
              title={t('pages.opportunity.sections.collaborators.cards.users.title')}
              xs={12}
              md={6}
              lg={4}
              xl={3}
            >
              {entities.relations.incoming?.map((props, i) => (
                <RelationCard key={i} opportunityId={id} isAdmin={options.removeRelations} {...props} />
              ))}
            </CardContainer>
          )}
          {entities.relations.outgoing && entities.relations.outgoing.length > 0 && (
            <CardContainer
              title={t('pages.opportunity.sections.collaborators.cards.groups.title')}
              xs={12}
              md={6}
              lg={4}
              xl={3}
            >
              {entities.relations.outgoing?.map((props, i) => (
                <RelationCard key={i} opportunityId={id} isAdmin={options.removeRelations} {...props} />
              ))}
            </CardContainer>
          )}
        </>
      )}

      <InterestModal onHide={actions.onInterestClose} show={state.showInterestModal} opportunityId={id} />

      <div ref={projectRef} /> */}
    </>
  );
};
export default OpportunityDashboardView;
