import { Box } from '@mui/material';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';

// TODO either use image for the current breakpoint or remove all except xxl
const BannerImage = () => {
  const size = useCurrentBreakpoint();

  return (
    <Box
      component="img"
      src={`/alkemio-banner/alkemio-banner-${size}.png`}
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
