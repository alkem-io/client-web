import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import { SectionSpacer } from '../../components/core/Section/Section';
import OrganizationCard, {
  OrganizationCardProps,
} from '../../components/composite/common/cards/Organization/OrganizationCard';
import { UserCard, UserCardProps } from '../../components/composite/common/cards';
import { Grid } from '@mui/material';
import { ApolloError } from '@apollo/client';

export interface ContributorsViewProps {
  users?: UserCardProps[]; // only for registered users
  showUsers: boolean;
  organizations?: OrganizationCardProps[];
  loading: boolean;
  error?: ApolloError;
}

const ContributorsView: FC<ContributorsViewProps> = ({ users = [], showUsers, organizations = [], loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <SectionSpacer double />
      <Accordion
        title={t('pages.contributors.organizations.title', { count: organizations.length })}
        subtitle={t('pages.contributors.organizations.subtitle')}
        helpText={t('pages.contributors.organizations.help-text')}
        ariaKey={'organization'}
      >
        <Grid container spacing={3}>
          {loading && (
            <>
              <OrganizationLoadingCard />
              <OrganizationLoadingCard />
              <OrganizationLoadingCard />
            </>
          )}
          {organizations.map(org => (
            <Grid key={org.url} item md={6} xs={12}>
              <OrganizationCard {...org} />
            </Grid>
          ))}
        </Grid>
      </Accordion>
      {showUsers && (
        <>
          <SectionSpacer double />
          <Accordion
            title={t('pages.contributors.users.title', { count: users.length })}
            subtitle={t('pages.contributors.users.subtitle')}
            helpText={t('pages.contributors.users.help-text')}
            ariaKey={'organization'}
          >
            <Grid container spacing={6}>
              {loading && (
                <>
                  <UserLoadingCard />
                  <UserLoadingCard />
                  <UserLoadingCard />
                </>
              )}
              {!loading &&
                users.map((x, i) => (
                  <Grid key={i} item xl={3} lg={4} sm={6} xs={12}>
                    <UserCard
                      key={i}
                      roleName={x.roleName}
                      avatarSrc={x.avatarSrc}
                      displayName={x.displayName}
                      city={x.city}
                      country={x.country}
                      tags={x.tags}
                      url={x.url}
                    />
                  </Grid>
                ))}
            </Grid>
          </Accordion>
        </>
      )}
    </>
  );
};
export default ContributorsView;

const OrganizationLoadingCard = () => {
  return (
    <Grid item xs={6}>
      <OrganizationCard loading={true} />
    </Grid>
  );
};

const UserLoadingCard = () => {
  return (
    <Grid item xl={3} lg={4} sm={6} xs={12}>
      <UserCard loading={true} />
    </Grid>
  );
};
