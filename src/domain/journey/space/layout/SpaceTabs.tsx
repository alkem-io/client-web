import React from 'react';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import SpacePageTabs from '../SpacePageTabs';
import { useSpace } from '../SpaceContext/useSpace';
import { buildJourneyAdminUrl, buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useTranslation } from 'react-i18next';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';

const SpaceTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { spaceNameId, profile, permissions } = useSpace();
  const rootUrl = buildSpaceUrl(spaceNameId);
  const settingsUrl = buildJourneyAdminUrl(profile.url);

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
    />
  );
};

export default SpaceTabs;
