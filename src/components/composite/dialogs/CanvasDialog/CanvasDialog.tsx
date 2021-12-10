import { CheckCircle } from '@mui/icons-material';
import GradeIcon from '@mui/icons-material/Grade';
import LockClockIcon from '@mui/icons-material/LockClock';
import {
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, CanvasCheckoutStateEnum } from '../../../../models/graphql-schema';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import CanvasWhiteboard from '../../entities/Canvas/CanvasWhiteboard';
import { CanvasItemState } from '../../lists/Canvas/CanvasListItem';

interface CanvasDialogProps {
  entities: {
    canvas?: Canvas;
  };
  actions: {
    onCancel: () => void;
    onCheckin: (canvas: Canvas) => void;
    onCheckout: (canvas: Canvas) => void;
    onMarkAsTemplate: (canvas: Canvas) => void;
    onUpdate: (canvas: Canvas) => void;
  };
  options: {
    show: boolean;
    canCheckout?: boolean;
    canEdit?: boolean;
  };
  state?: {
    loading?: boolean;
  };
}

const useStyles = makeStyles(theme => ({
  dialogRoot: {
    height: '85vh',
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacing(0)} ${theme.spacing(1)}`,
  },
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: 0,
  },
}));

const CanvasOption = ({ canvas }) => {
  switch (canvas.checkout?.status) {
    case CanvasCheckoutStateEnum.Available:
      return <LockClockIcon />;
    case CanvasCheckoutStateEnum.CheckedOut:
      return <CheckCircle />;
    default:
      return <></>;
  }
};

const CanvasDialog: FC<CanvasDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();
  const { canvas } = entities;
  const styles = useStyles();

  const onClose = () => {
    actions.onCancel();
  };

  if (!canvas) {
    return <></>;
  }

  const checkInOutButtonText =
    canvas.checkout?.status === CanvasCheckoutStateEnum.Available
      ? 'pages.canvas.state-actions.check-out'
      : 'pages.canvas.state-actions.check-in';

  return (
    <Dialog
      open={options.show}
      aria-labelledby="canvas-dialog"
      maxWidth={false}
      fullWidth
      classes={{
        paper: styles.dialogRoot,
      }}
      onClose={onClose}
    >
      <DialogTitle
        id="canvas-dialog-title"
        onClose={onClose}
        classes={{
          root: styles.dialogTitle,
        }}
      >
        <List disablePadding>
          <ListItem>
            <ListItemIcon sx={{ justifyContent: 'center' }}>
              <CanvasItemState canvas={canvas} />
            </ListItemIcon>
            <ListItemText primary={canvas.name} secondary={canvas.checkout?.status.toUpperCase()} />
            <ListItemSecondaryAction>
              {/* {options.canEdit && (
                <IconButton
                  color="primary"
                  onClick={() => {
                    actions.onUpdate({ ...canvas, value: JSON.stringify(whiteboardState) });
                  }}
                  disabled={state?.loading}
                >
                  <SaveIcon />
                </IconButton>
              )} */}
              {(options.canCheckout || options.canEdit) && !canvas.isTemplate && (
                <Button
                  startIcon={<GradeIcon />}
                  color="primary"
                  onClick={() => {
                    actions.onMarkAsTemplate(canvas);
                  }}
                  disabled={state?.loading}
                >
                  {t('pages.canvas.state-actions.save-as-template')}
                </Button>
              )}
              <Box p={0.5} display="inline-flex" />
              {(options.canCheckout || options.canEdit) && (
                <Button
                  startIcon={<CanvasOption canvas={canvas} />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (canvas.checkout?.status === CanvasCheckoutStateEnum.Available) {
                      actions.onCheckout(canvas);
                    } else {
                      actions.onCheckin(canvas);
                    }
                  }}
                  disabled={state?.loading}
                >
                  {t(checkInOutButtonText)}
                </Button>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogTitle>
      {state?.loading && <LinearProgress />}
      <DialogContent classes={{ root: styles.dialogContent }}>
        <CanvasWhiteboard
          entities={{ canvas }}
          options={{
            viewModeEnabled: !options.canEdit,
          }}
          actions={{
            onUpdate: state => actions.onUpdate({ ...canvas, value: JSON.stringify(state) }),
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CanvasDialog;
