import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { PageTitle } from '@/core/ui/typography';
import { AdminSection, adminTabs } from '@/domain/platformAdmin/layout/toplevel/constants';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import AdminBreadcrumbs from '@/main/admin/AdminBreadcrumbs';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import SpaceConversionSection from './spaceConversion/SpaceConversionSection';
import TransferCalloutSection from './transferCallout/TransferCalloutSection';
import TransferInnovationHubSection from './transferInnovationHub/TransferInnovationHubSection';
import TransferInnovationPackSection from './transferInnovationPack/TransferInnovationPackSection';
import TransferSpaceSection from './transferSpace/TransferSpaceSection';
import TransferVirtualContributorSection from './transferVirtualContributor/TransferVirtualContributorSection';
import VcConversionSection from './vcConversion/VcConversionSection';

const T_PREFIX = 'pages.admin.conversionsAndTransfers';

const currentTab = AdminSection.Transfer;

const TransferPage = () => {
  const { t } = useTranslation();

  return (
    <TopLevelLayout
      header={
        <>
          <SpacePageBanner title={t('common.administration')} isAdmin={true} />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Space}>
            {adminTabs.map(tab => (
              <HeaderNavigationTab
                key={tab.route}
                label={t(`common.${tab.section}` as const)}
                value={tab.section}
                to={tab.route}
              />
            ))}
          </HeaderNavigationTabs>
        </>
      }
      breadcrumbs={<AdminBreadcrumbs />}
    >
      <PageContent>
        <PageContentColumn columns={12}>
          <Box
            sx={{
              border: 2,
              borderColor: 'error.main',
              borderRadius: 1,
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
            }}
          >
            <PageTitle sx={{ color: 'error.main', textAlign: 'center' }}>{t(`${T_PREFIX}.pageTitle`)}</PageTitle>

            {/* Conversions Area */}
            <PageContentBlock accent={true}>
              <PageTitle>{t(`${T_PREFIX}.conversionsArea`)}</PageTitle>
            </PageContentBlock>
            <SpaceConversionSection />
            <VcConversionSection />

            {/* Transfers Area */}
            <PageContentBlock accent={true} sx={{ marginTop: 3 }}>
              <PageTitle>{t(`${T_PREFIX}.transfersArea`)}</PageTitle>
            </PageContentBlock>
            <TransferSpaceSection />
            <TransferInnovationHubSection />
            <TransferInnovationPackSection />
            <TransferVirtualContributorSection />
            <TransferCalloutSection />
          </Box>
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default TransferPage;
