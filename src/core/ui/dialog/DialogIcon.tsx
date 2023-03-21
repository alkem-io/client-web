import { FC } from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';
import { gutters } from '../grid/utils';

interface DialogIconProps extends BoxProps {}

const DialogIcon: FC<DialogIconProps> = ({ ...props }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width={gutters(2)}
      height={gutters(2)}
      bgcolor={theme.palette.primary.main}
      color={theme.palette.primary.contrastText}
      borderRadius="5px"
      {...props}
    />
  );
};

export default DialogIcon;
