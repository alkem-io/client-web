import React, { FC } from 'react';
import WrapperButton, { ButtonProps } from './WrapperButton';

interface LifecycleButtonProps extends ButtonProps {
  stateName: string;
}

const LifecycleButton: FC<LifecycleButtonProps> = ({ stateName, onClick }) => {
  return <WrapperButton variant="default" onClick={onClick} text={stateName} />;
};
export default LifecycleButton;
