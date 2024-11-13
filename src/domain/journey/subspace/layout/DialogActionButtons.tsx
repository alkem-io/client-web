import React, { Children, PropsWithChildren } from 'react';
import { isDialogDef } from './DialogDefinition';
import unwrapFragment from '@core/ui/utils/unwrapFragment';
import ButtonWithTooltip from '@core/ui/button/ButtonWithTooltip';
import RouterLink from '@core/ui/link/RouterLink';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import { gutters } from '@core/ui/grid/utils';

interface DialogActionButtonsProps {
  column?: boolean;
}

const DialogActionButtons = ({ column = false, children }: PropsWithChildren<DialogActionButtonsProps>) => {
  return (
    <PageContentBlock
      accent={column}
      row={!column}
      sx={{
        padding: column ? gutters(0.5) : 0,
        justifyContent: 'space-between',
        columnGap: 0.1,
        backgroundColor: column ? undefined : 'transparent',
        border: column ? undefined : 'transparent',
        overflow: column ? undefined : 'visible',
      }}
    >
      {Children.map(unwrapFragment(children), node => {
        if (!isDialogDef(node)) {
          return node;
        }

        const { icon: Icon, label, dialogType, url = dialogType } = node.props;

        return (
          <RouterLink to={url} key={dialogType} sx={{ flexShrink: 1, minWidth: 0 }}>
            <ButtonWithTooltip
              variant={column ? 'text' : 'contained'}
              tooltip={label}
              tooltipPlacement={column ? 'right' : 'bottom'}
              sx={{ maxWidth: '100%' }}
              iconButton
            >
              <Icon />
            </ButtonWithTooltip>
          </RouterLink>
        );
      })}
    </PageContentBlock>
  );
};

export default DialogActionButtons;
