import React, { FC } from 'react';
import { Button } from '@mui/material';

interface LifecycleButtonProps {
  stateName: string;
  onClick: () => void;
}

const LifecycleButton: FC<LifecycleButtonProps> = ({ stateName, onClick }) => {
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      {stateName}
    </Button>
  );
};

export default LifecycleButton;
