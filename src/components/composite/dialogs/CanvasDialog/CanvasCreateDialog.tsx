import { Button, DialogActions, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateCanvasOnContextInput } from '../../../../models/graphql-schema';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';

interface CanvasCreateDialogProps {
  entities: {
    contextID: string;
  };
  actions: {
    onCancel: () => void;
    onConfirm: (input: CreateCanvasOnContextInput) => void;
  };
  options: {
    show: boolean;
  };
  state?: {
    loading: boolean;
  };
}

const useStyles = makeStyles(theme => ({
  dialogRoot: {},
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
}));

const CanvasCreateDialog: FC<CanvasCreateDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const [name, setName] = useState('New Canvas');

  return (
    <Dialog
      open={options.show}
      aria-labelledby="canvas-dialog"
      classes={{
        paper: styles.dialogRoot,
      }}
      onClose={actions.onCancel}
    >
      <DialogTitle
        id="canvas-dialog-title"
        onClose={actions.onCancel}
        classes={{
          root: styles.dialogTitle,
        }}
      >
        {t('pages.canvas.create-dialog.header')}
      </DialogTitle>
      <DialogContent classes={{ root: styles.dialogContent }}>
        <TextField
          value={name}
          onChange={e => setName(e.target.value)}
          title="Name"
          label="Name"
          aria-label="canvas-name"
        />
      </DialogContent>
      <DialogActions>
        {state?.loading ? (
          <Loading text={'Loading ...'} />
        ) : (
          <Button
            onClick={() =>
              actions.onConfirm({
                contextID: entities.contextID,
                name,
              })
            }
            disabled={state?.loading}
          >
            Create
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CanvasCreateDialog;
