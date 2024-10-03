import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrganizationContainerEntities,
  OrganizationContainerState,
} from '../OrganizationPageContainer/OrganizationPageContainer';
import { OrganizationVerificationEnum } from '../../../../../core/apollo/generated/graphql-schema';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
import {
  AssociatesView,
  OrganizationProfileView,
  OrganizationProfileViewEntity,
} from '../../../profile/views/ProfileView';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import getMetricCount from '../../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../../platform/metrics/MetricType';
import ContributionsView from '../../Contributions/ContributionsView';
import { RoleType } from '../../../user/constants/RoleType';
import { CaptionSmall } from '../../../../../core/ui/typography';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';

interface OrganizationPageViewProps {
  entities: OrganizationContainerEntities;
  state: OrganizationContainerState;
}

export const OrganizationPageView: FC<OrganizationPageViewProps> = ({ entities }) => {
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

  const associatesCount = getMetricCount(organization?.metrics, MetricType.Associate);

  const contributionsOrgLead = contributions.filter(contribution => contribution.roles?.includes(RoleType.Lead)) || [];

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <OrganizationProfileView entity={entity} permissions={permissions} />
        <AssociatesView associates={associates} totalCount={associatesCount} canReadUsers={permissions.canReadUsers} />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        {contributionsOrgLead.length > 0 && (
          <ContributionsView
            title={t('components.contributions.leadSpacesTitle')}
            contributions={contributionsOrgLead}
          />
        )}
        {contributions.length > 0 ? (
          <ContributionsView title={t('components.contributions.allMembershipsTitle')} contributions={contributions} />
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
