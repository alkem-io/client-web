import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../../../platform/config/useConfig';
import { CredentialsView } from '../../profile/views/ProfileView';
import UserProfileView, { UserProfileViewProps } from '../../profile/views/ProfileView/UserProfileView';
import AssociatedOrganizationsLazilyFetched from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { PlatformFeatureFlagName } from '../../../../core/apollo/generated/graphql-schema';
import ContributionsView from '../../contributor/Contributions/ContributionsView';
import { CaptionSmall } from '../../../../core/ui/typography';

export interface UserProfileViewPageProps extends UserProfileViewProps {
  contributions: SpaceHostedItem[] | undefined;
  organizationIds: string[] | undefined;
}

export const UserProfilePageView: FC<UserProfileViewPageProps> = ({ contributions, organizationIds, entities }) => {
  const { t } = useTranslation();
  const { user } = entities.userMetadata;
  const { id } = user;

  const { isFeatureEnabled } = useConfig();

  const subspaceILead = useMemo(
    () =>
      contributions?.filter(
        contribution => contribution.roles?.includes('admin') || contribution.roles?.includes('lead')
      ),
    [contributions]
  );

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <UserProfileView entities={entities} />
        <AssociatedOrganizationsLazilyFetched
          organizationIds={organizationIds ?? []}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
        />
        {isFeatureEnabled(PlatformFeatureFlagName.Ssi) && (
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
        {subspaceILead && subspaceILead.length > 0 && (
          <ContributionsView
            title={t('pages.user-profile.communities.leadSpacesTitle')}
            contributions={subspaceILead}
          />
        )}
        <ContributionsView
          title={t('pages.user-profile.communities.allMembershipsTitle')}
          contributions={contributions}
        />
        {contributions && contributions.length === 0 && (
          <CaptionSmall>{t('pages.user-profile.communities.noMembership')}</CaptionSmall>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default UserProfilePageView;
