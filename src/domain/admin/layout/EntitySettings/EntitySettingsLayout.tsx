import React, { FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import { EntityLinkComponentProps } from '../../../../components/Admin/EntityLinkComponent';
import { SimplePageLayout } from '../../../shared/layout/PageLayout';
import HubTabs from '../../../hub/layout/HubTabs';
import ChallengeTabs from '../../../challenge/layout/ChallengeTabs';
import OpportunityTabs from '../../../opportunity/layout/OpportunityTabs';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import {
  buildChallengeUrl,
  buildHubUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
} from '../../../../utils/urlBuilders';
import { useUrlParams } from '../../../../hooks';
import HubPageBanner from '../../../hub/layout/HubPageBanner';
import ChallengePageBanner from '../../../challenge/layout/ChallengePageBanner';
import OpportunityPageBanner from '../../../opportunity/layout/OpportunityPageBanner';
import OrganizationPageBanner from '../../../organization/layout/OrganizationPageBanner';
import OrganizationTabs from '../../../organization/layout/OrganizationTabs';

type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization';

type EntitySettingsLayoutProps = EntityLinkComponentProps & {
  entityTypeName: EntityTypeName;
  tabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const EntitySettingsLayout: FC<EntitySettingsLayoutProps> = ({
  entityTypeName,
  tabs,
  currentTab,
  tabRoutePrefix = '../',
  children,
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);
  const { hubNameId = '', opportunityNameId = '', challengeNameId = '', organizationNameId = '' } = useUrlParams();

  return (
    <>
      {
        {
          hub: (
            <>
              <HubPageBanner />
              <HubTabs currentTab={EntityPageSection.Settings} rootUrl={buildHubUrl(hubNameId) + '/'} />
            </>
          ),
          challenge: (
            <>
              <ChallengePageBanner />
              <ChallengeTabs
                currentTab={EntityPageSection.Settings}
                rootUrl={buildChallengeUrl(hubNameId, challengeNameId) + '/'}
              />
            </>
          ),
          opportunity: (
            <>
              <OpportunityPageBanner />
              <OpportunityTabs
                currentTab={EntityPageSection.Settings}
                rootUrl={buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId) + '/'}
              />
            </>
          ),
          organization: (
            <>
              <OrganizationPageBanner />
              <OrganizationTabs
                currentTab={EntityPageSection.Settings}
                rootUrl={buildOrganizationUrl(organizationNameId) + '/'}
              />
            </>
          ),
        }[entityTypeName]
      }

      <PageTabs
        tabs={tabs}
        currentTab={currentTab}
        aria-label={`${entityTypeName} Settings tabs`}
        routePrefix={tabRoutePrefix}
        getTabLabel={getTabLabel}
      />
      <SimplePageLayout currentSection={currentTab} entityTypeName={entityTypeName} tabDescriptionNs="pages.admin">
        {children}
      </SimplePageLayout>
    </>
  );
};

export default EntitySettingsLayout;
