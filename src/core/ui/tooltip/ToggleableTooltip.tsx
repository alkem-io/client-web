import { Tooltip, TooltipProps } from '@mui/material';
import { useState } from 'react';

interface ToggleableTooltipProps extends TooltipProps {
  disabled?: boolean;
}

const ToggleableTooltip = ({ disabled, ...tooltipProps }: ToggleableTooltipProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Tooltip
      open={isOpen && !disabled}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      {...tooltipProps}
    />
  );
};

export default ToggleableTooltip;
