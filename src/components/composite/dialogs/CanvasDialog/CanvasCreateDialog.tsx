import {
  Box,
  Button,
  DialogActions,
  Step,
  StepLabel,
  StepLabelProps,
  Stepper,
  StepProps,
  TextField,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import { Canvas, CreateCanvasOnContextInput } from '../../../../models/graphql-schema';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';

interface CanvasCreateDialogProps {
  entities: {
    contextID: string;
    templates: Record<string, CanvasWithoutValue[]>;
  };
  actions: {
    onCancel: () => void;
    onConfirm: (input: CreateCanvasOnContextInput) => void;
    onLoad: (canvas: CanvasWithoutValue) => Promise<Canvas | undefined>;
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

const steps = [
  {
    title: 'Name your canvas',
  },
  { title: 'Choose a template' },
  { title: "Describe what it's going to be about" },
];

const CanvasStep1: FC<{ onSubmit: (name: string) => void }> = ({ onSubmit }) => {
  const [name, setName] = useState<string>('New Canvas');
  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="h4">Name your canvas:</Typography>
      <TextField
        value={name}
        onChange={e => setName(e.target.value)}
        title="Name"
        label="Name"
        aria-label="canvas-name"
      />
    </Box>
  );
};

const CreateCanvasSteps = () => {
  // form
  const [name, setName] = useState<string>();

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const isStepOptional = step => {
    return step === 1;
  };

  const isStepSkipped = step => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: StepProps = {};
          const labelProps: StepLabelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = <Typography variant="caption">Optional</Typography>;
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label.title.replaceAll(' ', '-')} {...stepProps}>
              <StepLabel {...labelProps}>{label.title}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 && <CanvasStep1 onSubmit={setName} />}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {isStepOptional(activeStep) && (
          <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
            Skip
          </Button>
        )}

        <Button onClick={handleNext}>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
      </Box>
    </>
  );
};

const CanvasCreateDialog: FC<CanvasCreateDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const [newCanvas] = useState<{ name: string; value?: string }>({ name: 'Test' });

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
        <CreateCanvasSteps />
      </DialogContent>
      <DialogActions>
        {state?.loading ? (
          <Loading text={'Loading ...'} />
        ) : (
          <Button
            onClick={() =>
              actions.onConfirm({
                contextID: entities.contextID,
                name: newCanvas.name,
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
