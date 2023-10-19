import React, { cloneElement, MouseEventHandler, ReactElement, Ref, useRef, useState } from 'react';
import { Box, ClickAwayListener, Drawer, Grow, Popper, PopperProps } from '@mui/material';
import { debounce } from 'lodash';
import { gutters } from '../grid/utils';

export interface TriggerProps {
  ref: Ref<Element>;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
}

interface ContentProps {
  onClose?: () => void;
}

interface ClickableTooltipProps extends Omit<PopperProps, 'open' | 'children'> {
  renderTrigger: ({ onClick }: TriggerProps) => ReactElement;
  children: ReactElement<ContentProps>;
  mouseLeaveDebounceWait?: number;
  zIndex?: number;
  drawer?: boolean;
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

const MenuTriggerButton = ({
  renderTrigger,
  children,
  mouseLeaveDebounceWait = MOUSE_LEAVE_DEBOUNCE_WAIT_DEFAULT,
  zIndex,
  sx,
  drawer = false,
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
      {!drawer && (
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
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: 'right top',
              }}
            >
              <Box paddingY={gutters(0.5)}>
                <ClickAwayListener onClickAway={handleContentClickAway}>
                  {cloneElement(children, { onClose: handleClose })}
                </ClickAwayListener>
              </Box>
            </Grow>
          )}
        </Popper>
      )}
      {drawer && (
        <Drawer anchor="right" open={!!openState} onClose={handleClose}>
          {cloneElement(children, { onClose: handleClose })}
        </Drawer>
      )}
    </>
  );
};

export default MenuTriggerButton;
