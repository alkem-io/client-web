import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as GemIcon } from 'bootstrap-icons/icons/gem.svg';
import { ReactComponent as JournalBookmarkIcon } from 'bootstrap-icons/icons/journal-text.svg';
import clsx from 'clsx';
import React, { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { Link } from '@material-ui/core';
import { ActivityItem } from '../components/ActivityPanel/Activities';
import ActivityCard from '../components/ActivityPanel/ActivityCard';
import BackdropWithMessage from '../components/BackdropWithMessage';
import ChallengeCommunitySection from '../components/Challenge/ChallengeCommunitySection';
import OpportunityCard from '../components/Challenge/OpportunityCard';
import SettingsButton from '../components/composite/common/SettingsButton/SettingsButton';
import Button from '../components/core/Button';
import CardFilter from '../components/core/card-filter/CardFilter';
import { CardContainer } from '../components/core/CardContainer';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import { Image } from '../components/core/Image';
import Markdown from '../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';
import OrganizationPopUp from '../components/Organizations/OrganizationPopUp';
import { useAuthenticationContext, useUpdateNavigation, useUserContext, createStyles, useEcoverse } from '../hooks';
import {
  useChallengeActivityQuery,
  useChallengeLifecycleQuery,
  useUserApplicationsQuery,
} from '../hooks/generated/graphql';
import { SEARCH_PAGE } from '../models/constants';
import { Challenge as ChallengeType, Organisation } from '../models/graphql-schema';
import getActivityCount from '../utils/get-activity-count';
import hexToRGBA from '../utils/hexToRGBA';
import {
  buildAdminChallengeUrl,
  buildChallengeApplyUrl,
  buildEcoverseApplyUrl,
  buildOrganisationUrl,
} from '../utils/urlBuilders';
import { PageProps } from './common';
import ApplicationButton from '../components/composite/common/ApplicationButton/ApplicationButton';
import { Loading } from '../components/core';

const useOrganizationStyles = createStyles(theme => ({
  organizationWrapper: {
    display: 'flex',
    gap: `${theme.spacing(1)}px`,
    flexWrap: 'wrap',
    '&:hover': {
      cursor: 'pointer',
    },
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
    marginTop: `${theme.spacing(2)}px`,
    marginRight: `${theme.spacing(4)}px`,
  },
}));

interface Props {
  organizations: Organisation[];
}

const OrganisationBanners: FC<Props> = ({ organizations }) => {
  const { t } = useTranslation();
  const styles = useOrganizationStyles();
  const [modalId, setModalId] = useState<string | null>(null);

  return (
    <>
      <div className={clsx(styles.organizationWrapper, organizations.length === 2 && styles.column)}>
        {organizations.map((org, index) => {
          if (index > 4) return null;
          return (
            <Tooltip placement="bottom" id={`challenge-${org.id}-tooltip`} title={org.displayName} key={index}>
              <div className={styles.imgContainer}>
                <Link component={RouterLink} to={buildOrganisationUrl(org.nameID)}>
                  <Image src={org.profile?.avatar} alt={org.displayName} className={styles.img} />
                </Link>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {!!modalId && <OrganizationPopUp id={modalId} onHide={() => setModalId(null)} />}

      {organizations.length > 4 && (
        <Tooltip
          placement="bottom"
          id="challenge-rest-tooltip"
          title={organizations.map(x => x.displayName).join(', ')}
        >
          <Box display={'flex'}>
            <Typography variant="h3">{t('pages.challenge.organizationBanner.load-more')}</Typography>
          </Box>
        </Tooltip>
      )}
    </>
  );
};

interface ChallengePageProps extends PageProps {
  challenge: ChallengeType;
  permissions: {
    edit: boolean;
  };
}

const useChallengeStyles = createStyles(theme => ({
  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

interface Params {
  challengeId?: string;
  opportunityId?: string;
  ecoverseId?: string;
}

const Challenge: FC<ChallengePageProps> = ({ paths, challenge, permissions = { edit: false } }): React.ReactElement => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const history = useHistory();
  const styles = useChallengeStyles();
  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  const { ecoverseId = '' } = useParams<Params>();
  const { ecoverse, toEcoverseId } = useEcoverse();

  const opportunityRef = useRef<HTMLDivElement>(null);
  useUpdateNavigation({ currentPaths: paths });
  const { displayName: name, context, opportunities = [], leadOrganisations, id, community } = challenge;
  const communityId = community?.id;

  const { data: challengeLifecycleQuery, loading: loadingChallengeLifecycle } = useChallengeLifecycleQuery({
    variables: { ecoverseId, challengeId: id },
  });
  const { references, background = '', tagline, who = '', visual, impact = '', vision = '' } = context || {};
  const bannerImg = visual?.banner;
  const video = references?.find(x => x.name === 'video');

  const { data: memberShip, loading: loadingMembership } = useUserApplicationsQuery({
    variables: { input: { userID: user?.user?.id || '' } },
  });
  const applications = memberShip?.membershipUser?.applications || [];
  const userApplication = applications.find(x => x.communityID === communityId);

  const { data: _activity } = useChallengeActivityQuery({ variables: { ecoverseId, challengeId: id } });
  const activity = _activity?.ecoverse?.challenge?.activity || [];

  const projects = useMemo(
    () =>
      opportunities.flatMap(o =>
        o?.projects?.flatMap(p => ({
          caption: o.displayName,
          url: `${url}/opportunities/${o.nameID}/projects/${p.nameID}`,
          ...p,
        }))
      ),
    [opportunities]
  );

  const challengeProjects = useMemo(
    () => [
      ...(projects || []).map(p => ({
        title: p?.displayName || '',
        description: p?.description,
        caption: p?.caption,
        tag: { status: 'positive', text: p?.lifecycle?.state || '' },
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

  const activitySummary: ActivityItem[] = useMemo(() => {
    return [
      {
        name: t('pages.activity.opportunities'),
        digit: getActivityCount(activity, 'opportunities') || 0,
        color: 'primary',
      },
      {
        name: t('pages.activity.projects'),
        digit: getActivityCount(activity, 'projects') || 0,
        color: 'positive',
      },
      {
        name: t('pages.activity.members'),
        digit: getActivityCount(activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ];
  }, [activity]);

  const challengeRefs = (challenge?.context?.references || []).filter(r => r.uri).slice(0, 3);

  if (loadingMembership || loadingChallengeLifecycle) return <Loading />;

  return (
    <>
      <Section
        details={
          <ActivityCard
            title={t('pages.activity.title', { blockName: t('pages.challenge.title') })}
            items={activitySummary}
            lifecycle={challengeLifecycleQuery?.ecoverse.challenge.lifecycle}
            classes={{ padding: theme => `${theme.spacing(4)}px` }}
          />
        }
        classes={{
          background: theme =>
            bannerImg ? `url("${bannerImg}") no-repeat center center / cover` : theme.palette.neutral.main,
          coverBackground: theme => hexToRGBA(theme.palette.neutral.main, 0.4),
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <Body>
          <Box display={'flex'} alignItems={'center'} flexGrow={1}>
            <SectionHeader
              text={name}
              className="flex-grow-1"
              classes={{ color: theme => theme.palette.neutralLight.main }}
              editComponent={
                permissions.edit && (
                  <SettingsButton
                    to={buildAdminChallengeUrl(ecoverseId, challenge.nameID)}
                    tooltip={t('pages.challenge.sections.header.buttons.settigns.tooltip')}
                  />
                )
              }
            />
          </Box>

          <Grid container spacing={1}>
            <Grid item>
              <Button
                inset
                variant="semiTransparent"
                text={t('common.opportunities')}
                onClick={() => opportunityRef.current?.scrollIntoView({ behavior: 'smooth' })}
              />
            </Grid>
            {challengeRefs?.map((l, i) => (
              <Grid item key={i}>
                <Button as="a" inset variant="semiTransparent" text={l.name} href={l.uri} target="_blank" />
              </Grid>
            ))}
          </Grid>
        </Body>
      </Section>
      <Section
        avatar={<Icon component={JournalBookmarkIcon} color="primary" size="xl" />}
        details={<OrganisationBanners organizations={leadOrganisations} />}
      >
        <SectionHeader text="Challenge details" />
        <SubHeader text={tagline} />
        <Body>
          <Markdown children={vision} />
          <div className={styles.buttonsWrapper}>
            {video && <Button text={t('buttons.see-more')} as={'a'} href={video.uri} target="_blank" />}

            <ApplicationButton
              isMember={user?.ofChallenge(challenge?.id)}
              isNotParentMember={!user?.ofEcoverse(toEcoverseId(ecoverseId))}
              isAuthenticated={isAuthenticated}
              applyUrl={buildChallengeApplyUrl(ecoverseId, challenge.nameID)}
              parentApplyUrl={buildEcoverseApplyUrl(ecoverseId)}
              applicationState={userApplication?.state}
              ecoverseName={ecoverse?.ecoverse.displayName}
              challengeName={challenge.displayName}
            />
          </div>
        </Body>
      </Section>
      <Divider />
      <div ref={opportunityRef} />
      <Section avatar={<Icon component={GemIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.challenge.sections.opportunities.header')} />
        <SubHeader text={t('pages.challenge.sections.opportunities.subheader')}>
          <Markdown children={background} />
        </SubHeader>
        <Body>
          <Markdown children={impact} />
        </Body>
        {!opportunities ||
          (opportunities.length === 0 && <Body text={t('pages.challenge.sections.opportunities.body-missing')}></Body>)}
      </Section>
      <CardFilter data={opportunities}>
        {filteredData => (
          <CardContainer>
            {filteredData.map((opp, i) => (
              <OpportunityCard
                key={i}
                displayName={opp.displayName}
                activity={opp.activity || []}
                url={`${url}/opportunities/${opp.nameID}`}
                lifecycle={{ state: opp?.lifecycle?.state || '' }}
                context={{
                  tagline: opp?.context?.tagline || '',
                  visual: { background: opp?.context?.visual?.background || '' },
                }}
                tags={opp?.tagset?.tags || []}
              />
            ))}
          </CardContainer>
        )}
      </CardFilter>
      <Divider />
      <BackdropWithMessage
        message={t('components.backdrop.authentication', {
          blockName: t('pages.ecoverse.sections.community.header').toLocaleLowerCase(),
        })}
        show={!!user}
      >
        <ChallengeCommunitySection
          challengeId={challenge.id}
          ecoverseId={ecoverseId}
          title={t('pages.challenge.sections.community.header')}
          subTitle={t('pages.challenge.sections.community.subheader')}
          body={who}
          onExplore={() => history.push(SEARCH_PAGE)}
        />
      </BackdropWithMessage>
      <Divider />
      <BackdropWithMessage
        message={t('components.backdrop.authentication', { blockName: t('pages.ecoverse.sections.projects.header') })}
        show={!!user}
      >
        <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
          <SectionHeader
            text={t('pages.challenge.sections.projects.header.text')}
            tagText={t('pages.challenge.sections.projects.header.tag')}
          />
          <SubHeader text={t('pages.challenge.sections.projects.subheader')} />
          <Body text={t('pages.challenge.sections.projects.body')} />
        </Section>
        {isAuthenticated && (
          <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
            {challengeProjects.map(({ type, ...rest }, i) => {
              const Component = SwitchCardComponent({ type });
              return <Component {...rest} key={i} />;
            })}
          </CardContainer>
        )}
      </BackdropWithMessage>
      <Divider />
    </>
  );
};

export { Challenge };
