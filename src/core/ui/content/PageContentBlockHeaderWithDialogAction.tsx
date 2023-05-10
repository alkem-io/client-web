import React, { PropsWithChildren } from 'react';
import { IconButton } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ExpandContentIcon } from './ExpandContent';
import PageContentBlockHeader, { PageContentBlockHeaderProps } from './PageContentBlockHeader';
import { Close } from '@mui/icons-material';

interface PageContentBlockHeaderWithDialogActionProps extends PageContentBlockHeaderProps {
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  expanded?: boolean;
}

const iconSize = (theme: Theme) => theme.spacing(2);

const PageContentBlockHeaderWithDialogAction = ({
  expanded = false,
  onDialogOpen,
  onDialogClose,
  actions,
  ...headerProps
}: PropsWithChildren<PageContentBlockHeaderWithDialogActionProps>) => {
  const dialogAction = (
    <IconButton onClick={expanded ? onDialogClose : onDialogOpen} sx={{ svg: { width: iconSize, height: iconSize } }}>
      {expanded ? <Close /> : <ExpandContentIcon />}
    </IconButton>
  );

  return (
    <PageContentBlockHeader
      {...headerProps}
      actions={
        <>
          {actions}
          {dialogAction}
        </>
      }
    />
  );
};

export default PageContentBlockHeaderWithDialogAction;
