import { Box } from '@mui/material';
import { CARD_IMAGE_ASPECT_RATIO_DEFAULT } from '@/core/ui/card/CardImage';

const SpaceCardBannerPlaceholder = () => {
  return <Box sx={{ aspectRatio: CARD_IMAGE_ASPECT_RATIO_DEFAULT, backgroundColor: 'background.default' }} />;
};

export default SpaceCardBannerPlaceholder;
