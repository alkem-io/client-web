import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, PageTitle } from '../../../../../core/ui/typography';
import React, { ReactElement, ReactNode } from 'react';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import { Box, BoxProps, CircularProgress, Theme, useMediaQuery, useTheme } from '@mui/material';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import PageBannerCardWrapper, {
  PageBannerCardWrapperProps,
} from '../../../../../core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import Gutters, { GuttersProps } from '../../../../../core/ui/grid/Gutters';

export interface PageBannerCardWithVisualProps extends PageBannerCardWrapperProps {
  header?: ReactNode;
  subtitle?: ReactNode;
  tags: string[] | undefined;
  visual?: ReactElement<{ sx: { flexShrink: number } }>;
  loading?: boolean;
}

const RowContainer = (props: GuttersProps & BoxProps) => {
  return (
    <Gutters row disablePadding minHeight={gutters(2)} justifyContent="space-between" alignItems="center" {...props} />
  );
};

const PageBannerCardWithVisual = ({
  title,
  subtitle,
  tags = [],
  visual,
  header,
  loading,
  ...props
}: PageBannerCardWithVisualProps) => {
  const theme = useTheme();
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.only('xs'));

  return (
    <PageBannerCardWrapper disablePadding paddingRight={gutters(0.5)} {...props}>
      <BadgeCardView
        visual={<Gutters paddingRight={0}>{loading ? <CircularProgress size={gutters(4)(theme)} /> : visual}</Gutters>}
      >
        <Box display="flex" flexDirection="column" paddingY={gutters(0.5)}>
          <RowContainer {...(isSmall ? { flexWrap: 'wrap', gap: 0 } : {})}>
            {header ?? (
              <PageTitle color="primary" noWrap>
                {title}
              </PageTitle>
            )}
          </RowContainer>
          <Caption component="h3" color="primary" fontStyle="italic" noWrap>
            {subtitle}
          </Caption>
          <RowContainer>
            <TagsComponent tags={tags} color="primary" minHeight={gutters()} variant="filled" />
          </RowContainer>
        </Box>
      </BadgeCardView>
    </PageBannerCardWrapper>
  );
};

export default PageBannerCardWithVisual;
