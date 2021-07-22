import React, { FC } from 'react';
import Button, { ButtonProps } from './Button';

interface LifecycleButtonProps extends ButtonProps {
  stateName: string;
}

const LifecycleButton: FC<LifecycleButtonProps> = ({ stateName, onClick }) => {
  return (
    <Button variant="default" onClick={onClick}>
      {stateName}
    </Button>
  );
};
export default LifecycleButton;
