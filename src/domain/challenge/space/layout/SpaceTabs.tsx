import React, { useEffect, useMemo } from 'react';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import SpacePageTabs, { ActionDefinition } from '../SpacePageTabs';
import { useSpace } from '../SpaceContext/useSpace';
import { buildAdminSpaceUrl, buildSpaceUrl } from '../../../../common/utils/urlBuilders';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useTranslation } from 'react-i18next';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { Search } from '@mui/icons-material';
import { useSearchContext } from '../../../platform/search/SearchContext';

const SpaceTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { spaceNameId, permissions } = useSpace();
  const rootUrl = buildSpaceUrl(spaceNameId);
  const settingsUrl = buildAdminSpaceUrl(spaceNameId);

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
    <SpacePageTabs
      {...props}
      entityTypeName="space"
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

export default SpaceTabs;
