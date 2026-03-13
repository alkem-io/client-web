import { Box, type BoxProps, CircularProgress, useTheme } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters, { type GuttersProps } from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import PageBannerCardWrapper, {
  type PageBannerCardWrapperProps,
} from '@/core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { Caption, PageTitle } from '@/core/ui/typography';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';

export interface PageBannerCardWithVisualProps extends PageBannerCardWrapperProps {
  header?: ReactNode;
  subtitle?: ReactNode;
  tags: string[] | undefined;
  visual?: ReactElement<{ sx: { flexShrink: number } }>;
  loading?: boolean;
}

const RowContainer = (props: GuttersProps & BoxProps) => {
  return (
    <Gutters
      row={true}
      disablePadding={true}
      minHeight={gutters(2)}
      justifyContent="space-between"
      alignItems="center"
      {...props}
    />
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
  const { isSmallScreen } = useScreenSize();

  return (
    <PageBannerCardWrapper disablePadding={true} paddingRight={gutters(0.5)} {...props}>
      <BadgeCardView
        visual={<Gutters paddingRight={0}>{loading ? <CircularProgress size={gutters(4)(theme)} /> : visual}</Gutters>}
      >
        <Box display="flex" flexDirection="column" paddingY={gutters(0.5)}>
          <RowContainer {...(isSmallScreen ? { flexWrap: 'wrap', gap: 0 } : {})}>
            {header ?? (
              <PageTitle color="primary" noWrap={true}>
                {title}
              </PageTitle>
            )}
          </RowContainer>

          <Caption component="h3" color="primary" fontStyle="italic" noWrap={true}>
            {subtitle}
          </Caption>

          <RowContainer>
            {tags.length > 0 && <TagsComponent tags={tags} color="primary" minHeight={gutters()} variant="filled" />}
          </RowContainer>
        </Box>
      </BadgeCardView>
    </PageBannerCardWrapper>
  );
};

export default PageBannerCardWithVisual;
