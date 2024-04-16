import { MenuList } from '@mui/material';
import React, { Children, PropsWithChildren } from 'react';
import { DialogDef, DialogDefinitionProps } from './DialogDefinition';
import NavigatableMenuItem from '../../../../core/ui/menu/NavigatableMenuItem';
import unwrapFragment from '../../../../core/ui/utils/unwrapFragment';
import { Caption } from '../../../../core/ui/typography';

interface DialogActionsMenuProps {
  onClose: () => void;
}

const MenuItemLabel = props => <Caption {...props} />;

const DialogActionsMenu = ({ children, onClose }: PropsWithChildren<DialogActionsMenuProps>) => {
  return (
    <MenuList sx={{ paddingTop: 0, paddingBottom: 1 }}>
      {Children.map(unwrapFragment(children), node => {
        if (node && node['type'] === DialogDef) {
          const { icon, label, dialogType } = node['props'] as DialogDefinitionProps;
          return (
            <NavigatableMenuItem
              key={dialogType}
              iconComponent={icon}
              route={dialogType}
              onClick={onClose}
              typographyComponent={MenuItemLabel}
            >
              {label}
            </NavigatableMenuItem>
          );
        }
        return node;
      })}
    </MenuList>
  );
};

export default DialogActionsMenu;
