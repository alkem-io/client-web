import { IconButton } from '@mui/material';
import { OpenInFull } from '@mui/icons-material'; // TODO replace with custom icon
import PageContentBlockHeader, { PageContentBlockHeaderProps } from './PageContentBlockHeader';

interface PageContentBlockHeaderWithDialogActionProps extends PageContentBlockHeaderProps {
  onDialogOpen: () => void;
}

const PageContentBlockHeaderWithDialogAction = ({
  onDialogOpen,
  actions,
  ...headerProps
}: PageContentBlockHeaderWithDialogActionProps) => {
  const dialogAction = (
    <IconButton onClick={onDialogOpen}>
      <OpenInFull />
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
