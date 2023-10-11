import React, { Ref } from 'react';
import { Box, ClickAwayListener, Grow } from '@mui/material';
import { ReactComponent as AlkemioLogo } from '../../../domain/platform/Logo/Logo-Small.svg';
import NavigationItemContainer from '../../../core/ui/navigation/NavigationItemContainer';
import { gutters } from '../../../core/ui/grid/utils';
import NavigationItemButton from '../../../core/ui/navigation/NavigationItemButton';
import ClickableTooltip from '../../../core/ui/tooltip/ClickableTooltip';
import PlatformNavigationMenu from './PlatformNavigationMenu';

const PlatformNavigationMenuButton = () => {
  return (
    <ClickableTooltip
      placement="bottom-end"
      renderTrigger={({ ref, ...props }) => (
        <NavigationItemContainer ref={ref as Ref<HTMLDivElement>}>
          <NavigationItemButton
            sx={{ height: gutters(2), width: gutters(2.5), svg: { height: gutters(2) } }}
            {...props}
          >
            <AlkemioLogo />
          </NavigationItemButton>
        </NavigationItemContainer>
      )}
    >
      {({ onClose, onClickAway, TransitionProps, onMouseEnter, onMouseLeave }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: 'right top',
          }}
        >
          <Box padding={gutters(0.5)} paddingRight={0} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <ClickAwayListener onClickAway={onClickAway}>
              <PlatformNavigationMenu onClose={onClose} />
            </ClickAwayListener>
          </Box>
        </Grow>
      )}
    </ClickableTooltip>
  );
};

export default PlatformNavigationMenuButton;
