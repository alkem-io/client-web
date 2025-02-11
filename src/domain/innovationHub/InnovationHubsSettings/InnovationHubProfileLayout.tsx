import { PropsWithChildren } from 'react';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Identifiable } from '@/core/utils/Identifiable';
import { Visual } from '@/domain/common/visual/Visual';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useTranslation } from 'react-i18next';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import { Settings, VisibilityOutlined } from '@mui/icons-material';
import PageBanner from '@/core/ui/layout/pageBanner/PageBanner';
import PageBannerCardWithVisual from '@/domain/journey/common/PageBanner/JourneyPageBannerCard/PageBannerCardWithVisual';
import { PageTitle } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import { buildInnovationHubUrl } from '@/main/routing/urlBuilders';
import { IconButton } from '@mui/material';
import { Actions } from '@/core/ui/actions/Actions';
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
              <PageTitle color="primary" noWrap>
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
