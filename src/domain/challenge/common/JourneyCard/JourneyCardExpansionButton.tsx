import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { ButtonTypeMap } from '@mui/material/Button/Button';

const JourneyCardExpansionButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ButtonProps<D, P>) => {
  return <Button sx={{ whiteSpace: 'nowrap', paddingX: 0, '.MuiButton-startIcon': { marginRight: 0.5 } }} {...props} />;
};

export default JourneyCardExpansionButton;
