import { IconButton } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ExpandContentIcon } from './ExpandContent';
import PageContentBlockHeader, { PageContentBlockHeaderProps } from './PageContentBlockHeader';

interface PageContentBlockHeaderWithDialogActionProps extends PageContentBlockHeaderProps {
  onDialogOpen: () => void;
}

const iconSize = (theme: Theme) => theme.spacing(2);

const PageContentBlockHeaderWithDialogAction = ({
  onDialogOpen,
  actions,
  ...headerProps
}: PageContentBlockHeaderWithDialogActionProps) => {
  const dialogAction = (
    <IconButton onClick={onDialogOpen} sx={{ svg: { width: iconSize, height: iconSize } }}>
      <ExpandContentIcon />
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
