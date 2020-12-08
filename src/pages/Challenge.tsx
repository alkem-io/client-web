import { ReactComponent as GemIcon } from 'bootstrap-icons/icons/gem.svg';
import { ReactComponent as JournalBookmarkIcon } from 'bootstrap-icons/icons/journal-text.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import ActivityCard from '../components/ActivityPanel';
import { OpportunityCard } from '../components/Challenge/Cards';
import Avatar from '../components/core/Avatar';
import AvatarContainer from '../components/core/AvatarContainer';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { community, projects as projectTexts } from '../components/core/Typography.dummy.json';
import AuthenticationBackdrop from '../components/layout/AuthenticationBackdrop';
import { Theme } from '../context/ThemeProvider';
import { Challenge as ChallengeType, ContextInput, Organisation, User } from '../generated/graphql';
import { useUpdateNavigation } from '../hooks/useNavigation';
import hexToRGBA from '../utils/hexToRGBA';
import { PageProps } from './common';
import { UserProvider } from './Ecoverse';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { createStyles } from '../hooks/useTheme';
import clsx from 'clsx';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import ContextEdit from '../components/ContextEdit';

const useOrganizationStyles = createStyles(theme => ({
  organizationWrapper: {
    display: 'flex',
    gap: `${theme.shape.spacing(1)}px`,
    flexWrap: 'wrap',
  },
  column: {
    flexDirection: 'column',
  },
  imgContainer: {
    display: 'flex',
    flex: '0 45%',
    width: '100%',
    margin: '0 auto',
  },
  img: {
    height: 'initial',
    maxWidth: '100%',
    maxHeight: 150,
    margin: '0 auto',
    objectFit: 'contain',
  },
  link: {
    marginTop: `${theme.shape.spacing(2)}px`,
    marginRight: `${theme.shape.spacing(4)}px`,
  },
}));

const OrganisationBanners: FC<{ organizations: Organisation[] }> = ({ organizations }) => {
  const styles = useOrganizationStyles();

  return (
    <>
      <div className={clsx(styles.organizationWrapper, organizations.length === 2 && styles.column)}>
        {organizations.map((org, index) => {
          if (index > 4) return null;
          return (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id={`challenge-${org.id}-tooltip`}>{org.name}</Tooltip>}
              key={index}
            >
              <div className={styles.imgContainer}>
                <img src={org.profile?.avatar} alt={org.name} className={styles.img} />
              </div>
            </OverlayTrigger>
          );
        })}
      </div>

      {organizations.length > 4 && (
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="challenge-rest-tooltip">{organizations.map(x => x.name).join(', ')}</Tooltip>}
        >
          <div className={'d-flex'}>
            <Typography variant="h3">And more...</Typography>
          </div>
        </OverlayTrigger>
      )}
    </>
  );
};

interface ChallengePageProps extends PageProps {
  challenge: ChallengeType;
  users?: User[];
}

const useChallengeStyles = createStyles(theme => ({
  link: {
    marginTop: `${theme.shape.spacing(2)}px`,
    marginRight: `${theme.shape.spacing(4)}px`,
    '&:hover': {
      color: theme.palette.background,
    },
  },
  edit: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

const Challenge: FC<ChallengePageProps> = ({ paths, challenge, users = [] }): React.ReactElement => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const styles = useChallengeStyles();

  const [isEditOpened, setIsEditOpened] = useState<boolean>(false);

  const opportunityRef = useRef<HTMLDivElement>(null);
  useUpdateNavigation({ currentPaths: paths });
  const { name, context, opportunities, leadOrganisations, id } = challenge;
  const { references, background, tagline, who } = context || {};
  const visual = references?.find(x => x.name === 'visual');
  const video = references?.find(x => x.name === 'video');

  const projects = useMemo(
    () =>
      opportunities?.flatMap(o =>
        o?.projects?.flatMap(p => ({
          caption: o.name,
          url: `${url}/opportunities/${o.textID}/projects/${p.textID}`,
          ...p,
        }))
      ),
    [opportunities]
  );

  const challengeProjects = useMemo(
    () => [
      ...(projects || []).map(p => ({
        title: p?.name || '',
        description: p?.description,
        caption: p?.caption,
        tag: { status: 'positive', text: p?.state || '' },
        type: 'display',
        onSelect: () => history.replace(p?.url || ''),
      })),
      {
        title: 'MORE PROJECTS STARTING SOON',
        type: 'more',
      },
    ],
    [projects]
  );

  const activitySummary = useMemo(() => {
    return [
      { name: 'Opportunities', digit: opportunities?.length || 0, color: 'primary' },
      {
        name: 'Projects',
        digit: projects?.length || 0,
        color: 'positive',
      },
      // {
      //   name: 'Members',
      //   digit: users?.length,
      //   color: 'neutralMedium',
      // },
    ];
  }, [opportunities, projects, users]);

  const challengeRefs = challenge?.context?.references
    ?.filter(r => !r.name.includes('visual') || r.uri === '' || r.uri === '""')
    ?.slice(0, 3);

  return (
    <>
      <Section
        details={
          <ActivityCard
            title={'challenge activity'}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={activitySummary as any}
            classes={{ padding: (theme: Theme) => `${theme.shape.spacing(4)}px` }}
          />
        }
        classes={{
          background: (theme: Theme) =>
            visual ? `url("${visual.uri}") no-repeat center center / cover` : theme.palette.neutral,
          coverBackground: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <Body className="d-flex flex-column flex-grow-1">
          <div className="d-flex align-items-center flex-grow-1">
            <SectionHeader
              text={name}
              className="flex-grow-1"
              classes={{ color: (theme: Theme) => theme.palette.neutralLight }}
            />
            <OverlayTrigger
              placement={'bottom'}
              overlay={<Tooltip id={'Edit challenge context'}>Edit challenge context</Tooltip>}
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
              variant={'challenge'}
              show={isEditOpened}
              onHide={() => setIsEditOpened(false)}
              data={challenge.context as ContextInput}
              id={id}
            />
          </div>

          <div>
            <Button
              inset
              variant="whiteStatic"
              text="opportunities"
              onClick={() => opportunityRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className={styles.link}
            />
            {challengeRefs?.map((l, i) => (
              <Button
                key={i}
                as="a"
                inset
                variant="whiteStatic"
                text={l.name}
                href={l.uri}
                target="_blank"
                className={styles.link}
              />
            ))}
          </div>
        </Body>
      </Section>
      <Section
        avatar={<Icon component={JournalBookmarkIcon} color="primary" size="xl" />}
        details={<OrganisationBanners organizations={leadOrganisations} />}
      >
        <SectionHeader text="Challenge details" />
        <SubHeader text={tagline} />
        <Body text={background}>{video && <Button text="See more" as={'a'} href={video.uri} target="_blank" />}</Body>
      </Section>
      <Divider />
      <AuthenticationBackdrop blockName={'community'}>
        <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
          <SectionHeader text={community.header} />
          <SubHeader text={community.subheader} />
          <Body text={who}>
            <UserProvider users={users}>
              {populated => (
                <>
                  <AvatarContainer className="d-flex" title={'Active community members'}>
                    {populated.map((u, i) => (
                      <Avatar className={'d-inline-flex'} key={i} src={u.profile?.avatar} />
                    ))}
                  </AvatarContainer>
                  <div style={{ flexBasis: '100%' }}></div>
                  {users.length - populated.length > 0 && (
                    <Typography variant="h3" as="h3" color="positive">
                      {`... + ${users.length - populated.length} other contributors`}
                    </Typography>
                  )}
                </>
              )}
            </UserProvider>
            <Button text="Explore and connect" as={Link} to="/community" />
          </Body>
        </Section>
      </AuthenticationBackdrop>
      <Divider />
      <div ref={opportunityRef} />
      <Section avatar={<Icon component={GemIcon} color="primary" size="xl" />}>
        <SectionHeader text="OPPORTUNITIES" />
        <SubHeader text="Potential solutions for this challenge" />
        {!opportunities ||
          (opportunities.length === 0 && <Body text={'No opportunities found for this challenge'}></Body>)}
      </Section>
      {opportunities && (
        <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
          {opportunities?.map((props, i) => (
            <OpportunityCard key={i} {...props} url={`${url}/opportunities/${props.textID}`} />
          ))}
        </CardContainer>
      )}
      <Divider />
      <AuthenticationBackdrop blockName={'projects'}>
        <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
          <SectionHeader text={projectTexts.header} tagText={'Coming soon'} />
          <SubHeader text={'Changing the world one project at a time'} />
          <Body text={'Manage your projects and suggest new ones to your stakeholders.'} />
        </Section>
        <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
          {challengeProjects.map(({ type, ...rest }, i) => {
            const Component = SwitchCardComponent({ type });
            return <Component {...rest} key={i} />;
          })}
        </CardContainer>
      </AuthenticationBackdrop>
      <Divider />
    </>
  );
};

export { Challenge };
