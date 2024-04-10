import React from 'react';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import SpacePageTabs from '../SpacePageTabs';
import { useSpace } from '../SpaceContext/useSpace';
import { buildJourneyAdminUrl } from '../../../../main/routing/urlBuilders';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useTranslation } from 'react-i18next';
import { ChallengeIcon } from '../../subspace/icon/ChallengeIcon';

const SpaceTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { profile, permissions } = useSpace();
  const settingsUrl = buildJourneyAdminUrl(profile.url);

  return (
    <SpacePageTabs
      {...props}
      entityTypeName="space"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={settingsUrl}
      rootUrl={profile.url}
      shareUrl={profile.url}
      subEntityTab={{
        label: t('common.subspaces'),
        section: EntityPageSection.Challenges,
        icon: <ChallengeIcon />,
        disabled: !permissions.canReadChallenges,
      }}
    />
  );
};

export default SpaceTabs;
