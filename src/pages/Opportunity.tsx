import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as NodePlusIcon } from 'bootstrap-icons/icons/node-plus.svg';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as PersonCheckIcon } from 'bootstrap-icons/icons/person-check.svg';
import { ReactComponent as StopWatch } from 'bootstrap-icons/icons/stopwatch.svg';
import clsx from 'clsx';
import React, { FC, SyntheticEvent, useMemo, useRef, useState } from 'react';
import { Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import ActivityCard from '../components/ActivityPanel';
import { CommunitySection } from '../components/Community/CommunitySection';
import ContextEdit from '../components/ContextEdit';
import Button from '../components/core/Button';
import Container, { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
// import Tag from '../components/core/Tag';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';
import InterestModal from '../components/Ecoverse/InterestModal';
import ActorGroupCreateModal from '../components/Opportunity/ActorGroupCreateModal';
import { ActorCard, AspectCard, NewActorCard, NewAspectCard, RelationCard } from '../components/Opportunity/Cards';
import { Theme } from '../context/ThemeProvider';
import { useOpportunityLifecycleQuery, useOpportunityTemplateQuery } from '../generated/graphql';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { createStyles } from '../hooks/useTheme';
import { useUserContext } from '../hooks/useUserContext';
import {
  AuthorizationCredential,
  Context,
  Opportunity as OpportunityType,
  Project,
  User,
} from '../types/graphql-schema';
import hexToRGBA from '../utils/hexToRGBA';
import { replaceAll } from '../utils/replaceAll';
import { PageProps } from './common';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.shape.spacing(2),
    left: 0,
  },
  offset: {
    marginTop: theme.shape.spacing(2),
    marginRight: theme.shape.spacing(4),
  },
  title: {
    filter: `drop-shadow(1px 1px ${hexToRGBA(theme.palette.neutral, 0.3)})`,
  },
  link: {
    color: theme.palette.background,
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

interface Params {
  opportunityId?: string;
  ecoverseId?: string;
}

interface OpportunityPageProps extends PageProps {
  opportunity: OpportunityType;
  users: User[] | undefined;
  onProjectTransition: (project: Project | undefined) => void;
  permissions: { projectWrite: boolean };
}

const Opportunity: FC<OpportunityPageProps> = ({
  paths,
  opportunity,
  users = [],
  permissions,
  onProjectTransition,
}): React.ReactElement => {
  const { t } = useTranslation();
  const styles = useStyles();
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
  const [isEditOpened, setIsEditOpened] = useState<boolean>(false);
  const history = useHistory();

  useUpdateNavigation({ currentPaths: paths });

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  const userName = user?.user.displayName;

  const isAdmin =
    user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
    user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity);

  const { data: config } = useOpportunityTemplateQuery();
  const aspectsTypes = config?.configuration.template.opportunities[0].aspects;
  const actorGroupTypes = config?.configuration.template.opportunities[0].actorGroups;

  const { ecoverseId = '' } = useParams<Params>();

  const { displayName: name, projects = [], relations = [], context, community, id } = opportunity;

  const actorGroups = context?.ecosystemModel?.actorGroups || [];

  const { references, background, tagline, who, impact, vision, aspects = [] } = context || {};
  const visual = references?.find(x => x.name === 'poster');
  const meme = references?.find(x => x.name === 'meme');
  const links = references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1);
  const isMemberOfOpportunity = relations.find(r => r.actorName === userName);
  const membersCount = (community && community.members?.length) || 0;

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);
  const interestsCount = (incoming?.length || 0) + (outgoing?.length || 0);

  const existingAspectNames = aspects?.map(a => replaceAll('_', ' ', a.title)) || [];
  const isAspectAddAllowed = isAdmin && aspectsTypes && aspectsTypes.length > existingAspectNames.length;
  const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const { data: opportunityLifecycleQuery } = useOpportunityLifecycleQuery({
    variables: { ecoverseId, opportunityId: id },
  });

  const projectRef = useRef<HTMLDivElement>(null);

  const activitySummary = useMemo(() => {
    return [
      {
        name: 'Projects',
        digit: projects.length,
        color: 'positive',
      },
      {
        name: 'Interests',
        digit: interestsCount,
        color: 'primary',
      },
      {
        name: 'Members',
        digit: membersCount,
        color: 'neutralMedium',
      },
    ];
  }, [projects, users]);

  const opportunityProjects = useMemo(() => {
    const projectList = [
      ...projects.map(p => ({
        title: p.displayName,
        description: p.description,
        // tag: { status: 'positive', text: p.state || 'archive' },
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
  return (
    <>
      <Section
        classes={{
          background: (theme: Theme) =>
            visual ? `url("${visual.uri}") no-repeat center center / cover` : theme.palette.primary,
          coverBackground: (theme: Theme) => theme.palette.primary, // in case need to turn back to the monocolored opportunity header
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
        details={
          <ActivityCard
            title={'opportunity activity'}
            lifecycle={opportunityLifecycleQuery?.ecoverse.opportunity.lifecycle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={activitySummary as any}
            classes={{ padding: (theme: Theme) => `${theme.shape.spacing(4)}px` }}
          />
        }
      >
        <Body className="d-flex flex-column flex-grow-1">
          <div className="d-flex align-items-center flex-grow-1">
            <SectionHeader
              text={name}
              className={clsx('flex-grow-1', styles.title)}
              classes={{
                color: (theme: Theme) => theme.palette.neutralLight,
              }}
            />
            {user?.isAdmin && (
              <>
                <OverlayTrigger
                  placement={'bottom'}
                  overlay={
                    <Tooltip id={'Edit opportunity context'}>
                      {t('pages.opportunity.sections.header.buttons.edit.tooltip')}
                    </Tooltip>
                  }
                >
                  <Edit
                    color={'white'}
                    width={20}
                    height={20}
                    className={styles.edit}
                    onClick={() => setIsEditOpened(true)}
                  />
                </OverlayTrigger>
                <ContextEdit
                  variant={'opportunity'}
                  show={isEditOpened}
                  onHide={() => setIsEditOpened(false)}
                  data={opportunity.context as Context}
                  id={id}
                />
              </>
            )}
          </div>
          <div className="flex-row">
            <Button
              className={styles.offset}
              inset
              variant={'primary'}
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
                  variant={'primary'}
                  text={l.name}
                  href={l.uri}
                  target="_blank"
                />
              ))}
            </>
          </div>
        </Body>
        {/*{team && <Tag text={team.actorName} className={clsx('position-absolute', styles.tag)} color="neutralMedium" />}*/}
      </Section>
      <Container className={'p-4'}>
        {tagline && (
          <Row>
            <Col md={12}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SubHeader text={tagline} className={styles.tagline} />
              </Section>
            </Col>
          </Row>
        )}
        <Row>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={t('pages.opportunity.sections.problem.header')} />
              <SubHeader text={background} />
            </Section>
          </Col>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={t('pages.opportunity.sections.long-term-vision.header')} icon={<StopWatch />} />
              <SubHeader text={vision} />
            </Section>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={t('pages.opportunity.sections.who.header')} />
              <SubHeader text={who} />
            </Section>
          </Col>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={t('pages.opportunity.sections.impact.header')} />
              <SubHeader text={impact} />
            </Section>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6} />
          {!hideMeme && (
            <Col sm={12} md={6}>
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
            </Col>
          )}
        </Row>
      </Container>
      <Divider />
      <Section hideDetails avatar={<Icon component={NodePlusIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.adoption-ecosystem.header')}>
          {isAdmin && availableActorGroupNames.length > 0 && (
            <Button
              text={t('pages.opportunity.sections.adoption-ecosystem.buttons.add-actor-group.text')}
              onClick={() => setShowActorGroupModal(true)}
              className={'ml-4'}
            />
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
              xs={12}
              md={6}
              lg={4}
              xl={3}
              title={_name}
              fullHeight
              withCreate={<NewActorCard opportunityId={id} text={`Add ${_name}`} actorGroupId={actorGroupId} />}
            >
              {actors?.map((props, i) => (
                <ActorCard key={i} opportunityId={id} {...props} />
              ))}
            </CardContainer>
          );
        })}

      <Divider />

      <Section hideDetails avatar={<Icon component={PersonCheckIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.potential.header')}>
          {isAuthenticated && !isMemberOfOpportunity && (
            <Button
              text={t('pages.opportunity.sections.potential.buttons.apply.text')}
              onClick={() => setShowInterestModal(true)}
              className={'ml-4'}
            />
          )}
        </SectionHeader>
        <SubHeader text={t('pages.opportunity.sections.potential.subheader')} />
      </Section>

      <Divider />
      {isNoRelations ? (
        <div className={'d-flex justify-content-lg-center align-items-lg-center'}>
          <Icon component={PeopleIcon} size={'xl'} color={'neutralMedium'} />
          <Typography variant={'h3'} color={'neutralMedium'}>
            {t('pages.opportunity.sections.collaborators.missing-collaborators')}
          </Typography>
        </div>
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
                <RelationCard key={i} opportunityId={id} {...props} />
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
                <RelationCard key={i} opportunityId={id} {...props} />
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
            <AspectCard key={i} opportunityId={id} {...props} />
          ))}
        </CardContainer>
      )}
      <Divider />
      <CommunitySection
        title={t('pages.opportunity.sections.community.title')}
        subTitle={t('pages.opportunity.sections.community.subtitle')}
        users={users}
        shuffle={true}
        onExplore={() => history.push('/community')}
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

export { Opportunity };
