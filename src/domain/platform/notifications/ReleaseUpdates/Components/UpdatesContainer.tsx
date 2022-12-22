import React, { FC } from 'react';
import { Box, Paper } from '@mui/material';
import SwapColors from '../../../../../core/ui/palette/SwapColors';
import { gutters } from '../../../../../core/ui/grid/utils';
import { MAX_CONTENT_WIDTH_WITH_GUTTER } from '../../../../../core/ui/grid/constants';

const UpdatesContainer: FC = ({ children }) => {
  return (
    <SwapColors>
      <Paper square>
        <Box
          maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER}
          marginX="auto"
          paddingX={gutters()}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          height={gutters(2)}
          gap={gutters()}
        >
          {children}
        </Box>
      </Paper>
    </SwapColors>
  );
};

export default UpdatesContainer;
