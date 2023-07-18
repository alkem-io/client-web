import { Avatar, Box } from '@mui/material';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import React from 'react';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import { JourneyTypeName } from '../../JourneyTypeName';

interface JourneyAvatarProps {
  journeyTypeName: JourneyTypeName;
  visualUri: string | undefined;
}

const JourneyAvatar = ({ visualUri, journeyTypeName }: JourneyAvatarProps) => {
  const JourneyIcon = journeyIcon[journeyTypeName];

  return (
    <Box position="relative">
      <Avatar
        src={visualUri}
        sx={{
          '.MuiAvatar-img': { filter: 'blur(1.5px)', opacity: '50%' },
          '.MuiAvatar-fallback': { display: 'none' },
          borderRadius: 0.5,
          backgroundColor: theme => theme.palette.challenge.main,
          width: theme => theme.spacing(8),
          height: theme => theme.spacing(8),
        }}
      />
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
    </Box>
  );
};

export default JourneyAvatar;
