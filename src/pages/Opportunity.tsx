import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as NodePlusIcon } from 'bootstrap-icons/icons/node-plus.svg';
import { ReactComponent as PersonCheckIcon } from 'bootstrap-icons/icons/person-check.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as StopWatch } from 'bootstrap-icons/icons/stopwatch.svg';
import clsx from 'clsx';
import React, { FC, SyntheticEvent, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import ActivityCard from '../components/ActivityPanel';
import Button from '../components/core/Button';
import Container, { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
// import Tag from '../components/core/Tag';
import { projects as projectTexts } from '../components/core/Typography.dummy.json';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';
import { ActorCard, AspectCard, RelationCard } from '../components/Opportunity/Cards';
import { Theme } from '../context/ThemeProvider';
import { Opportunity as OpportunityType, Project, User } from '../generated/graphql';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { createStyles } from '../hooks/useTheme';
import hexToRGBA from '../utils/hexToRGBA';
import { PageProps } from './common';
import Typography from '../components/core/Typography';
import InterestModal from '../components/Ecoverse/InterestModal';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useUserContext } from '../hooks/useUserContext';

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
}));

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
  // styles
  const styles = useStyles();
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const { isAuthenticated } = useAuthenticate();
  useUpdateNavigation({ currentPaths: paths });
  const projectRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const userName = user?.user.name;

  // data
  const { name, aspects, projects = [], relations = [], actorGroups, context, id } = opportunity;
  const { references, background, tagline, who, impact, vision } = context || {};
  const visual = references?.find(x => x.name === 'poster');
  const meme = references?.find(x => x.name === 'meme');

  const links = references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1);
  const isMemberOfOpportunity = relations.find(r => r.actorName === userName);

  // const team = relations[0];
  const stakeholders = useMemo(
    () =>
      actorGroups
        ?.find(x => x.name === 'stakeholders')
        ?.actors?.map(x => ({ ...x, name: `\n${x.name}`, type: 'stakeholder' })),
    [actorGroups]
  );
  const keyUsers = useMemo(
    () =>
      actorGroups?.find(x => x.name === 'key_users')?.actors?.map(x => ({ ...x, name: `${x.name}`, type: 'key user' })),
    [actorGroups]
  );
  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);
  const interestsCount = (incoming?.length || 0) + (outgoing?.length || 0);

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
    ];
  }, [projects, users]);

  const opportunityProjects = useMemo(() => {
    const projectList = [
      ...projects.map(p => ({
        title: p.name,
        description: p.description,
        // tag: { status: 'positive', text: p.state || 'archive' },
        type: 'display',
        onSelect: () => onProjectTransition(p),
      })),
      {
        title: 'MORE PROJECTS STARTING SOON',
        type: 'more',
      },
    ];

    if (permissions.projectWrite) {
      projectList.push({
        title: 'New project',
        type: 'add',
        onSelect: () => onProjectTransition(undefined),
      });
    }

    return projectList;
  }, [projects, onProjectTransition, permissions.projectWrite]);

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={activitySummary as any}
            classes={{ padding: (theme: Theme) => `${theme.shape.spacing(4)}px` }}
          />
        }
      >
        <Body className="d-flex flex-column flex-grow-1">
          <div className="d-flex flex-column flex-grow-1">
            <SectionHeader
              text={name}
              className={clsx('flex-grow-1', styles.title)}
              classes={{
                color: (theme: Theme) => theme.palette.neutralLight,
              }}
            />
          </div>
          <div className="flex-row">
            <Button
              className={styles.offset}
              inset
              variant="primary"
              text="projects"
              onClick={() => projectRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
            <>
              {links?.map((l, i) => (
                <Button
                  key={i}
                  as="a"
                  className={clsx(styles.offset, styles.link)}
                  inset
                  variant="primary"
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
              <SectionHeader text={'Problem'} />
              <SubHeader text={background} />
            </Section>
          </Col>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={'Long term vision'} icon={<StopWatch />} />
              <SubHeader text={vision} />
            </Section>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={'Who'} />
              <SubHeader text={who} />
            </Section>
          </Col>
          <Col sm={12} md={6}>
            <Section hideAvatar hideDetails gutters={{ content: true }}>
              <SectionHeader text={'Impact'} />
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
        <SectionHeader text={'ADOPTION ECOSYSTEM'} />
        <SubHeader text={'Stakeholders & Key users'} />
      </Section>
      {stakeholders && stakeholders.length > 0 && (
        <CardContainer xs={12} md={6} lg={4} xl={3} title="stakeholders">
          {stakeholders?.map((props, i) => (
            <ActorCard key={i} {...props} />
          ))}
        </CardContainer>
      )}
      {keyUsers && keyUsers.length > 0 && (
        <CardContainer xs={12} md={6} lg={4} xl={3} title="key users">
          {keyUsers?.map((props, i) => (
            <ActorCard key={i} {...props} />
          ))}
        </CardContainer>
      )}
      <Divider />
      <Section hideDetails avatar={<Icon component={PersonCheckIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Collaborative potential'}>
          {isAuthenticated && !isMemberOfOpportunity && (
            <Button
              text={'Interested in collaborating?'}
              onClick={() => setShowInterestModal(true)}
              className={'ml-4'}
            />
          )}
        </SectionHeader>
        <SubHeader text={'Teams & People that showed interest'} />
      </Section>
      {isNoRelations ? (
        <div className={'d-flex justify-content-lg-center align-items-lg-center'}>
          <Icon component={PeopleIcon} size={'xl'} color={'neutralMedium'} />
          <Typography variant={'h3'} color={'neutralMedium'}>
            Sorry, there are no related people or groups yet
          </Typography>
        </div>
      ) : (
        <>
          {incoming && incoming.length > 0 && (
            <CardContainer title={'Users'} xs={12} md={6} lg={4} xl={3}>
              {incoming?.map((props, i) => (
                <RelationCard key={i} {...props} />
              ))}
            </CardContainer>
          )}
          {outgoing && outgoing.length > 0 && (
            <CardContainer title={'Groups'} xs={12} md={6} lg={4} xl={3}>
              {outgoing?.map((props, i) => (
                <RelationCard key={i} {...props} />
              ))}
            </CardContainer>
          )}
        </>
      )}

      <InterestModal onHide={() => setShowInterestModal(false)} show={showInterestModal} opportunityId={id} />

      <Divider />
      <Section hideDetails avatar={<Icon component={CardListIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Solution details'} />
        <SubHeader text={'How we envision the first steps'} />
      </Section>
      {aspects && (
        <CardContainer xs={12} md={6} lg={4} xl={3}>
          {aspects?.map((props, i) => (
            <AspectCard key={i} {...props} />
          ))}
        </CardContainer>
      )}
      <Divider />
      <div ref={projectRef} />
      <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
        <SectionHeader text={projectTexts.header} tagText={'Coming soon'} />
        <SubHeader text={'Changing the world one project at a time'} />
        <Body text={'Manage your projects and suggest new ones to your stakeholders.'} />
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
