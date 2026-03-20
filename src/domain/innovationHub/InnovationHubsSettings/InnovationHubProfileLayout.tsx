import { Settings, VisibilityOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import PageBanner from '@/core/ui/layout/pageBanner/PageBanner';
import RouterLink from '@/core/ui/link/RouterLink';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { PageTitle } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { Visual } from '@/domain/common/visual/Visual';
import PageBannerCardWithVisual from '@/domain/space/components/cards/components/PageBannerCardWithVisual';
import { buildInnovationHubUrl } from '@/main/routing/urlBuilders';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { defaultPageBanner } from '@/main/ui/layout/topLevelPageLayout/TopLevelPageBanner';

interface InnovationHubProfileLayoutProps {
  innovationHub:
    | (Identifiable & {
        profile: {
          displayName: string;
          tagline?: string;
          visual?: Visual;
          url: string;
          tagset?: { tags: string[] };
        };
        subdomain: string;
      })
    | undefined;
  loading?: boolean;
}

const InnovationHubProfileLayout = ({
  innovationHub,
  loading,
  ...props
}: PropsWithChildren<InnovationHubProfileLayoutProps>) => {
  const { t } = useTranslation();
  const profile = innovationHub?.profile;

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri={innovationHub?.profile?.url} iconComponent={InnovationLibraryIcon} loading={loading}>
            {innovationHub?.profile?.displayName}
          </BreadcrumbsItem>
          <BreadcrumbsItem iconComponent={Settings}>{t('common.settings')}</BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      header={
        <PageBanner
          banner={innovationHub?.profile?.visual?.uri ? innovationHub.profile.visual : defaultPageBanner}
          cardComponent={PageBannerCardWithVisual}
          header={
            <>
              <PageTitle color="primary" noWrap={true}>
                {t('common.innovation-hub')}: {profile?.displayName}
              </PageTitle>
              <Actions gap={0}>
                {innovationHub?.subdomain && (
                  <IconButton
                    size="small"
                    component={RouterLink}
                    to={buildInnovationHubUrl(innovationHub?.subdomain)}
                    aria-label={t('buttons.view')}
                  >
                    <VisibilityOutlined />
                  </IconButton>
                )}
              </Actions>
            </>
          }
          subtitle={profile?.tagline}
          tags={profile?.tagset?.tags}
          loading={loading}
        />
      }
      {...props}
    />
  );
};

export default InnovationHubProfileLayout;
