import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/domain/platform/config/useConfig';
import { CredentialsView } from '@/domain/community/profile/views/ProfileView';
import UserProfileView, { UserProfileViewProps } from '@/domain/community/profile/views/ProfileView/UserProfileView';
import AssociatedOrganizationsLazilyFetched from '@/domain/community/contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import ContributionsView from '@/domain/community/contributor/Contributions/ContributionsView';
import { CaptionSmall } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import AccountResourcesView, {
  AccountResourcesProps,
} from '@/domain/community/contributor/Account/AccountResourcesView';
import useFilteredMemberships from '../hooks/useFilteredMemberships';
import { RoleType } from '../constants/RoleType';

export interface UserProfileViewPageProps extends UserProfileViewProps {
  contributions: SpaceHostedItem[] | undefined;
  organizationIds: string[] | undefined;
  accountResources: AccountResourcesProps | undefined;
}

export const UserProfilePageView = ({
  contributions = [],
  organizationIds,
  entities,
  accountResources,
}: UserProfileViewPageProps) => {
  const { t } = useTranslation();
  const { user } = entities.userMetadata;
  const { id } = user;

  const { isFeatureEnabled } = useConfig();

  const [filteredMemberships, remainingMemberships] = useFilteredMemberships(contributions, [
    RoleType.Lead,
    RoleType.Admin,
  ]);

  const hasAccountResources = accountResources && accountResources.spaces && accountResources.spaces.length > 0;

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
        {hasAccountResources && (
          <AccountResourcesView
            title={t('pages.user-profile.accountResources.sectionTitle')}
            accountResources={accountResources}
          />
        )}
        {filteredMemberships.length > 0 && (
          <ContributionsView
            title={t('pages.user-profile.communities.leadSpacesTitle')}
            contributions={filteredMemberships}
          />
        )}
        {remainingMemberships.length > 0 ? (
          <ContributionsView
            title={t('pages.user-profile.communities.allMembershipsTitle')}
            contributions={remainingMemberships}
          />
        ) : (
          <PageContentBlock>
            <PageContentBlockHeader title={t('pages.user-profile.communities.allMembershipsTitle')} />
            <CaptionSmall>{t('pages.user-profile.communities.noMembership')}</CaptionSmall>
          </PageContentBlock>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default UserProfilePageView;
