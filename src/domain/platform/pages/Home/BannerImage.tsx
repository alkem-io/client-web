import { Box, useMediaQuery } from '@mui/material';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';

const biggestImageWidth = 2048;

const BannerImage = () => {
  const size = useCurrentBreakpoint();

  const hasImageForWidth = useMediaQuery(`@media only screen and (max-height: ${biggestImageWidth}px)`);

  const bannerImageUrl = hasImageForWidth ? `/alkemio-banner/alkemio-banner-${size}.png` : '/alkemio-banner/alkemio-banner.svg';

  return (
    <Box
      component="img"
      src={bannerImageUrl}
      sx={{
        objectFit: 'cover',
        height: theme => ({
          xs: theme.spacing(15),
          sm: theme.spacing(20),
        }),
        background: theme => theme.palette.neutralMedium.light,
      }}
    />
  );
};

export default BannerImage;
