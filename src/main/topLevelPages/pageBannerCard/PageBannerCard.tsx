import { gutters } from '../../../core/ui/grid/utils';
import { PageTitle, Text } from '../../../core/ui/typography';
import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { Box, SvgIconProps } from '@mui/material';
import PageBannerCardWrapper, {
  PageBannerCardWrapperProps,
} from '../../../core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';

export interface PageBannerCardProps extends PageBannerCardWrapperProps {
  title: ReactNode;
  subtitle?: ReactNode;
  iconComponent: ComponentType<SvgIconProps>;
}

const PageBannerCard = ({ title, subtitle, iconComponent: Icon, ...props }: PropsWithChildren<PageBannerCardProps>) => {
  return (
    <PageBannerCardWrapper {...props}>
      <Box display="flex" flexDirection="column" gap={gutters(0.5)}>
        <BadgeCardView visual={<Icon color="primary" fontSize="large" />}>
          <PageTitle color="primary" noWrap>
            {title}
          </PageTitle>
        </BadgeCardView>
        <Text color="primary" noWrap>
          {subtitle}
        </Text>
      </Box>
    </PageBannerCardWrapper>
  );
};

export default PageBannerCard;
