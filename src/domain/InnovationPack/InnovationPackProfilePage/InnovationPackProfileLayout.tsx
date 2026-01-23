import { PropsWithChildren, useMemo } from 'react';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Identifiable } from '@/core/utils/Identifiable';
import ProfilePageBanner, { ProfilePageBannerProps } from '@/domain/common/profile/ProfilePageBanner';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';
import { Visual } from '@/domain/common/visual/Visual';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useTranslation } from 'react-i18next';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import { Settings } from '@mui/icons-material';
import { usePageTitle } from '@/core/routing/usePageTitle';

interface InnovationPackProfileLayoutProps {
  innovationPack:
    | (Identifiable & {
        profile: ProfilePageBannerProps['profile'];
        provider: {
          profile: {
            displayName: string;
            avatar?: Visual;
          };
        };
      })
    | undefined;
  showSettings: boolean;
  settings?: boolean;
  loading?: boolean;
}

const InnovationPackProfileLayout = ({
  innovationPack,
  settings = false,
  showSettings,
  loading,
  ...props
}: PropsWithChildren<InnovationPackProfileLayoutProps>) => {
  const profile = useMemo(() => {
    return {
      ...innovationPack?.profile,
      tagline: innovationPack?.provider?.profile.displayName,
    } as ProfilePageBannerProps['profile'];
  }, [innovationPack]);

  const { t } = useTranslation();

  // Set browser tab title to "[Pack Name] | Template Library | Alkemio"
  const packTitle = innovationPack?.profile?.displayName
    ? `${innovationPack.profile.displayName} | ${t('pages.titles.templateLibrary')}`
    : undefined;
  usePageTitle(packTitle);

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/innovation-library" iconComponent={InnovationLibraryIcon}>
            {t('pages.innovationLibrary.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem uri={innovationPack?.profile?.url} iconComponent={InnovationLibraryIcon} loading={loading}>
            {innovationPack?.profile?.displayName}
          </BreadcrumbsItem>
          {settings && <BreadcrumbsItem iconComponent={Settings}>{t('common.settings')}</BreadcrumbsItem>}
        </TopLevelPageBreadcrumbs>
      }
      header={
        <ProfilePageBanner
          entityId={innovationPack?.id}
          profile={profile}
          loading={loading}
          settingsUri={
            showSettings && innovationPack?.profile?.url
              ? buildInnovationPackSettingsUrl(innovationPack.profile.url)
              : undefined
          }
        />
      }
      {...props}
    />
  );
};

export default InnovationPackProfileLayout;
