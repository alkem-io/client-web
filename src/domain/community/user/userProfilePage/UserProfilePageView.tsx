import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../../../platform/config/useConfig';
import { FEATURE_SSI } from '../../../platform/config/features.constants';
import { ContributionsView, CredentialsView } from '../../profile/views/ProfileView';
import UserProfileView, { UserProfileViewProps } from '../../profile/views/ProfileView/UserProfileView';
import AssociatedOrganizationsLazilyFetched from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { ContributionItem } from '../contribution';

export interface UserProfileViewPageProps extends UserProfileViewProps {
  contributions: ContributionItem[] | undefined;
  organizationIds: string[] | undefined;
}

export const UserProfilePageView: FC<UserProfileViewPageProps> = ({ contributions, organizationIds, entities }) => {
  const { t } = useTranslation();
  const { user } = entities.userMetadata;
  const { id } = user;

  const { isFeatureEnabled } = useConfig();

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <UserProfileView entities={entities} />
        <AssociatedOrganizationsLazilyFetched
          organizationIds={organizationIds ?? []}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
        />
        {isFeatureEnabled(FEATURE_SSI) && (
          <Grid item>
            <CredentialsView
              userID={id}
              title={t('pages.user-profile.verifiable-credentials.title')}
              helpText={t('pages.user-profile.verifiable-credentials.help')}
            />
          </Grid>
        )}
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <ContributionsView
          title={t('pages.user-profile.communities.title')}
          helpText={t('pages.user-profile.communities.help')}
          contributions={contributions}
          cards
        />
      </PageContentColumn>
    </PageContent>
  );
};

export default UserProfilePageView;
