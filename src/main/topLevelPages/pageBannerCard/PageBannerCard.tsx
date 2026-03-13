import type { SvgIconProps } from '@mui/material';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import PageBannerCardWrapper, {
  type PageBannerCardWrapperProps,
} from '@/core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { PageTitle, Text } from '@/core/ui/typography';

export interface PageBannerCardProps extends PageBannerCardWrapperProps {
  subtitle?: ReactNode;
  iconComponent?: ComponentType<SvgIconProps>;
}

const PageBannerCard = ({ title, subtitle, iconComponent: Icon, ...props }: PropsWithChildren<PageBannerCardProps>) => {
  return (
    <PageBannerCardWrapper {...props}>
      <Gutters disablePadding={true} gap={gutters(0.5)}>
        <BadgeCardView visual={Icon && <Icon color="primary" fontSize="large" />} minHeight={gutters(2)}>
          <PageTitle color="primary">{title}</PageTitle>
        </BadgeCardView>

        <Text color="primary">{subtitle}</Text>
      </Gutters>
    </PageBannerCardWrapper>
  );
};

export default PageBannerCard;
