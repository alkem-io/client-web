import { Children, PropsWithChildren } from 'react';

import RouterLink from '../../../../core/ui/link/RouterLink';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ButtonWithTooltip from '../../../../core/ui/button/ButtonWithTooltip';

import { isDialogDef } from './DialogDefinition';
import { gutters } from '../../../../core/ui/grid/utils';
import unwrapFragment from '../../../../core/ui/utils/unwrapFragment';

const DialogActionButtons = ({ column = false, children }: PropsWithChildren<{ column?: boolean }>) => {
  const getStyles = (column: boolean) => ({
    columnGap: gutters(0.25), // Replace magic number with design system value
    justifyContent: 'space-between',
    padding: column ? gutters(0.5) : 0,
    overflow: column ? undefined : 'visible',
    border: column ? undefined : 'transparent',
    backgroundColor: column ? undefined : 'transparent',
  });

  return (
    <PageContentBlock row={!column} accent={column} sx={getStyles(column)}>
      {Children.map(unwrapFragment(children), node => {
        if (!isDialogDef(node)) {
          return node;
        }

        const { icon: Icon, label, dialogType, url = dialogType } = node.props;

        return (
          <RouterLink to={url} key={dialogType} sx={{ flexShrink: 1, minWidth: 0 }}>
            <ButtonWithTooltip
              iconButton
              tooltip={label}
              sx={{ maxWidth: '100%' }}
              variant={column ? 'text' : 'contained'}
              tooltipPlacement={column ? 'right' : 'bottom'}
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
