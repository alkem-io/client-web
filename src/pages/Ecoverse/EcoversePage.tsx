import Grid from '@material-ui/core/Grid';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { SettingsButton } from '../../components/composite';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ActivityCard from '../../components/composite/common/ActivityPanel/ActivityCard';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import AuthenticationBackdrop from '../../components/composite/common/Backdrops/AuthenticationBackdrop';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import Button from '../../components/core/Button';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import Divider from '../../components/core/Divider';
import ErrorBlock from '../../components/core/ErrorBlock';
import Icon from '../../components/core/Icon';
import { Image } from '../../components/core/Image';
import Loading from '../../components/core/Loading/Loading';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SwitchCardComponent } from '../../components/Ecoverse/Cards';
import ChallengeCard from '../../components/Ecoverse/ChallengeCard';
import EcoverseCommunitySection from '../../components/Ecoverse/EcoverseCommunitySection';
import { createStyles, useAuthenticationContext, useEcoverse, useUpdateNavigation, useUserContext } from '../../hooks';
import {
  useChallengeCardsQuery,
  useEcoverseActivityQuery,
  useEcoverseVisualQuery,
  useProjectsChainHistoryQuery,
  useProjectsQuery,
  useUserApplicationsQuery,
} from '../../hooks/generated/graphql';
import { Challenge, Context } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildAdminEcoverseUrl } from '../../utils/urlBuilders';
import { PageProps } from '../common';

const useStyles = createStyles(theme => ({
  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  ecoverseBannerImg: {
    maxWidth: 320,
    height: 'initial',
    margin: '0 auto',
  },
}));

interface EcoversePageProps extends PageProps {}

const EcoversePage: FC<EcoversePageProps> = ({ paths }): React.ReactElement => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const history = useHistory();
  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  const { ecoverseId, ecoverseNameId, ecoverse } = useEcoverse();

  const { displayName: name, context, community } = ecoverse || {};
  const communityId = community?.id;

  const { data: memberShip } = useUserApplicationsQuery({ variables: { input: { userID: user?.user?.id || '' } } });
  const applications = memberShip?.membershipUser?.applications || [];
  const userApplication = applications.find(x => x.communityID === communityId);

  const { data: _projectsNestHistory } = useProjectsChainHistoryQuery({ variables: { ecoverseId: ecoverseNameId } });

  const permissions = {
    edit: user?.isEcoverseAdmin(ecoverseId),
  };

  const {
    data: _challenges,
    error: challengesError,
    loading: isChallengeLoading,
  } = useChallengeCardsQuery({
    variables: { ecoverseId: ecoverseNameId },
  });
  const challenges = (_challenges?.ecoverse?.challenges || []) as Challenge[];

  const { data: _projects } = useProjectsQuery({ variables: { ecoverseId: ecoverseNameId } });
  const projects = _projects?.ecoverse?.projects || [];
  const projectsNestHistory = _projectsNestHistory?.ecoverse?.challenges || [];

  const { data: _visual } = useEcoverseVisualQuery({ variables: { ecoverseId: ecoverseNameId } });
  const visual = _visual?.ecoverse?.context?.visual;

  const { data: _activity } = useEcoverseActivityQuery({ variables: { ecoverseId: ecoverseNameId } });
  const activity = _activity?.ecoverse?.activity || [];

  useUpdateNavigation({ currentPaths: paths });

  const { tagline = '', impact = '', vision = '', background = '', references = [] } = context || ({} as Context);
  const ecoverseBanner = visual?.banner;
  // need to create utils for these bits...

  /**
   * getting out all projects and adding url dependency based on project's parents names
   */
  const projectsWithParentData = useMemo(
    () =>
      projectsNestHistory
        ?.flatMap(c =>
          c?.opportunities?.map(x => ({
            challenge: c.displayName,
            url: `${paths[paths.length - 1].value}/challenges/${c.nameID}/opportunities/${x.nameID}`,
            ...x,
          }))
        )
        .flatMap(o =>
          o?.projects?.flatMap(p => ({ caption: o?.challenge, url: `${o?.url}/projects/${p.nameID}`, ...p }))
        ),
    [_projectsNestHistory]
  );

  /**
   * creating suitable for project card data + 1 mock card at the end
   */
  const ecoverseProjects = useMemo(
    () => [
      ...projects.map(p => {
        const parentsData = projectsWithParentData?.find(ph => ph?.nameID === p.nameID);

        return {
          title: p?.displayName || '',
          description: p?.description,
          caption: parentsData?.caption,
          tag: { status: 'positive', text: p?.lifecycle?.state || '' },
          type: 'display',
          onSelect: () => history.replace(parentsData?.url || ''),
        };
      }),
      {
        title: 'MORE PROJECTS STARTING SOON',
        type: 'more',
      },
    ],
    [projects]
  );

  const more = references?.find(x => x.name === 'website');

  const activitySummary: ActivityItem[] = useMemo(
    () => [
      {
        name: t('pages.activity.challenges'),
        digit: getActivityCount(activity, 'challenges') || 0,
        color: 'neutral',
      },
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
    ],
    [activity]
  );

  return (
    <>
      <Section
        avatar={
          ecoverseBanner ? (
            <Image src={ecoverseBanner} alt={`${name} logo`} className={styles.ecoverseBannerImg} />
          ) : (
            <div />
          )
        }
        details={
          <ActivityCard
            title={t('pages.activity.title', { blockName: t('pages.ecoverse.title') })}
            items={activitySummary}
          />
        }
      >
        <SectionHeader
          text={name}
          editComponent={
            permissions.edit && (
              <SettingsButton
                color={'primary'}
                to={buildAdminEcoverseUrl(ecoverseNameId)}
                tooltip={t('pages.ecoverse.sections.header.buttons.settings.tooltip')}
              />
            )
          }
        />

        <SubHeader text={tagline} />
        <Body>
          <Markdown children={vision} />
          <div className={styles.buttonsWrapper}>
            {more && <Button text={t('buttons.learn-more')} as={'a'} href={`${more.uri}`} target="_blank" />}
            <ApplicationButton
              isAuthenticated={isAuthenticated}
              isMember={user?.ofEcoverse(ecoverseId)}
              applyUrl={`${url}/apply`}
              applicationState={userApplication?.state}
            />
          </div>
        </Body>
      </Section>
      <Divider />
      <MembershipBackdrop
        show={!user?.ofEcoverse(ecoverseId) || false}
        blockName={t('pages.ecoverse.sections.challenges.header')}
      >
        <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
          <SectionHeader text={t('pages.ecoverse.sections.challenges.header')} />
          <SubHeader>
            <Markdown children={background} />
          </SubHeader>
          <Body>
            <Markdown children={impact} />
          </Body>
        </Section>
        {isChallengeLoading && (
          <Loading
            text={t('components.loading.message', { blockName: t('pages.ecoverse.sections.challenges.header') })}
          />
        )}
        {challengesError ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ErrorBlock blockName={t('pages.ecoverse.sections.challenges.header')} />
            </Grid>
          </Grid>
        ) : (
          <CardFilter data={challenges} tagsValueGetter={entityTagsValueGetter} valueGetter={entityValueGetter}>
            {filteredData => (
              <CardContainer>
                {filteredData.map((challenge, i) => (
                  <ChallengeCard
                    key={i}
                    id={challenge.id}
                    displayName={challenge.displayName}
                    activity={challenge?.activity || []}
                    context={{
                      tagline: challenge?.context?.tagline || '',
                      visual: { background: challenge?.context?.visual?.background || '' },
                    }}
                    isMember={user?.ofChallenge(challenge.id) || false}
                    tags={challenge?.tagset?.tags || []}
                    url={`${url}/challenges/${challenge.nameID}`}
                  />
                ))}
              </CardContainer>
            )}
          </CardFilter>
        )}
      </MembershipBackdrop>

      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.community.header')} show={!isAuthenticated}>
        <EcoverseCommunitySection
          title={t('pages.ecoverse.sections.community.header')}
          subTitle={t('pages.ecoverse.sections.community.subheader')}
          body={context?.who}
          shuffle={true}
        />
      </AuthenticationBackdrop>
      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.projects.header')} show={!isAuthenticated}>
        {ecoverseProjects.length > 0 && (
          <>
            <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
              <SectionHeader text={t('pages.ecoverse.sections.projects.header')} tagText={'Work in progress'} />
              <SubHeader text={t('pages.ecoverse.sections.projects.subheader', { ecoverse: name })} />
            </Section>
            {isAuthenticated && (
              <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
                {ecoverseProjects.map(({ type, ...rest }, i) => {
                  const Component = SwitchCardComponent({ type });
                  return <Component {...rest} key={i} />;
                })}
              </CardContainer>
            )}
            <Divider />
          </>
        )}
      </AuthenticationBackdrop>
    </>
  );
};

export { EcoversePage as Ecoverse };
