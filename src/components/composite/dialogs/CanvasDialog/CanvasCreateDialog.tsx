import {
  Box,
  Button,
  DialogActions,
  Grid,
  ListSubheader,
  Paper,
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
import { ITemplateQueryResult, TemplateQuery } from '../../../../containers/canvas/CanvasProvider';
import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import { Canvas, CreateCanvasOnContextInput } from '../../../../models/graphql-schema';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import CanvasWhiteboard from '../../entities/Canvas/CanvasWhiteboard';
import CanvasList from '../../lists/Canvas/CanvasList';
import CanvasListItem from '../../lists/Canvas/CanvasListItem';

interface CanvasCreateDialogProps {
  entities: {
    contextID: string;
    templates: Record<string, ITemplateQueryResult>;
  };
  actions: {
    onCancel: () => void;
    onConfirm: (input: CreateCanvasOnContextInput) => void;
    onLoad: (canvas: CanvasWithoutValue, query: TemplateQuery) => Promise<Canvas | undefined>;
  };
  options: {
    show: boolean;
  };
  state?: {
    loading: boolean;
  };
}

const useStyles = makeStyles(theme => ({
  dialogRoot: {
    background: theme.palette.background.default,
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  stepper: {
    padding: theme.spacing(2),
    minWidth: 600,

    [theme.breakpoints.down('md')]: {
      minWidth: 400,
    },
  },
}));

const steps = [
  {
    title: 'Name',
  },
  { title: 'Template' },
  { title: 'Complete' },
];

const CanvasNamingStep: FC<{ onChange: (name: string) => void; name: string }> = ({ onChange, name }) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Box p={1} />
      <Typography variant="body1">{t('pages.canvas.create-dialog.steps.naming')}</Typography>
      <Box p={1} />
      <TextField
        value={name}
        onChange={e => onChange(e.target.value)}
        title="Name"
        label="Name"
        aria-label="canvas-name"
        required
      />
    </Box>
  );
};

const CanvasTemplateStep: FC<{
  onSelect: (canvas: CanvasWithoutValue, query: TemplateQuery) => void;
  selectedCanvas?: Canvas;
  templates: Record<string, ITemplateQueryResult>;
}> = ({ onSelect, templates, selectedCanvas }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box display="flex" flexDirection="column">
          <Box p={1} />
          <Typography variant="body1">{t('pages.canvas.create-dialog.steps.templating')}</Typography>
          <Box p={1} />
          {Object.keys(templates).map(
            key =>
              templates[key].result.length > 0 && (
                <Box key={key}>
                  <ListSubheader key={`header_${key}`} sx={{ textTransform: 'capitalize' }}>
                    {key}
                  </ListSubheader>
                  <CanvasList
                    key={`list_${key}`}
                    entities={{
                      canvases: templates[key].result,
                      selectedCanvasId: selectedCanvas?.id,
                    }}
                    actions={{
                      onSelect: template => onSelect(template, templates[key].query),
                    }}
                    options={{}}
                    state={{
                      loading: false,
                    }}
                  />
                </Box>
              )
          )}
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" justifyContent="center" alignItems="center" height={'100%'} minHeight={600} minWidth={450}>
          {!selectedCanvas && (
            <Typography variant="overline">{t('pages.canvas.create-dialog.no-template-selected')}</Typography>
          )}
          {selectedCanvas && (
            <CanvasWhiteboard
              entities={{
                canvas: selectedCanvas,
              }}
              actions={{}}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

const CanvasCompletionStep: FC<{ name: string; canvas?: Canvas }> = ({ name, canvas }) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <Box p={1} />
      <Typography variant="body1">{t('pages.canvas.create-dialog.steps.completing')}</Typography>
      <Box p={1} />
      <Typography variant="subtitle1">
        Name:{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>
          {name}
        </Box>
      </Typography>
      {canvas && <Typography variant="subtitle1">Template:</Typography>}
      {canvas && <CanvasListItem entities={{ canvas }} actions={{}} options={{ isSelected: false }} />}
    </Box>
  );
};

const CreateCanvasSteps: FC<{
  templates: Record<string, ITemplateQueryResult>;
  contextID: string;
  onConfirm: (input: CreateCanvasOnContextInput) => void;
  onLoad: (canvas: CanvasWithoutValue, query: TemplateQuery) => Promise<Canvas | undefined>;
}> = ({ templates, contextID, onLoad, onConfirm }) => {
  // form
  const [name, setName] = useState<string>('New Canvas');
  const [selectedTemplate, setSelectedTemplate] = useState<Canvas>();

  const onSelect = async (canvas: CanvasWithoutValue, query: TemplateQuery) => {
    if (canvas?.id === selectedTemplate?.id) {
      setSelectedTemplate(undefined);
      return;
    }
    const loadedCanvas = await onLoad(canvas, query);
    setSelectedTemplate(loadedCanvas);
  };

  const styles = useStyles();

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = step => {
    return step === 1;
  };

  const isStepSkipped = step => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === 2 && name) {
      onConfirm({
        contextID,
        name,
        value: selectedTemplate?.value,
      });
    }

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

    if (activeStep === 1) {
      setSelectedTemplate(undefined);
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  return (
    <>
      <Paper elevation={0} square>
        <Stepper activeStep={activeStep} className={styles.stepper}>
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
      </Paper>
      <DialogContent classes={{ root: styles.dialogContent }}>
        {activeStep === 0 && <CanvasNamingStep onChange={setName} name={name} />}
        {activeStep === 1 && (
          <CanvasTemplateStep templates={templates} onSelect={onSelect} selectedCanvas={selectedTemplate} />
        )}
        {activeStep === 2 && <CanvasCompletionStep name={name} canvas={selectedTemplate} />}
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </>
  );
};

const CanvasCreateDialog: FC<CanvasCreateDialogProps> = ({ entities, actions, options }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Dialog
      open={options.show}
      aria-labelledby="canvas-dialog"
      classes={{
        paper: styles.dialogRoot,
      }}
      onClose={actions.onCancel}
      maxWidth="lg"
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
      <CreateCanvasSteps
        templates={entities.templates}
        onConfirm={actions.onConfirm}
        onLoad={actions.onLoad}
        contextID={entities.contextID}
      />
      {/* <DialogActions>
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
      </DialogActions> */}
    </Dialog>
  );
};

export default CanvasCreateDialog;
