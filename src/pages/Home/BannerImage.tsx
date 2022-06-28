import { Box, styled } from '@mui/material';

const BannerImageElement = styled(Box)(({ theme }) => ({
  background: theme.palette.neutralMedium.light,
}));

const BannerImage = () => {
  // https://mui.com/system/display/
  // https://mui.com/material-ui/customization/breakpoints/#custom-breakpoints
  const sizes = {
    xs: { display: { xs: 'block', sm: 'none' }, marginTop: 8, height: '156px' },
    sm: { display: { xs: 'none', sm: 'block', md: 'none' }, height: '200px' },
    md: { display: { xs: 'none', md: 'block', lg: 'none' }, marginTop: 2, height: '200px' },
    lg: { display: { xs: 'none', lg: 'block', xl: 'none' }, height: '200px' },
    xl: { display: { xs: 'none', xl: 'block' }, height: '200px' },
  };

  return (
    <>
      {Object.keys(sizes).map(size => (
        <Box sx={sizes[size]}>
          <BannerImageElement
            style={{
              backgroundImage: `url('./alkemio-banner/alkemio-banner-${size}.png')`,
              height: sizes[size].height,
            }}
          />
        </Box>
      ))}
    </>
  );
};

export default BannerImage;
