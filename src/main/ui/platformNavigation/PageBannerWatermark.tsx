import { Box } from '@mui/material';
import PoweredBy from '../poweredBy/PoweredBy';
import { alpha } from '@mui/material/styles';

const PageBannerWatermark = () => {
  return (
    <Box
      position="absolute"
      right={0}
      bottom={0}
      sx={{
        borderTopLeftRadius: theme => `${theme.shape.borderRadius}px`,
        backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
      }}
    >
      <PoweredBy />
    </Box>
  );
};

export default PageBannerWatermark;
