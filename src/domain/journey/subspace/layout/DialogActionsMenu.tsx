import { MenuList } from '@mui/material';
import React, { Children, PropsWithChildren } from 'react';
import { isDialogDef } from './DialogDefinition';
import NavigatableMenuItem from '@core/ui/menu/NavigatableMenuItem';
import unwrapFragment from '@core/ui/utils/unwrapFragment';
import { Caption } from '@core/ui/typography';

interface DialogActionsMenuProps {
  onClose: () => void;
}

const MenuItemLabel = props => <Caption {...props} />;

const DialogActionsMenu = ({ children, onClose }: PropsWithChildren<DialogActionsMenuProps>) => {
  return (
    <MenuList sx={{ paddingTop: 0, paddingBottom: 1 }}>
      {Children.map(unwrapFragment(children), node => {
        if (!isDialogDef(node)) {
          return node;
        }
        const { icon, label, dialogType, url = dialogType } = node.props;
        return (
          <NavigatableMenuItem
            key={dialogType}
            iconComponent={icon}
            route={url}
            onClick={onClose}
            typographyComponent={MenuItemLabel}
          >
            {label}
          </NavigatableMenuItem>
        );
      })}
    </MenuList>
  );
};

export default DialogActionsMenu;
