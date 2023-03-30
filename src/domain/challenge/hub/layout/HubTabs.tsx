import React, { useEffect, useMemo } from 'react';
import { EntityTabsProps } from '../../common/JourneyPageLayout';
import EntityPageTabs, { ActionDefinition } from '../../../shared/layout/EntityPageTabs';
import { useHub } from '../HubContext/useHub';
import { buildAdminHubUrl, buildHubUrl } from '../../../../common/utils/urlBuilders';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useTranslation } from 'react-i18next';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { Search } from '@mui/icons-material';
import { useSearchContext } from '../../../platform/search/SearchContext';

const HubTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { hubNameId, permissions } = useHub();
  const rootUrl = buildHubUrl(hubNameId);
  const settingsUrl = buildAdminHubUrl(hubNameId);

  const { openSearch, closeSearch } = useSearchContext();

  const actions = useMemo<ActionDefinition[]>(
    () => [
      {
        label: t('common.search'),
        icon: <Search />,
        section: EntityPageSection.Search,
        onClick: openSearch,
      },
    ],
    [t, openSearch]
  );

  useEffect(() => {
    closeSearch();
  }, [props.currentTab]);

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
      actions={actions}
    />
  );
};

export default HubTabs;
