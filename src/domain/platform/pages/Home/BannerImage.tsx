import { Box } from '@mui/material';

const BannerImage = () => {
  return (
    <Box
      component="img"
      src="/alkemio-banner/alkemio-banner.svg"
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
