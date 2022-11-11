import React from 'react';
import { EntityTabsProps } from '../../../shared/layout/PageLayout';
import EntityPageTabs from '../../../shared/layout/EntityPageTabs';
import { useHub } from '../HubContext/useHub';
import { buildAdminHubUrl, buildHubUrl } from '../../../../common/utils/urlBuilders';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useTranslation } from 'react-i18next';
import { ChallengeIcon } from '../../../../common/icons/ChallengeIcon';

const HubTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { hubNameId, permissions } = useHub();
  const rootUrl = buildHubUrl(hubNameId);
  const settingsUrl = buildAdminHubUrl(hubNameId);

  return (
    <EntityPageTabs
      {...props}
      entityTypeName="hub"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      shareUrl={rootUrl}
      subEntityTab={{
        label: t('common.challenges'),
        section: EntityPageSection.Challenges,
        icon: <ChallengeIcon />,
        disabled: !permissions.canReadChallenges,
      }}
    />
  );
};

export default HubTabs;
