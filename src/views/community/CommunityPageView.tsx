import React, { FC } from 'react';
import { UserCard, UserCardProps } from '../../components/composite/common/cards';
import OrganizationCard, {
  OrganizationCardProps,
} from '../../components/composite/common/cards/Organization/OrganizationCard';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../components/core/Section/Section';
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import Grid from '@mui/material/Grid';
import CardFilter from '../../components/core/card-filter/CardFilter';
import { Message, Searchable, User } from '../../models/graphql-schema';
import {
  userCardTagsGetter,
  userCardValueGetter,
} from '../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { Box } from '@mui/material';
import { CommunityUpdatesView } from '../CommunityUpdates/CommunityUpdatesView';

const UPDATES_CONTAINER_HEIGHT = 300;

export type SearchableUserCardProps = UserCardProps & Searchable;

export interface CommunityPageViewProps {
  title?: string;
  loading: boolean;
  showOrganizations?: boolean;
  hostOrganization?: OrganizationCardProps;
  leadingOrganizations?: OrganizationCardProps[];
  organizationsLoading: boolean;
  members?: SearchableUserCardProps[];
  membersLoading: boolean;
  messages?: Message[];
  messagesLoading: boolean;
  authors?: User[];
}

const CommunityPageView: FC<CommunityPageViewProps> = ({
  loading,
  showOrganizations = true,
  hostOrganization,
  leadingOrganizations = [],
  organizationsLoading,
  members = [],
  membersLoading,
  messages = [],
  messagesLoading,
  authors = [],
}) => {
  const { t } = useTranslation();
  const organizationTitle = hostOrganization
    ? t('pages.community.hub-host.title')
    : t('pages.community.leading-organizations.title', { count: leadingOrganizations.length });
  const organizationHelpText = hostOrganization
    ? t('pages.community.hub-host.help-text')
    : t('pages.community.leading-organizations.help-text');
  const organizations = hostOrganization ? [hostOrganization] : leadingOrganizations;
  const membersTitle = t('pages.community.members.title', { count: members.length });
  const updatesTitle = t('pages.community.updates.title', { count: messages.length });
  return (
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.community.description')}
      </Box>
      <Typography variant={'subtitle2'}>
        {loading ? <Skeleton width="50%" /> : t('pages.community.subtitle')}
      </Typography>

      <SectionSpacer />
      <DashboardGenericSection>
        <Box component={Typography} variant="h3" paddingBottom={0.5}>
          {messagesLoading ? <Skeleton width="20%" /> : updatesTitle}
        </Box>
        {!messages.length && !messagesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography>{t('pages.community.updates.no-data')}</Typography>
          </Box>
        ) : (
          <Box sx={{ height: `${UPDATES_CONTAINER_HEIGHT}px`, overflowY: 'auto' }}>
            <CommunityUpdatesView
              entities={{ messages, members: authors }}
              state={{
                loadingMessages: messagesLoading,
                submittingMessage: false,
                removingMessage: false,
              }}
              options={{
                hideHeaders: true,
                disableCollapse: true,
                disableElevation: true,
                itemsPerRow: 1,
              }}
            />
          </Box>
        )}
      </DashboardGenericSection>
      <SectionSpacer />
      {showOrganizations && (
        <>
          <Accordion
            title={organizationTitle}
            loading={organizationsLoading}
            helpText={organizationHelpText}
            ariaKey={'organization'}
          >
            {organizationsLoading ? (
              <Grid container spacing={3}>
                <LoadingOrganizationCard />
                <LoadingOrganizationCard />
                <LoadingOrganizationCard />
              </Grid>
            ) : (
              <>
                {!organizations.length && (
                  <Box component={Typography} display="flex" justifyContent="center">
                    {t('pages.community.leading-organizations.no-data')}
                  </Box>
                )}
                {!!organizations.length && (
                  <Grid container spacing={3}>
                    {organizations.map((x, i) => (
                      <Grid
                        key={i}
                        item
                        flexGrow={1}
                        flexBasis="100%"
                        maxWidth={{ xs: 'auto', sm: 'auto', md: 'auto', lg: '50%', xl: '50%' }}
                      >
                        <OrganizationCard
                          url={x.url}
                          members={x.members}
                          avatar={x.avatar}
                          name={x.name}
                          role={x.role}
                          information={x.information}
                          verified={x.verified}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Accordion>
          <SectionSpacer />
        </>
      )}
      <DashboardGenericSection headerText={membersTitle} helpText={t('pages.community.members.help-text')}>
        <>
          {membersLoading ? (
            <Grid container spacing={3}>
              <LoadingUserCard />
              <LoadingUserCard />
              <LoadingUserCard />
            </Grid>
          ) : (
            <>
              {!members.length ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} display="flex" justifyContent="center">
                    <Typography>{t('pages.community.members.no-data')}</Typography>
                  </Grid>
                </Grid>
              ) : (
                <CardFilter data={members} valueGetter={userCardValueGetter} tagsValueGetter={userCardTagsGetter}>
                  {filteredData => (
                    <Grid container spacing={3}>
                      {filteredData.map((x, i) => (
                        <Grid
                          key={i}
                          item
                          flexGrow={1}
                          flexBasis="25%"
                          maxWidth={{ xs: 'auto', sm: 'auto', md: '50%', lg: '33%', xl: '25%' }}
                        >
                          <UserCard
                            displayName={x.displayName}
                            tags={x.tags}
                            avatarSrc={x.avatarSrc}
                            roleName={x.roleName}
                            country={x.country}
                            city={x.city}
                            url={x.url}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardFilter>
              )}
            </>
          )}
        </>
      </DashboardGenericSection>
    </>
  );
};
export default CommunityPageView;

const LoadingUserCard = () => (
  <Grid item xs={3}>
    <UserCard loading />
  </Grid>
);

const LoadingOrganizationCard = () => (
  <Grid item xs={4}>
    <OrganizationCard loading />
  </Grid>
);
