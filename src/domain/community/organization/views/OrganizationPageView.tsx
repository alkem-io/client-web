import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import {
  AssociatesView,
  OrganizationProfileView,
  OrganizationProfileViewEntity,
} from 'domain/community/profile/views/ProfileView';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import ContributionsView from '@/domain/community/contributor/Contributions/ContributionsView';
import { CaptionSmall } from '@/core/ui/typography';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import AccountResourcesView, {
  AccountResourcesProps,
} from '@/domain/community/contributor/Account/AccountResourcesView';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import Loading from '@/core/ui/loading/Loading';
import {
  OrganizationContainerEntities,
  OrganizationContainerState,
} from '../../contributor/organization/OrganizationPageContainer/OrganizationPageContainer';

type OrganizationPageViewProps = {
  entities: OrganizationContainerEntities;
  accountResources: AccountResourcesProps | undefined;
  state: OrganizationContainerState;
};

export const OrganizationPageView = ({ entities, accountResources, state: { loading } }: OrganizationPageViewProps) => {
  const { t } = useTranslation();

  const { permissions, socialLinks, links, organization, capabilities, keywords, associates, contributions } = entities;

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
        settingsUrl: buildSettingsUrl(organization?.nameID || ''),
        bio: organization?.profile.description,
        verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
        tagsets,
        socialLinks,
        links,
        location: organization?.profile.location,
      } as OrganizationProfileViewEntity),
    [organization, tagsets, socialLinks, links, t]
  );

  const [filteredMemberships, remainingMemberships] = useFilteredMemberships(contributions, [RoleType.Lead]);

  const associatesCount = getMetricCount(organization?.metrics, MetricType.Associate);

  const hasAccountResources =
    accountResources &&
    (accountResources.spaces?.length > 0 ||
      accountResources.innovationPacks?.length > 0 ||
      accountResources.innovationHubs?.length > 0);

  if (loading) {
    return <Loading />;
  }

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <OrganizationProfileView entity={entity} permissions={permissions} />
        <AssociatesView associates={associates} totalCount={associatesCount} canReadUsers={permissions.canReadUsers} />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        {hasAccountResources && (
          <AccountResourcesView
            title={t('pages.organization.profile.accountResources.sectionTitle')}
            accountResources={accountResources}
          />
        )}
        {filteredMemberships.length > 0 && (
          <ContributionsView
            title={t('components.contributions.leadSpacesTitle')}
            contributions={filteredMemberships}
          />
        )}
        {remainingMemberships.length > 0 ? (
          <ContributionsView
            title={t('components.contributions.allMembershipsTitle')}
            contributions={remainingMemberships}
          />
        ) : (
          <PageContentBlock>
            <PageContentBlockHeader title={t('components.contributions.allMembershipsTitle')} />
            <CaptionSmall>{t('pages.user-profile.communities.noMembership')}</CaptionSmall>
          </PageContentBlock>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default OrganizationPageView;
