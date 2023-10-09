import React, { MouseEventHandler, ReactElement, useState } from 'react';
import { ClickAwayListener, Tooltip, TooltipProps } from '@mui/material';

export interface TriggerProps {
  onClick?: MouseEventHandler;
}

interface ClickableTooltipProps extends Omit<TooltipProps, 'children'> {
  children: ({ onClick }: TriggerProps) => ReactElement;
  title: ReactElement;
}

enum OpenTriggerAction {
  Click = 'Click',
  Hover = 'Hover',
}

const ClickableTooltip = ({ title, children, ...tooltipProps }: ClickableTooltipProps) => {
  const [openBy, setOpenBy] = useState<OpenTriggerAction | null>(null);

  const handleClickAway = () => setOpenBy(null);

  const handleTriggerClick = () => setOpenBy(OpenTriggerAction.Click);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Tooltip
        title={title}
        open={!!openBy}
        onOpen={() => setOpenBy(OpenTriggerAction.Hover)}
        onClose={() => setOpenBy(prevOpenBy => (prevOpenBy === OpenTriggerAction.Hover ? null : prevOpenBy))}
        {...tooltipProps}
      >
        {children({ onClick: handleTriggerClick })}
      </Tooltip>
    </ClickAwayListener>
  );
};

export default ClickableTooltip;
