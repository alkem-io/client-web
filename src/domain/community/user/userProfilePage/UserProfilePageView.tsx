import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useScreenSize } from '@/core/ui/grid/constants';
import { CaptionSmall } from '@/core/ui/typography';
import AccountResourcesView, {
  type AccountResourcesProps,
} from '@/domain/community/contributor/Account/AccountResourcesView';
import TilesContributionsView from '@/domain/community/contributor/Contributions/TilesContributionsView';
import AssociatedOrganizationsLazilyFetched from '@/domain/community/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import UserProfileView, { type UserProfileViewProps } from '@/domain/community/profile/views/UserProfileView';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import { RoleType } from '../constants/RoleType';
import useFilteredMemberships from '../hooks/useFilteredMemberships';

export interface UserProfileViewPageProps extends UserProfileViewProps {
  contributions: SpaceHostedItem[] | undefined;
  organizationIds: string[] | undefined;
  accountResources: AccountResourcesProps | undefined;
}

export const UserProfilePageView = ({
  contributions = [],
  organizationIds,
  userModel,
  accountResources,
}: UserProfileViewPageProps) => {
  const { t } = useTranslation();

  const { isMediumSmallScreen } = useScreenSize();

  const [filteredMemberships, remainingMemberships] = useFilteredMemberships(contributions, [
    RoleType.Lead,
    RoleType.Admin,
  ]);

  const hasAccountResources = accountResources?.spaces && accountResources.spaces.length > 0;

  return (
    <PageContent>
      <PageContentColumn columns={isMediumSmallScreen ? 12 : 3}>
        <UserProfileView userModel={userModel} />
        <AssociatedOrganizationsLazilyFetched
          organizationIds={organizationIds ?? []}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
        />
      </PageContentColumn>
      <PageContentColumn columns={9}>
        {hasAccountResources && (
          <AccountResourcesView
            title={t('pages.user-profile.accountResources.sectionTitle')}
            accountResources={accountResources}
          />
        )}
        {filteredMemberships.length > 0 && (
          <TilesContributionsView
            title={t('pages.user-profile.communities.leadSpacesTitle')}
            contributions={filteredMemberships}
          />
        )}
        {remainingMemberships.length > 0 ? (
          <TilesContributionsView
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
