import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useChallenge } from '../../../hooks';
import { buildAdminChallengeUrl, buildChallengeUrl } from '../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import EntityPageTabs from '../../shared/layout/EntityPageTabs';

export interface ChallengeTabsProps extends EntityTabsProps {}

const ChallengeTabs: FC<ChallengeTabsProps> = props => {
  const { t } = useTranslation();

  const { hubNameId, challengeNameId, permissions } = useChallenge();
  const rootUrl = buildChallengeUrl(hubNameId, challengeNameId);
  const settingsUrl = buildAdminChallengeUrl(hubNameId, challengeNameId);

  return (
    <EntityPageTabs
      {...props}
      entityTypeName="challenge"
      showSettings={permissions.canUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      subEntityTab={
        <HeaderNavigationTab
          label={t('common.opportunities')}
          value={EntityPageSection.Opportunities}
          to={`${rootUrl}/${EntityPageSection.Opportunities}`}
        />
      }
    />
  );
};

export default ChallengeTabs;
