import React from 'react';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';
import PageBannerCard, { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';
import { ThemeProvider } from '@mui/material';
import providePrimaryColor from '../../../../core/ui/themes/utils/providePrimaryColor';
import { Visual } from '../../../../domain/common/visual/Visual';

const provideHubColor = providePrimaryColor(theme => theme.palette.primary.main);

const banner: Visual = {
  uri: '/alkemio-banner/global-banner.jpg',
};

interface TopLevelPageBannerProps extends PageBannerCardProps {}

const TopLevelPageBanner = (props: TopLevelPageBannerProps) => {
  return (
    <ThemeProvider theme={provideHubColor}>
      <PageBanner banner={banner} cardComponent={PageBannerCard} {...props} />
    </ThemeProvider>
  );
};

export default TopLevelPageBanner;
