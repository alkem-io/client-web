import { gutters } from '../../../core/ui/grid/utils';
import { PageTitle, Text } from '../../../core/ui/typography';
import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { SvgIconProps } from '@mui/material';
import PageBannerCardWrapper, {
  PageBannerCardWrapperProps,
} from '../../../core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import Gutters from '../../../core/ui/grid/Gutters';

export interface PageBannerCardProps extends PageBannerCardWrapperProps {
  subtitle?: ReactNode;
  iconComponent?: ComponentType<SvgIconProps>;
}

const PageBannerCard = ({ title, subtitle, iconComponent: Icon, ...props }: PropsWithChildren<PageBannerCardProps>) => {
  return (
    <PageBannerCardWrapper {...props}>
      <Gutters disablePadding gap={gutters(0.5)}>
        <BadgeCardView visual={Icon && <Icon color="primary" fontSize="large" />} minHeight={gutters(2)}>
          <PageTitle color="primary" noWrap>
            {title}
          </PageTitle>
        </BadgeCardView>
        <Text color="primary" noWrap>
          {subtitle}
        </Text>
      </Gutters>
    </PageBannerCardWrapper>
  );
};

export default PageBannerCard;
