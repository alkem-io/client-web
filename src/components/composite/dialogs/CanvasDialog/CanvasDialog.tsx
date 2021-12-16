import { serializeAsJSON } from '@excalidraw/excalidraw';
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types';
import { ArrowDropDown, CheckCircle, Save } from '@mui/icons-material';
import GradeIcon from '@mui/icons-material/Grade';
import LockClockIcon from '@mui/icons-material/LockClock';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import { isEqual } from 'lodash';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import { Canvas, CanvasCheckoutStateEnum } from '../../../../models/graphql-schema';
import { CanvasLoadedEvent, CANVAS_LOADED_EVENT_NAME } from '../../../../types/events';
import TranslationKey from '../../../../types/TranslationKey';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import CanvasWhiteboard from '../../entities/Canvas/CanvasWhiteboard';
import { CanvasItemState } from '../../lists/Canvas/CanvasListItem';

interface CanvasDialogProps {
  entities: {
    canvas?: CanvasWithoutValue & { value?: Canvas['value'] };
  };
  actions: {
    onCancel: () => void;
    onCheckin: (canvas: CanvasWithoutValue) => void;
    onCheckout: (canvas: CanvasWithoutValue) => void;
    onMarkAsTemplate: (canvas: Canvas) => void;
    onUpdate: (canvas: Canvas) => void;
  };
  options: {
    show: boolean;
    canCheckout?: boolean;
    canEdit?: boolean;
  };
  state?: {
    updatingCanvas?: boolean;
    loadingCanvasValue?: boolean;
    changingCanvasLockState?: boolean;
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
    zIndex: 2,
  },
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

type Option = {
  titleId: TranslationKey;
  enabledWhen: (canvas: CanvasWithoutValue, hasChanged?: boolean) => boolean;
  icon: JSX.Element;
};
type CanvasOptionTypes = 'save' | 'checkin' | 'checkout';
const canvasOptions: Record<CanvasOptionTypes, Option> = {
  save: {
    titleId: 'pages.canvas.state-actions.save',
    enabledWhen: (canvas, hasChanged) =>
      canvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut && Boolean(hasChanged),
    icon: <Save />,
  },
  checkin: {
    titleId: 'pages.canvas.state-actions.check-in',
    enabledWhen: canvas => canvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut,
    icon: <CheckCircle />,
  },
  checkout: {
    titleId: 'pages.canvas.state-actions.check-out',
    enabledWhen: canvas => canvas?.checkout?.status === CanvasCheckoutStateEnum.Available,
    icon: <LockClockIcon />,
  },
  // saveAndCheckin: {
  //   titleId: 'pages.canvas.state-actions.save-and-check-in',
  //   enabledWhen: (canvas, hasChanged) =>
  //     canvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut && Boolean(hasChanged),
  // },
};

const findMostSuitableOption = (canvas?: CanvasWithoutValue, hasChanged?: boolean) => {
  if (!canvas) {
    return 'checkout';
  }

  if (canvasOptions.checkout.enabledWhen(canvas)) {
    return 'checkout';
  }

  if (canvasOptions.save.enabledWhen(canvas, hasChanged)) {
    return 'save';
  }

  return 'checkin';
};

const CanvasDialog: FC<CanvasDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();
  const { canvas } = entities;
  const [isDirty, setIsDirty] = useState(true);
  const canvasRef = useRef<ExcalidrawAPIRefValue>(null);

  // ui
  const styles = useStyles();
  const [selectedOption, setSelectedOption] = useState<CanvasOptionTypes>(findMostSuitableOption(canvas, isDirty));
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [optionPopperOpen, setOptionPopperOpen] = useState(false);

  useEffect(() => {
    const listener = (_: CustomEvent<CanvasLoadedEvent>) => {
      // we have no reliable way to know when a canvas content has been changed,
      // thus allowing the user to always be able to perform save even until we figure it out
      // setIsDirty(false);
    };

    window.addEventListener(CANVAS_LOADED_EVENT_NAME, listener);

    return () => window.removeEventListener(CANVAS_LOADED_EVENT_NAME, listener);
  }, [setIsDirty]);

  useEffect(() => {
    setSelectedOption(findMostSuitableOption(canvas, isDirty));
  }, [canvas, isDirty]);

  const actionMap: { [key in keyof typeof canvasOptions]: (canvas) => void } = {
    checkin: c => actions.onCheckin(c),
    checkout: c => actions.onCheckout(c),
    save: c => {
      canvasRef.current?.readyPromise?.then(canvasApi => {
        const appState = canvasApi.getAppState();
        const elements = canvasApi.getSceneElements();
        actions.onUpdate({ ...c, value: serializeAsJSON(elements, appState) });
      });
    },
  };

  const onClose = async (event: Event) => {
    setOptionPopperOpen(false);

    const canvasApi = await canvasRef.current?.readyPromise;
    if (canvasApi) {
      const elements = canvasApi.getSceneElements();
      const appState = canvasApi.getAppState();
      const value = serializeAsJSON(elements, appState);
      if (!isEqual(canvas?.value, value)) {
        if (
          !window.confirm('It seems you have unsaved changes which will be lost. Are you sure you want to continue?')
        ) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }
    }
    actions.onCancel();
  };

  const handlePopperClose = event => {
    if (anchorRef.current && anchorRef.current?.contains(event.target)) {
      return;
    }

    setOptionPopperOpen(false);
  };

  const loading = state?.changingCanvasLockState || state?.loadingCanvasValue || state?.updatingCanvas;

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
            <ListItemText primary={canvas?.name} secondary={canvas?.checkout?.status.toUpperCase()} />
            <ListItemSecondaryAction sx={{ display: 'flex' }}>
              {(options.canCheckout || options.canEdit) && !canvas?.isTemplate && (
                <LoadingButton
                  startIcon={<GradeIcon />}
                  loadingPosition="start"
                  loading={state?.changingCanvasLockState || state?.updatingCanvas}
                  onClick={() => {
                    if (!canvas?.value) {
                      return;
                    }
                    const canvasValue = canvas.value || '';
                    actions.onMarkAsTemplate({ value: canvasValue, ...canvas });
                  }}
                  disabled={loading}
                >
                  {t('pages.canvas.state-actions.save-as-template')}
                </LoadingButton>
              )}
              <Box p={0.5} display="inline-flex" />
              {(options.canCheckout || options.canEdit) && (
                <>
                  <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                    <LoadingButton
                      startIcon={canvasOptions[selectedOption].icon}
                      onClick={() => actionMap[selectedOption](canvas)}
                      loadingPosition="start"
                      variant="contained"
                      loading={state?.changingCanvasLockState || state?.updatingCanvas}
                    >
                      {t(canvasOptions[selectedOption].titleId)}
                    </LoadingButton>
                    <Button
                      size="small"
                      aria-controls={optionPopperOpen ? 'split-button-menu' : undefined}
                      aria-expanded={optionPopperOpen ? 'true' : undefined}
                      aria-label="select merge strategy"
                      aria-haspopup="menu"
                      onClick={() => {
                        setOptionPopperOpen(x => !x);
                      }}
                    >
                      <ArrowDropDown />
                    </Button>
                  </ButtonGroup>
                  <Popper
                    open={optionPopperOpen}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={handlePopperClose}>
                            <MenuList id="split-button-menu">
                              {Object.keys(canvasOptions).map((optionKey: string) => (
                                <MenuItem
                                  key={canvasOptions[optionKey].titleId}
                                  disabled={!canvasOptions[optionKey].enabledWhen(canvas, isDirty)}
                                  selected={optionKey === selectedOption}
                                  onClick={_ => {
                                    setSelectedOption(optionKey as CanvasOptionTypes);
                                    setOptionPopperOpen(false);
                                  }}
                                >
                                  <ListItemIcon>{canvasOptions[optionKey].icon}</ListItemIcon>
                                  <ListItemText>{t(canvasOptions[optionKey].titleId)}</ListItemText>
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogTitle>
      <DialogContent classes={{ root: styles.dialogContent }}>
        {!state?.loadingCanvasValue && canvas && (
          <CanvasWhiteboard
            entities={{ canvas }}
            ref={canvasRef}
            options={{
              viewModeEnabled: !options.canEdit,
              UIOptions: options.canEdit
                ? undefined
                : {
                    canvasActions: {
                      export: false,
                    },
                  },
            }}
            actions={{
              onUpdate: state =>
                actions.onUpdate({ ...canvas, value: serializeAsJSON(state.elements, state.appState) }),
            }}
          />
        )}
        {state?.loadingCanvasValue && <Loading text="Loading canvas..." />}
      </DialogContent>
    </Dialog>
  );
};

export default CanvasDialog;
