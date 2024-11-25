import { EntityTabsProps } from '@/domain/journey/common/EntityPageLayout';
import SpacePageTabs from '../SpacePageTabs';
import { useSpace } from '../SpaceContext/useSpace';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useTranslation } from 'react-i18next';
import { SubspaceIcon } from '@/domain/journey/subspace/icon/SubspaceIcon';

const SpaceTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { profile, permissions } = useSpace();
  const settingsUrl = buildSettingsUrl(profile.url);

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
        section: EntityPageSection.Subspaces,
        icon: <SubspaceIcon />,
        disabled: !permissions.canReadSubspaces,
      }}
    />
  );
};

export default SpaceTabs;
