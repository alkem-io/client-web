import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, PageTitle } from '../../../../../core/ui/typography';
import React, { ReactElement, ReactNode } from 'react';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import { Box } from '@mui/material';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import PageBannerCardWrapper, {
  PageBannerCardWrapperProps,
} from '../../../../../core/ui/layout/pageBannerCard/PageBannerCardWrapper';

export interface PageBannerCardWithVisualProps extends PageBannerCardWrapperProps {
  // journeyTypeName: ChildJourneyTypeName;
  title?: ReactNode;
  subtitle?: ReactNode;
  // avatar: Visual | undefined;
  tags: string[] | undefined;
  visual?: ReactElement<{ sx: { flexShrink: number } }>;
}

const PageBannerCardWithVisual = ({ title, subtitle, tags = [], visual, ...props }: PageBannerCardWithVisualProps) => {
  return (
    <PageBannerCardWrapper {...props}>
      <BadgeCardView visual={visual}>
        <Box display="flex" flexDirection="column" gap={gutters(0.5)}>
          <PageTitle color="primary" noWrap>
            {title}
          </PageTitle>
          <Caption color="primary" fontStyle="italic" noWrap>
            {subtitle}
          </Caption>
          <TagsComponent tags={tags} color="primary" minHeight={gutters()} variant="filled" />
        </Box>
      </BadgeCardView>
    </PageBannerCardWrapper>
  );
};

export default PageBannerCardWithVisual;
