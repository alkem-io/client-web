import { Visual } from '@/domain/common/visual/Visual';
import { Box, Paper } from '@mui/material';
import ImageBlurredSides from '@/core/ui/image/ImageBlurredSides';
import { gutters } from '@/core/ui/grid/utils';
import { PageTitle, Tagline } from '@/core/ui/typography';

type InnovationHubBannerProps = {
  banner: Visual | undefined;
  displayName: string;
  tagline: string;
};

const InnovationHubBanner = ({ banner, displayName, tagline }: InnovationHubBannerProps) => (
  <Box>
    <ImageBlurredSides src={banner?.uri} alt={banner?.alternativeText} blurRadius={2} height={gutters(9)} />
    <Paper square sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingY: gutters(0.5) }}>
      <PageTitle>{displayName}</PageTitle>
      <Tagline lineHeight={gutters(2)}>{tagline}</Tagline>
    </Paper>
  </Box>
);

export default InnovationHubBanner;
