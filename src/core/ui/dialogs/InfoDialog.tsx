import { LoadingButton } from '@mui/lab';
import { DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import DialogHeader from '../dialog/DialogHeader';
import { gutters } from '../grid/utils';
import { BlockTitle } from '../typography';

// could be merged with ConfirmationDialog
// however there's no need of this entities, actions, etc. structure
type InfoDialogProps = {
  entities: {
    title: string | ReactNode;
    content: ReactNode;
    buttonCaption: string;
  };
  actions: {
    onButtonClick: () => void;
  };
  options: {
    show: boolean;
  };
  state?: {
    isLoading: boolean;
  };
};

const InfoDialog = ({ entities, actions, options, state }: InfoDialogProps) => {
  const { title, content, buttonCaption } = entities;

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog" onClose={actions.onButtonClick}>
      <DialogHeader onClose={actions.onButtonClick}>
        <BlockTitle>{title}</BlockTitle>
      </DialogHeader>
      <DialogContent>{content}</DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'end' }}>
        <LoadingButton
          variant="text"
          loading={state?.isLoading}
          disabled={state?.isLoading}
          onClick={actions.onButtonClick}
        >
          {buttonCaption}
        </LoadingButton>
      </Actions>
    </Dialog>
  );
};

export default InfoDialog;
