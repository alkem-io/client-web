import React from 'react';
import { Fade, IconButton } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import SwapColors from '@/core/ui/palette/SwapColors';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useElevationContext } from '@/core/ui/utils/ElevationContext';

interface PlatformNavigationUncollapseProps {
  visible?: boolean;
}

const PlatformNavigationUncollapse = ({
  ref,
  visible,
}: PlatformNavigationUncollapseProps & {
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  const elevation = useElevationContext();

  return (
    <Fade in={visible}>
      <IconButton
        ref={ref}
        sx={{
          position: 'absolute',
          right: theme => `calc(100% + ${gutters()(theme)})`,
          top: 0,
        }}
      >
        <SwapColors>
          <ArrowBackIosNew
            color="primary"
            sx={{ filter: elevation ? 'drop-shadow(0px 1px 8px rgba(0,0,0,0.12))' : 'none' }}
          />
        </SwapColors>
      </IconButton>
    </Fade>
  );
};

export default PlatformNavigationUncollapse;
