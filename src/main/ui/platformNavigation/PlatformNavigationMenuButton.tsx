import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import { ReactComponent as AlkemioLogo } from '../../../domain/platform/Logo/Logo-Small.svg';
import NavigationItemContainer from '../../../core/ui/navigation/NavigationItemContainer';
import { gutters } from '../../../core/ui/grid/utils';
import NavigationItemButton from '../../../core/ui/navigation/NavigationItemButton';
import ClickableTooltip from '../../../core/ui/tooltip/ClickableTooltip';
import PlatformNavigationMenu from './PlatformNavigationMenu';

const Wrapper = forwardRef((props, ref) => <Box ref={ref} padding={gutters(0.5)} {...props} />);

const PlatformNavigationMenuButton = () => {
  return (
    <ClickableTooltip
      components={{
        Tooltip: Wrapper,
      }}
      title={<PlatformNavigationMenu />}
    >
      {({ onClick }) => (
        <NavigationItemContainer>
          <NavigationItemButton
            sx={{ height: gutters(2), width: gutters(2.5), svg: { height: gutters(2) } }}
            onClick={onClick}
          >
            <AlkemioLogo />
          </NavigationItemButton>
        </NavigationItemContainer>
      )}
    </ClickableTooltip>
  );
};

export default PlatformNavigationMenuButton;
