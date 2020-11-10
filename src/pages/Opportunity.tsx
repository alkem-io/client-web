import { ReactComponent as NodePlusIcon } from 'bootstrap-icons/icons/node-plus.svg';
import { ReactComponent as PersonCheckIcon } from 'bootstrap-icons/icons/person-check.svg';
import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import clsx from 'clsx';
import React, { FC, useMemo, useRef } from 'react';
import ActivityCard from '../components/ActivityPanel';
import Button from '../components/core/Button';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import {
  challenges as challengeLabels,
  community,
  projects as projectTexts,
} from '../components/core/Typography.dummy.json';
import Tag from '../components/core/Tag';
import { Theme } from '../context/ThemeProvider';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { createStyles } from '../hooks/useTheme';
import { PageProps } from './common';
import { Opportunity as OpportunityType, User } from '../generated/graphql';
import { ActorCard, AspectCard, RelationCard } from '../components/Opportunity/Cards';
import { CardContainer } from '../components/core/Container';
import Typography from '../components/core/Typography';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.shape.spacing(2),
    left: 0,
  },
  offset: {
    marginRight: theme.shape.spacing(4),
  },
}));

interface OpportunityPageProps extends PageProps {
  opportunity: OpportunityType;
  users: User[] | undefined;
}

const Opportunity: FC<OpportunityPageProps> = ({ paths, opportunity, users = [] }): React.ReactElement => {
  const styles = useStyles();
  useUpdateNavigation({ currentPaths: paths });
  const projectRef = useRef<HTMLDivElement>(null);
  const { name, aspects, projects = [], context, relations = [], actorGroups } = opportunity;
  const team = relations[0];
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

  // const actors = useMemo(() => {
  //   const stakeholders = actorGroups?.find(x => x.name === 'stakeholders')?.actors || [];
  //   const keyUsers = actorGroups?.find(x => x.name === 'key_users')?.actors || [];

  //   return [
  //     ...stakeholders.map(x => ({ ...x, name: `${x.name}`, type: 'stakeholder' })),
  //     ...keyUsers.map(x => ({ ...x, name: `${x.name}`, type: 'key user' })),
  //   ];
  // }, [actorGroups]);

  const activitySummary = useMemo(() => {
    return [
      {
        name: 'Projects',
        digit: projects.length,
        color: 'positive',
      },
      {
        name: 'Members',
        digit: users.length,
        color: 'neutralMedium',
      },
    ];
  }, [projects]);

  const opportunityProjects = [
    {
      title: 'MORE PROJECTS STARTING SOON',
      type: 'more',
    },
    {
      title: 'New project',
      type: 'add',
      onAdd: () => {
        console.log('new project');
      },
    },
  ];

  return (
    <>
      <Section
        classes={{
          background: theme => theme.palette.primary,
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
              className="flex-grow-1"
              classes={{ color: (theme: Theme) => theme.palette.neutralLight }}
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
            {/* <Button className={styles.offset} inset variant="primary" text="demo" onClick={() => console.log('demo')} />
            <Button
              className={styles.offset}
              inset
              variant="primary"
              text="github"
              onClick={() => console.log('github')}
            /> */}
          </div>
        </Body>
        {team && <Tag text={team.actorName} className={clsx('position-absolute', styles.tag)} color="neutralMedium" />}
      </Section>
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
        <SectionHeader text={'Collaborative potential'} />
        <SubHeader text={'Teams & People that showed interest'} />
      </Section>
      {relations && (
        <CardContainer xs={12} md={6} lg={4} xl={3}>
          {relations?.map((props, i) => (
            <RelationCard key={i} {...props} />
          ))}
        </CardContainer>
      )}
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
      <div ref={projectRef}></div>
      <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
        <SectionHeader text={projectTexts.header} tagText={'Comming soon'} />
        <SubHeader text={'Changing the world one project at a time'} />
        <Body text={'Manage your projects and suggest new ones to your stakeholders.'}></Body>
      </Section>
      <CardContainer cardHeight={480} xs={12} md={6} lg={4} xl={3}>
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
