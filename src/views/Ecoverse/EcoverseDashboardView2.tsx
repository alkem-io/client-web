import React, { FC, useMemo } from 'react';
import { Grid } from '@mui/material';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import Markdown from '../../components/core/Markdown';
import { useTranslation } from 'react-i18next';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';
import ActivityView from '../Activity/ActivityView';
import { Discussion } from '../../models/discussion/discussion';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';
import Link from '@mui/material/Link';
import { RouterLink } from '../../components/core/RouterLink';
import { Challenge, User } from '../../models/graphql-schema';
import ContributionCard from '../../components/composite/common/cards/ContributionCard/ContributionCard';
import getActivityCount from '../../utils/get-activity-count';
import { buildChallengeUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { AssociateCard } from '../../components/composite/common/cards';
import SingleUpdateView from '../Updates/SingleUpdateView';
import { CommunityUpdatesContainer } from '../../containers/community-updates/CommunityUpdates';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';

export interface EcoverseDashboardView2Props {
  title?: string;
  bannerUrl?: string;
  tagline?: string;
  vision?: string;
  ecoverseId?: string;
  ecoverseNameId?: string;
  communityId?: string;
  organizationNameId?: string;
  activity: ActivityItem[];
  discussions: Discussion[];
  organization?: any;
  challenges: Challenge[];
  members?: User[];
  community?: any;
  loading: boolean;
  isMember?: boolean;
}

const DISCUSSIONS_NUMBER_IN_SECTION = 3;
const CHALLENGES_NUMBER_IN_SECTION = 2;
const MEMBERS_NUMBER_IN_SECTION = 12;
const SPACING = 2;

const EcoverseDashboardView2: FC<EcoverseDashboardView2Props> = ({
  bannerUrl,
  title,
  tagline = '',
  vision = '',
  challenges,
  members = [],
  ecoverseId = '',
  ecoverseNameId = '',
  communityId = '',
  organizationNameId,
  activity,
  discussions,
  loading,
  isMember = false,
}) => {
  const { t } = useTranslation();
  const orgNameIds = useMemo(() => (organizationNameId ? [organizationNameId] : []), [organizationNameId]);
  const discussionsInCard = discussions
    .slice(0, DISCUSSIONS_NUMBER_IN_SECTION)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <>
      <Grid container spacing={SPACING}>
        <Grid container item xs={12} md={6} spacing={SPACING}>
          <Grid item xs={12}>
            <DashboardGenericSection
              bannerUrl={bannerUrl}
              headerText={title}
              primaryAction={
                <ApplicationButtonContainer
                  entities={{
                    ecoverseId,
                    ecoverseNameId,
                    ecoverseName: title || '',
                  }}
                >
                  {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
                </ApplicationButtonContainer>
              }
              navText={t('buttons.see-more')}
              navLink={'context'}
            >
              <Markdown children={tagline} />
              <Markdown children={vision} />
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection headerText={t('pages.ecoverse.sections.dashboard.activity')}>
              <ActivityView activity={activity} loading={loading} />
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection headerText={t('pages.ecoverse.sections.dashboard.updates.title')}>
              <CommunityUpdatesContainer entities={{ ecoverseId: ecoverseNameId, communityId }}>
                {entities => {
                  if (!entities.messages.length) {
                    return t('pages.ecoverse.sections.dashboard.updates.no-data');
                  }

                  const messages = [...entities.messages];
                  const [latestMessage] = messages.sort((a, b) => b.timestamp - a.timestamp);
                  const messageSender = {
                    id: latestMessage.sender,
                  };

                  return (
                    <AvatarsProvider users={[messageSender]}>
                      {populatedUsers => (
                        <SingleUpdateView
                          author={{
                            id: populatedUsers[0].id,
                            displayName: populatedUsers[0].displayName,
                            avatarUrl: populatedUsers[0].profile?.avatar ?? '',
                            firstName: '',
                            lastName: '',
                            url: buildUserProfileUrl(populatedUsers[0].nameID),
                          }}
                          createdDate={new Date(latestMessage.timestamp)}
                          content={latestMessage.message}
                        />
                      )}
                    </AvatarsProvider>
                  );
                }}
              </CommunityUpdatesContainer>
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection
              headerText={t('pages.ecoverse.sections.dashboard.discussions.title')}
              navText={t('buttons.see-all')}
              navLink={'community/discussions'}
            >
              {discussionsInCard.map((item, index) => (
                <DiscussionOverview key={index} discussion={item} />
              ))}
              {!discussionsInCard.length && (
                <Link component={RouterLink} to={isMember ? 'community/discussions/new' : 'apply'}>
                  {t(
                    `pages.ecoverse.sections.dashboard.discussions.${
                      isMember ? 'no-data-create' : 'no-data-join'
                    }` as const
                  )}
                </Link>
              )}
            </DashboardGenericSection>
          </Grid>
        </Grid>
        <Grid container item md={6} xs={12} spacing={SPACING}>
          <Grid item xs={12}>
            <AssociatedOrganizationsView
              title={t('pages.ecoverse.sections.dashboard.organization')}
              organizationNameIDs={orgNameIds}
            />
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection
              headerText={t('pages.ecoverse.sections.dashboard.challenges.title')}
              helpText={t('pages.ecoverse.sections.dashboard.challenges.help-text')}
              navText={t('buttons.see-all')}
              navLink={'challenges'}
            >
              <Grid container item spacing={SPACING}>
                {challenges.slice(0, CHALLENGES_NUMBER_IN_SECTION).map((x, i) => {
                  const _activity = x.activity ?? [];
                  const activities: ActivityItem[] = [
                    {
                      name: t('pages.activity.opportunities'),
                      digit: getActivityCount(_activity, 'opportunities') || 0,
                      color: 'primary',
                    },
                    {
                      name: t('pages.activity.members'),
                      digit: getActivityCount(_activity, 'members') || 0,
                      color: 'positive',
                    },
                  ];
                  return (
                    <Grid key={i} item>
                      <ContributionCard
                        loading={loading}
                        details={{
                          name: x.displayName,
                          activity: activities,
                          tags: x.tagset?.tags ?? [],
                          image: x.context?.visual?.background ?? '',
                          url: buildChallengeUrl(ecoverseNameId, x.nameID),
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection
              headerText={t('pages.ecoverse.sections.dashboard.community')}
              navText={t('buttons.see-all')}
              navLink={'community'}
            >
              <AvatarsProvider users={members} count={MEMBERS_NUMBER_IN_SECTION}>
                {populated => (
                  <Grid container spacing={SPACING}>
                    {populated.map((x, i) => (
                      <Grid key={i} item xs={3}>
                        <AssociateCard
                          avatarSrc={x.profile?.avatar || ''}
                          displayName={x.displayName}
                          tags={[]}
                          url={x.nameID}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AvatarsProvider>
            </DashboardGenericSection>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default EcoverseDashboardView2;
