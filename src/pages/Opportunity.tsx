import { Box, Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as NodePlusIcon } from 'bootstrap-icons/icons/node-plus.svg';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as PersonCheckIcon } from 'bootstrap-icons/icons/person-check.svg';
import { ReactComponent as StopWatch } from 'bootstrap-icons/icons/stopwatch.svg';
import clsx from 'clsx';
import React, { FC, SyntheticEvent, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import ActivityCard, { ActivityCardItem } from '../components/ActivityPanel';
import { CommunitySection } from '../components/Community/CommunitySection';
import ContextEdit from '../components/ContextEdit';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/CardContainer';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Markdown from '../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';
import InterestModal from '../components/Ecoverse/InterestModal';
import ActorGroupCreateModal from '../components/Opportunity/ActorGroupCreateModal';
import { ActorCard, AspectCard, NewActorCard, NewAspectCard, RelationCard } from '../components/Opportunity/Cards';
import { ActorWhiteboard } from '../components/Opportunity/ActorWhiteboard';
import { useAuthenticationContext, useEcoverse, useUpdateNavigation, useUserContext } from '../hooks';
import {
  useOpportunityActivityQuery,
  useOpportunityLifecycleQuery,
  useOpportunityTemplateQuery,
  useOpportunityEcosystemDetailsQuery,
} from '../hooks/generated/graphql';
import { createStyles } from '../hooks/useTheme';
import { SEARCH_PAGE } from '../models/constants';
import { Context, Opportunity as OpportunityType, Project, User } from '../models/graphql-schema';
import getActivityCount from '../utils/get-activity-count';
import hexToRGBA from '../utils/hexToRGBA';
import { replaceAll } from '../utils/replaceAll';
import { PageProps } from './common';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.spacing(2),
    left: 0,
  },
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
  edit: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

interface OpportunityPageProps extends PageProps {
  opportunity: OpportunityType;
  users: User[] | undefined;
  onProjectTransition: (project: Project | undefined) => void;
  permissions: {
    projectWrite: boolean;
    editActorGroup: boolean;
    editAspect: boolean;
    editActors: boolean;
    removeRelations: boolean;
  };
}

const OpportunityPage: FC<OpportunityPageProps> = ({
  paths,
  opportunity,
  users = [],
  permissions = {
    projectWrite: false,
    editActorGroup: false,
    editAspect: false,
    editActors: false,
    removeRelations: false,
  },
  onProjectTransition,
}): React.ReactElement => {
  const { t } = useTranslation();
  const styles = useStyles();
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
  const [isEditOpened, setIsEditOpened] = useState<boolean>(false);
  const history = useHistory();
  const { ecoverseId } = useEcoverse();

  useUpdateNavigation({ currentPaths: paths });

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  const userName = user?.user.displayName;

  const { data: config } = useOpportunityTemplateQuery();
  const aspectsTypes = config?.configuration.template.opportunities[0].aspects;
  const actorGroupTypes = config?.configuration.template.opportunities[0].actorGroups;

  const { data: _activity } = useOpportunityActivityQuery({
    variables: { ecoverseId, opportunityId: opportunity?.id },
  });
  const { data: ecosystem } = useOpportunityEcosystemDetailsQuery({
    variables: { ecoverseId, opportunityId: opportunity?.id },
  });
  const activity = _activity?.ecoverse?.opportunity?.activity || [];

  const { displayName: name, projects = [], relations = [], context, id } = opportunity;

  const actorGroups = context?.ecosystemModel?.actorGroups || [];

  const {
    references,
    background = '',
    tagline,
    who = '',
    impact = '',
    vision = '',
    aspects = [],
    visual,
  } = context || {};
  const meme = references?.find(x => x.name === 'meme');
  const links = references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1);
  const isMemberOfOpportunity = relations.find(r => r.actorName === userName);

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);

  const existingAspectNames = aspects?.map(a => replaceAll('_', ' ', a.title)) || [];
  const isAspectAddAllowed = permissions.editAspect && aspectsTypes && aspectsTypes.length > existingAspectNames.length;
  const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const { data: opportunityLifecycleQuery } = useOpportunityLifecycleQuery({
    variables: { ecoverseId, opportunityId: id },
  });

  const projectRef = useRef<HTMLDivElement>(null);

  const activitySummary: ActivityCardItem[] = useMemo(() => {
    return [
      {
        name: t('pages.activity.projects'),
        digit: getActivityCount(activity, 'projects') || 0,
        color: 'positive',
      },
      {
        name: t('pages.activity.interests'),
        digit: getActivityCount(activity, 'relations') || 0,
        color: 'primary',
      },
      {
        name: t('pages.activity.members'),
        digit: getActivityCount(activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ];
  }, [activity]);

  const opportunityProjects = useMemo(() => {
    const projectList = [
      ...projects.map(p => ({
        title: p.displayName,
        description: p.description,
        type: 'display',
        onSelect: () => onProjectTransition(p),
      })),
      {
        title: t('pages.opportunity.sections.projects.more-projects'),
        type: 'more',
      },
    ];

    if (permissions.projectWrite) {
      projectList.push({
        title: t('pages.opportunity.sections.projects.new-project.header'),
        type: 'add',
        onSelect: () => onProjectTransition(undefined),
      });
    }

    return projectList;
  }, [projects, onProjectTransition, permissions.projectWrite, t]);

  const flatActors = actorGroups
    ?.filter(ag => ag.name !== 'collaborators')
    .flatMap(actorGroup => actorGroup.actors || []);
  return (
    <>
      <Section
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
            lifecycle={opportunityLifecycleQuery?.ecoverse.opportunity.lifecycle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={activitySummary}
            classes={{ padding: theme => `${theme.spacing(4)}px` }}
          />
        }
      >
        <Box component={Body} display={'flex'} flexDirection={'column'} flexGrow={1}>
          <Box display={'flex'} alignItems={'center'} flexGrow={1}>
            <SectionHeader
              text={name}
              className={clsx('flex-grow-1', styles.title)}
              classes={{
                color: theme => theme.palette.neutralLight.main,
              }}
            />
            {user?.isAdmin && (
              <>
                <Tooltip
                  placement={'bottom'}
                  id={'Edit opportunity context'}
                  title={t('pages.opportunity.sections.header.buttons.edit.tooltip') || ''}
                >
                  <Edit
                    color={'white'}
                    width={20}
                    height={20}
                    className={styles.edit}
                    onClick={() => setIsEditOpened(true)}
                  />
                </Tooltip>
                <ContextEdit
                  variant={'opportunity'}
                  show={isEditOpened}
                  onHide={() => setIsEditOpened(false)}
                  data={opportunity.context as Context}
                  id={id}
                />
              </>
            )}
          </Box>
          <Box flexDirection={'row'}>
            <Button
              className={styles.offset}
              inset
              variant="semiTransparent"
              text={t('pages.opportunity.sections.header.buttons.projects.text')}
              onClick={() => projectRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
            <>
              {links?.map((l, i) => (
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
        {/*{team && <Tag text={team.actorName} className={clsx('position-absolute', styles.tag)} color="neutralMedium" />}*/}
      </Section>
      <Container maxWidth="xl" className={'p-4'}>
        <Grid container spacing={2}>
          {tagline && (
            <Grid item md={12}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SubHeader text={tagline} className={styles.tagline} />
              </Section>
            </Grid>
          )}
          <Grid container spacing={2}>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.problem.header')} />
                <Body>
                  <Markdown children={background} />
                </Body>
              </Section>
            </Grid>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.long-term-vision.header')} icon={<StopWatch />} />
                <Body>
                  <Markdown children={vision} />
                </Body>
              </Section>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.who.header')} />
                <Body>
                  <Markdown children={who} />
                </Body>
              </Section>
            </Grid>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.impact.header')} />
                <Body>
                  <Markdown children={impact} />
                </Body>
              </Section>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item sm={12} md={6} />
            {!hideMeme && (
              <Grid item sm={12} md={6}>
                <Section hideAvatar hideDetails gutters={{ content: true }}>
                  <Body>
                    {meme && (
                      <div>
                        <img
                          src={meme?.uri}
                          alt={meme?.description}
                          onError={(ev: SyntheticEvent<HTMLImageElement, Event>) => {
                            ev.currentTarget.style.display = 'none';
                            setHideMeme(true);
                          }}
                          height={240}
                        />
                      </div>
                    )}
                  </Body>
                </Section>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
      <Divider />
      <Section hideDetails avatar={<Icon component={NodePlusIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.adoption-ecosystem.header')}>
          {permissions.editActorGroup && availableActorGroupNames.length > 0 && (
            <Box marginLeft={3}>
              <Button
                text={t('pages.opportunity.sections.adoption-ecosystem.buttons.add-actor-group.text')}
                onClick={() => setShowActorGroupModal(true)}
              />
            </Box>
          )}
        </SectionHeader>
        <SubHeader text={t('pages.opportunity.sections.adoption-ecosystem.subheader')} />
      </Section>
      {actorGroups
        ?.filter(ag => ag.name !== 'collaborators') // TODO: remove when collaborators are deleted from actorGroups on server
        ?.map(({ id: actorGroupId, actors = [], name }, index) => {
          const _name = replaceAll('_', ' ', name);
          return (
            <CardContainer
              key={index}
              cardHeight={260}
              xs={12}
              md={6}
              lg={4}
              xl={3}
              title={_name}
              fullHeight
              withCreate={<NewActorCard opportunityId={id} text={`Add ${_name}`} actorGroupId={actorGroupId} />}
            >
              {actors?.map((props, i) => (
                <ActorCard key={i} opportunityId={id} isAdmin={permissions.editActors} {...props} />
              ))}
            </CardContainer>
          );
        })}

      <ActorWhiteboard
        ecosystemModel={ecosystem?.ecoverse.opportunity.context?.ecosystemModel}
        actors={flatActors}
      ></ActorWhiteboard>
      <Divider />

      <Section hideDetails avatar={<Icon component={PersonCheckIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.potential.header')}>
          {isAuthenticated && !isMemberOfOpportunity && (
            <Box marginLeft={4}>
              <Button
                text={t('pages.opportunity.sections.potential.buttons.apply.text')}
                onClick={() => setShowInterestModal(true)}
              />
            </Box>
          )}
        </SectionHeader>
        <SubHeader text={t('pages.opportunity.sections.potential.subheader')} />
      </Section>

      <Divider />
      {isNoRelations ? (
        <Box display={'flex'} justifyContent={{ lg: 'center' }} alignItems={{ lg: 'center' }}>
          <Icon component={PeopleIcon} size={'xl'} color={'neutralMedium'} />
          <Typography variant={'h3'} color={'neutralMedium'}>
            {t('pages.opportunity.sections.collaborators.missing-collaborators')}
          </Typography>
        </Box>
      ) : (
        <>
          {incoming && incoming.length > 0 && (
            <CardContainer
              title={t('pages.opportunity.sections.collaborators.cards.users.title')}
              xs={12}
              md={6}
              lg={4}
              xl={3}
            >
              {incoming?.map((props, i) => (
                <RelationCard key={i} opportunityId={id} isAdmin={permissions.removeRelations} {...props} />
              ))}
            </CardContainer>
          )}
          {outgoing && outgoing.length > 0 && (
            <CardContainer
              title={t('pages.opportunity.sections.collaborators.cards.groups.title')}
              xs={12}
              md={6}
              lg={4}
              xl={3}
            >
              {outgoing?.map((props, i) => (
                <RelationCard key={i} opportunityId={id} isAdmin={permissions.removeRelations} {...props} />
              ))}
            </CardContainer>
          )}
        </>
      )}

      {showInterestModal && (
        <InterestModal onHide={() => setShowInterestModal(false)} show={showInterestModal} opportunityId={id} />
      )}
      {showActorGroupModal && (
        <ActorGroupCreateModal
          onHide={() => setShowActorGroupModal(false)}
          show={showActorGroupModal}
          opportunityId={id}
          availableActorGroupNames={availableActorGroupNames}
        />
      )}

      <Divider />
      <Section hideDetails avatar={<Icon component={CardListIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.solution.header')} />
        <SubHeader text={t('pages.opportunity.sections.solution.subheader')} />
      </Section>

      {aspects && (
        <CardContainer
          xs={12}
          md={6}
          lg={4}
          xl={3}
          withCreate={
            isAspectAddAllowed && (
              <NewAspectCard
                opportunityId={id}
                text={'Add'}
                actorGroupId={'12'}
                existingAspectNames={existingAspectNames}
              />
            )
          }
        >
          {aspects?.map((props, i) => (
            <AspectCard key={i} opportunityId={id} isAdmin={permissions.editAspect} {...props} />
          ))}
        </CardContainer>
      )}
      <Divider />
      <CommunitySection
        title={t('pages.opportunity.sections.community.title')}
        subTitle={t('pages.opportunity.sections.community.subtitle')}
        users={users}
        shuffle={true}
        onExplore={() => history.push(SEARCH_PAGE)}
      />
      <Divider />
      <div ref={projectRef} />
      <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
        <SectionHeader
          text={t('pages.opportunity.sections.projects.header.text')}
          tagText={t('pages.opportunity.sections.projects.header.tag')}
        />
        <SubHeader text={t('pages.opportunity.sections.projects.subheader')} />
        <Body text={t('pages.opportunity.sections.projects.body')} />
      </Section>
      <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
        {opportunityProjects.map(({ type, ...rest }, i) => {
          const Component = SwitchCardComponent({ type });
          return <Component {...rest} key={i} />;
        })}
      </CardContainer>
      <Divider />
    </>
  );
};

export { OpportunityPage };
