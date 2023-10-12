import React, { MouseEventHandler, ReactElement, Ref, useRef, useState } from 'react';
import { ClickAwayListener, Popper, PopperProps } from '@mui/material';
import { debounce } from 'lodash';

export interface TriggerProps {
  ref: Ref<Element>;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
}

interface ContentProps {
  onClose: () => void;
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  TransitionProps?: {
    in: boolean;
    onEnter: () => {};
    onExited: () => {};
  };
}

interface ClickableTooltipProps extends Omit<PopperProps, 'open' | 'children'> {
  renderTrigger: ({ onClick }: TriggerProps) => ReactElement;
  children: ({ onClose }: ContentProps) => ReactElement;
  mouseLeaveDebounceWait?: number;
  zIndex?: number;
}

enum OpenTriggerAction {
  Click = 'Click',
  Hover = 'Hover',
}

interface OpenState {
  anchor: HTMLElement;
  action: OpenTriggerAction;
}

const MOUSE_LEAVE_DEBOUNCE_WAIT_DEFAULT = 100;

const ClickableTooltip = ({
  renderTrigger,
  children,
  mouseLeaveDebounceWait = MOUSE_LEAVE_DEBOUNCE_WAIT_DEFAULT,
  zIndex,
  sx,
  ...props
}: ClickableTooltipProps) => {
  const [openState, setOpenState] = useState<OpenState | null>(null);

  const handleClose = () => {
    setOpenState(null);
  };

  const handleTriggerClick: MouseEventHandler<HTMLElement> = event => {
    setOpenState(prevState => {
      if (prevState?.action === OpenTriggerAction.Click) {
        return null;
      }

      return {
        action: OpenTriggerAction.Click,
        anchor: event.currentTarget,
      };
    });
  };

  const handleTriggerMouseEnter: MouseEventHandler<HTMLElement> = event => {
    handleMouseLeaveDebounced.cancel();

    setOpenState(prevState => {
      if (prevState?.action === OpenTriggerAction.Click) {
        return prevState;
      }

      return {
        action: OpenTriggerAction.Hover,
        anchor: event.currentTarget,
      };
    });
  };

  const handleMouseLeave: MouseEventHandler<HTMLElement> = () =>
    setOpenState(prevState => {
      return prevState?.action === OpenTriggerAction.Click ? prevState : null;
    });

  const handleMouseLeaveDebounced = useRef(debounce(handleMouseLeave, mouseLeaveDebounceWait)).current;

  const handleTriggerClickAway = (event: MouseEvent | TouchEvent) => {
    if (!popperRef.current?.contains(event.target as Node)) {
      handleClose();
    }
  };

  const triggerRef = useRef<Element>(null);

  const handleContentClickAway = (event: MouseEvent | TouchEvent) => {
    if (!triggerRef.current?.contains(event.target as Node)) {
      handleClose();
    }
  };

  const handleContentMouseEnter = () => {
    handleMouseLeaveDebounced.cancel();
  };

  const popperRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ClickAwayListener onClickAway={handleTriggerClickAway}>
        {renderTrigger({
          ref: triggerRef,
          onClick: handleTriggerClick,
          onMouseEnter: handleTriggerMouseEnter,
          onMouseLeave: handleMouseLeaveDebounced,
        })}
      </ClickAwayListener>
      <Popper
        ref={popperRef}
        open={!!openState}
        anchorEl={openState?.anchor}
        {...props}
        sx={{
          ...sx,
          zIndex,
        }}
        transition
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleMouseLeaveDebounced}
      >
        {({ TransitionProps }) =>
          children({
            onClose: handleClose,
            onClickAway: handleContentClickAway,
            TransitionProps,
          })
        }
      </Popper>
    </>
  );
};

export default ClickableTooltip;
