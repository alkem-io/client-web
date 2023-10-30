import { Box } from '@mui/material';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import React from 'react';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import { JourneyTypeName } from '../../JourneyTypeName';
import SizeableAvatar, { SizeableAvatarProps } from '../../../../core/ui/avatar/SizeableAvatar';

interface JourneyAvatarProps extends SizeableAvatarProps {
  journeyTypeName: JourneyTypeName;
  visualUri: string | undefined;
  hideJourneyIcon?: boolean;
}

const JourneyAvatar = ({ visualUri, journeyTypeName, hideJourneyIcon = false, size }: JourneyAvatarProps) => {
  const JourneyIcon = journeyIcon[journeyTypeName];

  return (
    <Box position="relative">
      <SizeableAvatar
        size={size}
        src={visualUri}
        sx={{
          '.MuiAvatar-img': hideJourneyIcon ? undefined : { filter: 'blur(1.5px)', opacity: '50%' },
          '.MuiAvatar-fallback': { display: 'none' },
          backgroundColor: theme => theme.palette.challenge.main,
        }}
      />
      {!hideJourneyIcon && (
        <SwapColors>
          <Box
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <JourneyIcon color="primary" />
          </Box>
        </SwapColors>
      )}
    </Box>
  );
};

export default JourneyAvatar;
