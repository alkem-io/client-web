import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import RouterLink from '@/core/ui/link/RouterLink';
import SubspacePageBanner from '@/domain/space/components/SubspacePageBanner/SubspacePageBanner';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import EntitySettingsLayout from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { spaceAdminTabsL1 } from './SpaceAdminTabsL1';
import { spaceAdminTabsL2 } from './SpaceAdminTabsL2';
import { useSpace } from '../../space/context/useSpace';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';

interface SubspaceSettingsLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const SubspaceSettingsLayout: FC<SubspaceSettingsLayoutProps> = props => {
  const { space } = useSpace();
  const subspaceContext = useSubSpace();
  const { subspace, parentSpaceId } = subspaceContext;
  const { id: spaceId, level: spaceLevel, about } = subspace;
  const levelZeroSpaceId = space.id;

  const { t } = useTranslation();

  // TODO: this should ideally come from the SpaceContext
  const journeyPath: JourneyPath =
    spaceLevel === SpaceLevel.L1 ? [levelZeroSpaceId, spaceId] : [spaceId, parentSpaceId!, spaceId];

  const tabs = spaceLevel === SpaceLevel.L1 ? spaceAdminTabsL1 : spaceAdminTabsL2;

  const spaceBannerElement = <SubspacePageBanner />;

  const spaceBackButtonElement = (
    <RouterLink to={about.profile.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
      <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
        {t('navigation.admin.settingsMenu.quit')}
      </BackButton>
    </RouterLink>
  );

  const spaceBreadcrumbsElement = <SpaceBreadcrumbs journeyPath={journeyPath} settings />;

  return (
    <EntitySettingsLayout
      entityTypeName="subspace"
      subheaderTabs={tabs}
      pageBanner={spaceBannerElement}
      breadcrumbs={spaceBreadcrumbsElement}
      backButton={spaceBackButtonElement}
      {...subspaceContext}
      {...props}
    />
  );
};

export default SubspaceSettingsLayout;
