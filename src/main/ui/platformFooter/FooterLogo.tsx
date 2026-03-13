import { Box, type BoxProps } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import RouterLink from '@/core/ui/link/RouterLink';

const FooterLogo = (props: BoxProps) => {
  return (
    <Box component={RouterLink} to="/" {...props}>
      <ImageFadeIn src="/logo.png" alt="Alkemio" height={gutters()} display="block" />
    </Box>
  );
};

export default FooterLogo;
