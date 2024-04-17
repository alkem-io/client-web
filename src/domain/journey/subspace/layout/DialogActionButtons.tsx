import React, { Children, PropsWithChildren } from 'react';
import { isDialogDef } from './DialogDefinition';
import unwrapFragment from '../../../../core/ui/utils/unwrapFragment';
import ButtonWithTooltip from '../../../../core/ui/button/ButtonWithTooltip';
import RouterLink from '../../../../core/ui/link/RouterLink';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';

interface DialogActionButtonsProps {}

const DialogActionButtons = ({ children }: PropsWithChildren<DialogActionButtonsProps>) => {
  return (
    <PageContentBlockSeamless row disablePadding sx={{ justifyContent: 'space-between', gap: 0.1 }}>
      {Children.map(unwrapFragment(children), node => {
        if (!isDialogDef(node)) {
          return node;
        }

        const { icon: Icon, label, dialogType } = node.props;

        return (
          <RouterLink to={dialogType} key={dialogType} sx={{ flexShrink: 1, minWidth: 0 }}>
            <ButtonWithTooltip variant="contained" tooltip={String(label)} sx={{ maxWidth: '100%' }} iconButton>
              <Icon />
            </ButtonWithTooltip>
          </RouterLink>
        );
      })}
    </PageContentBlockSeamless>
  );
};

export default DialogActionButtons;
