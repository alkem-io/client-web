import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import {
  AssociatesView,
  OrganizationProfileView,
  OrganizationProfileViewEntity,
} from '@/domain/community/profile/views';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import TilesContributionsView from '@/domain/community/contributor/Contributions/TilesContributionsView';
import { CaptionSmall } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import AccountResourcesView, {
  AccountResourcesProps,
} from '@/domain/community/contributor/Account/AccountResourcesView';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import Loading from '@/core/ui/loading/Loading';
import { UseOrganizationProvided } from '../useOrganization/useOrganization';
import { useScreenSize } from '@/core/ui/grid/constants';
import { isVerifiedOrganization } from '../model/OrganizationModelLightweight';

type OrganizationPageViewProps = {
  organizationProvided: UseOrganizationProvided;
  accountResources: AccountResourcesProps | undefined;
  loading: boolean;
};

export const OrganizationPageView = ({
  organizationProvided,
  accountResources,
  loading,
}: OrganizationPageViewProps) => {
  const { t } = useTranslation();

  const { isMediumSmallScreen } = useScreenSize();

  const { permissions, references, organization, capabilities, keywords, associates, contributions } =
    organizationProvided;

  const isVerified = isVerifiedOrganization(organization?.verification);

  const tagsets = useMemo(
    () => [
      { name: t('components.profile.fields.keywords.title'), tags: keywords },
      { name: t('components.profile.fields.capabilities.title'), tags: capabilities },
    ],
    [keywords, capabilities, t]
  );

  const entity = useMemo(
    () =>
      ({
        avatar: organization?.profile.avatar?.uri,
        displayName: organization?.profile.displayName || '',
        settingsTooltip: t('pages.organization.settings.tooltip'),
        settingsUrl: buildSettingsUrl(organization?.profile.url ?? ''),
        bio: organization?.profile.description,
        verified: isVerified,
        tagsets,
        references,
        location: organization?.profile.location,
      }) as OrganizationProfileViewEntity,
    [organization, tagsets, references, t, isVerified]
  );

  const [filteredMemberships, remainingMemberships] = useFilteredMemberships(contributions, [RoleType.Lead]);

  const associatesCount = getMetricCount(organization?.metrics, MetricType.Associate);

  const hasAccountResources =
    isVerified &&
    accountResources &&
    (accountResources.spaces?.length > 0 ||
      accountResources.innovationPacks?.length > 0 ||
      accountResources.innovationHubs?.length > 0);

  if (loading) {
    return <Loading />;
  }

  return (
    <PageContent>
      <PageContentColumn columns={isMediumSmallScreen ? 12 : 3}>
        <OrganizationProfileView entity={entity} permissions={permissions} />
        <AssociatesView associates={associates} totalCount={associatesCount} canReadUsers={permissions.canReadUsers} />
      </PageContentColumn>
      <PageContentColumn columns={9}>
        {hasAccountResources && (
          <AccountResourcesView
            title={t('pages.organization.profile.accountResources.sectionTitle')}
            accountResources={accountResources}
          />
        )}
        {isVerified && filteredMemberships.length > 0 && (
          <TilesContributionsView
            title={t('components.contributions.leadSpacesTitle')}
            contributions={filteredMemberships}
          />
        )}
        {isVerified && (
          remainingMemberships.length > 0 ? (
            <TilesContributionsView
              title={t('components.contributions.allMembershipsTitle')}
              contributions={remainingMemberships}
            />
          ) : (
            <PageContentBlock>
              <PageContentBlockHeader title={t('components.contributions.allMembershipsTitle')} />
              <CaptionSmall>{t('pages.user-profile.communities.noMembership')}</CaptionSmall>
            </PageContentBlock>
          )
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default OrganizationPageView;
