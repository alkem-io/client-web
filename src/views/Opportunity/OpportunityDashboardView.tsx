import { ApolloError } from '@apollo/client';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardOpportunityStatistics from '../../components/composite/common/sections/DashboardOpportunityStatistics';
import Markdown from '../../components/core/Markdown';
import { Header as SectionHeader } from '../../components/core/Section';
import { SectionSpacer } from '../../components/core/Section/Section';
import Typography from '../../components/core/Typography';
import { useOpportunity } from '../../hooks';
import { OpportunityPageFragment, Reference } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import hexToRGBA from '../../utils/hexToRGBA';

const useStyles = makeStyles(theme => ({
  offset: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(4),
  },
  title: {
    filter: `drop-shadow(1px 1px ${hexToRGBA(theme.palette.neutral.main, 0.3)})`,
  },
  link: {
    color: theme.palette.background.paper,
  },
  tagline: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
}));

export interface OpportunityDashboardViewEntities {
  opportunity: OpportunityPageFragment;
  activity: ActivityItem[];
  availableActorGroupNames: string[];
  existingAspectNames: string[];
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

const OpportunityDashboardView: FC<OpportunityDashboardViewProps> = ({ entities, state, actions, options }) => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const styles = useStyles();

  const { ecoverseId } = useOpportunity();

  const opportunity = entities.opportunity;
  const lifecycle = opportunity?.lifecycle;

  const { id, context, displayName } = opportunity;
  const { visual, tagline = '', vision = '' } = context ?? {};
  const banner = visual?.banner;

  const projectRef = useRef<HTMLDivElement>(null);

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
          />
        </Grid>
        <Grid item xs={12} lg={6}></Grid>
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
