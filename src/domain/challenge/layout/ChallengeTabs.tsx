import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useChallenge } from '../../../hooks';
import { buildAdminChallengeUrl } from '../../../utils/urlBuilders';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import { routes } from '../../challenge/routes/challengeRoutes';
import EntityPageTabs from '../../shared/layout/EntityPageTabs';

export interface ChallengeTabsProps extends EntityTabsProps {}

const ChallengeTabs: FC<ChallengeTabsProps> = props => {
  const { t } = useTranslation();

  const { hubNameId, challengeNameId, permissions } = useChallenge();

  return (
    <EntityPageTabs
      {...props}
      showSettings={permissions.canUpdate}
      settingsUrl={buildAdminChallengeUrl(hubNameId, challengeNameId)}
      entityTypeName="challenge"
      subEntityTab={
        <HeaderNavigationTab
          label={t('common.opportunities')}
          value={EntityPageSection.Opportunities}
          to={routes.Opportunities}
        />
      }
    />
  );
};

export default ChallengeTabs;
