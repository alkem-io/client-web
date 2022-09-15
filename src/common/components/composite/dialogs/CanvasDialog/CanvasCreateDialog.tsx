import {
  Box,
  Button,
  DialogActions,
  Grid,
  Paper,
  Step,
  StepLabel,
  StepLabelProps,
  Stepper,
  StepProps,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import { Formik } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateCanvasCanvasTemplateFragment, CreateCanvasOnCalloutInput } from '../../../../../models/graphql-schema';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import CanvasWhiteboard from '../../entities/Canvas/CanvasWhiteboard';
import CanvasList from '../../lists/Canvas/CanvasList';
import CanvasListItem, { CanvasListItemCanvas } from '../../lists/Canvas/CanvasListItem';
import canvasSchema from '../../../../../domain/canvas/validation/canvasSchema';
import FormikInputField from '../../forms/FormikInputField';
import { Identifiable } from '../../../../../domain/shared/types/Identifiable';
import { SectionSpacer } from '../../../../../domain/shared/components/Section/Section';

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

type StepDefinition = { index: number; title: string; optional: boolean };

const steps: Record<'displayName' | 'template' | 'completion', StepDefinition> = {
  displayName: {
    index: 0,
    title: 'Name',
    optional: false,
  },
  template: {
    index: 1,
    title: 'Template',
    optional: true,
  },
  completion: { index: 2, title: 'Complete', optional: false },
};

const stepsArray = Object.values(steps).sort((s1, s2) => s1.index - s2.index);

const NamingStep = () => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column">
      <SectionSpacer />
      <Typography variant="body1">{t('pages.canvas.create-dialog.steps.naming')}</Typography>
      <SectionSpacer />
      <FormikInputField name="displayName" title={t('common.name')} aria-label="canvas-name" required />
    </Box>
  );
};

interface ITemplateStepProps {
  actions: {
    onTemplateSelected: (template: Identifiable) => void;
  };
  entities: {
    selectedTemplate: CreateCanvasCanvasTemplateFragment | undefined;
    templates: CreateCanvasCanvasTemplateFragment[];
  };
  state: {
    templatesLoading?: boolean;
    canvasLoading?: boolean;
  };
}

const TemplateStep: FC<ITemplateStepProps> = ({ actions, entities, state }) => {
  const { templates, selectedTemplate } = entities;

  const { t } = useTranslation();

  const canvasListItems = useMemo<CanvasListItemCanvas[]>(() => {
    return templates.map(({ id, info }) => ({
      id,
      displayName: info.title!,
    }));
  }, [templates]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box display="flex" flexDirection="column">
          <Box p={1} />
          <Typography variant="body1">{t('pages.canvas.create-dialog.steps.templating')}</Typography>
          <Box p={1} />
          <CanvasList
            entities={{
              canvases: canvasListItems,
              selectedCanvasId: selectedTemplate?.id,
            }}
            actions={{
              onSelect: template => actions.onTemplateSelected(template),
            }}
            options={{}}
            state={{
              loading: state.templatesLoading,
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" justifyContent="center" alignItems="center" height={'100%'} minHeight={600} minWidth={450}>
          {!selectedTemplate && !state.canvasLoading && (
            <Typography variant="overline">{t('pages.canvas.create-dialog.no-template-selected')}</Typography>
          )}
          {state.canvasLoading && <Loading text="Loading canvas..." />}
          {selectedTemplate && !state.canvasLoading && (
            <CanvasWhiteboard
              entities={{
                canvas: selectedTemplate,
              }}
              actions={{}}
              options={{
                viewModeEnabled: true,
                UIOptions: {
                  canvasActions: {
                    export: false,
                  },
                },
              }}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

interface ICompletionStepProps {
  entities: {
    displayName: string;
    template?: CreateCanvasCanvasTemplateFragment;
  };
}

const CompletionStep: FC<ICompletionStepProps> = ({ entities }) => {
  const { displayName, template } = entities;
  const { t } = useTranslation();

  const canvasFromTemplate = useMemo<CanvasListItemCanvas | undefined>(() => {
    if (!template) {
      return undefined;
    }
    return {
      id: template.id,
      displayName: template.info.title!,
    };
  }, [template]);

  return (
    <Box display="flex" flexDirection="column">
      <Box p={1} />
      <Typography variant="body1">{t('pages.canvas.create-dialog.steps.completing')}</Typography>
      <Box p={1} />
      <Typography variant="subtitle1">
        Name:{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>
          {displayName}
        </Box>
      </Typography>
      {template && <Typography variant="subtitle1">Template:</Typography>}
      {canvasFromTemplate && <CanvasListItem canvas={canvasFromTemplate} />}
    </Box>
  );
};

interface CreateCanvasStepsProps {
  entities: {
    templates: CreateCanvasCanvasTemplateFragment[];
    template?: CreateCanvasCanvasTemplateFragment;
    displayName: string;
  };
  actions: {
    onSubmit: () => void;
    onTemplateSelected: (template?: Identifiable) => void;
  };
  state: ITemplateStepProps['state'];
  isValid: boolean;
}

const CreateCanvasSteps: FC<CreateCanvasStepsProps> = ({ entities, actions, state, isValid }) => {
  const { templates, displayName, template } = entities;
  const { onSubmit } = actions;

  const styles = useStyles();

  const [activeStep, setActiveStep] = React.useState<StepDefinition>(steps.displayName);
  const [skipped, setSkipped] = React.useState(new Set<StepDefinition>());

  const isStepOptional = (step: StepDefinition) => {
    return step.optional;
  };

  const isStepSkipped = (step: StepDefinition) => {
    return skipped.has(step);
  };

  const findStepByIndex = (index: number) => Object.values(steps).find(s => s.index === index);

  const handleNext = () => {
    if (activeStep === steps.completion) {
      return onSubmit();
    }

    let newSkipped = skipped;

    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep(prevActiveStep => findStepByIndex(prevActiveStep.index + 1) as StepDefinition);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => findStepByIndex(prevActiveStep.index - 1) as StepDefinition);
  };

  const handleSkip = () => {
    if (!isValid) {
      throw new Error("You can't proceed if the form isn't valid.");
    }

    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    if (activeStep === steps.template) {
      actions.onTemplateSelected(undefined);
    }

    setActiveStep(prevActiveStep => findStepByIndex(prevActiveStep.index + 1) as StepDefinition);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  return (
    <>
      <Paper elevation={0} square>
        <Stepper activeStep={activeStep.index} className={styles.stepper}>
          {stepsArray.map(step => {
            const stepProps: StepProps = {};
            const labelProps: StepLabelProps = {};
            if (isStepOptional(step)) {
              labelProps.optional = <Typography variant="caption">Optional</Typography>;
            }
            if (isStepSkipped(step)) {
              stepProps.completed = false;
            }
            return (
              <Step key={step.title.replaceAll(' ', '-')} {...stepProps}>
                <StepLabel {...labelProps}>{step.title}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>
      <DialogContent classes={{ root: styles.dialogContent }}>
        {activeStep === steps.displayName && <NamingStep />}
        {activeStep === steps.template && (
          <TemplateStep
            entities={{ templates, selectedTemplate: template }}
            actions={{ onTemplateSelected: actions.onTemplateSelected }}
            state={{
              templatesLoading: state.templatesLoading,
              canvasLoading: state.canvasLoading,
            }}
          />
        )}
        {activeStep === steps.completion && <CompletionStep entities={{ displayName, template: template }} />}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" disabled={activeStep === stepsArray[0]} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {isStepOptional(activeStep) && (
          <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
            Skip
          </Button>
        )}

        <Button onClick={handleNext} disabled={!isValid}>
          {activeStep === stepsArray[stepsArray.length - 1] ? 'Finish' : 'Next'}
        </Button>
      </DialogActions>
    </>
  );
};

interface CanvasCreateDialogProps {
  entities: {
    calloutID: string;
    templates: CreateCanvasCanvasTemplateFragment[];
  };
  actions: {
    onCancel: () => void;
    onConfirm: (input: CreateCanvasOnCalloutInput) => void;
  };
  options: {
    show: boolean;
  };
  state?: CreateCanvasStepsProps['state'];
}

const CanvasCreateDialog: FC<CanvasCreateDialogProps> = ({ entities, actions, options }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();

  const initialValues = {
    displayName: 'New Canvas', // TODO Localize?
    value: undefined,
  };

  const handleSubmit = (canvasInput: Omit<CreateCanvasOnCalloutInput, 'calloutID'>) => {
    actions.onConfirm({
      calloutID: entities.calloutID,
      ...canvasInput,
    });
  };

  const selectedTemplate = entities.templates.find(({ id }) => id === selectedTemplateId);

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
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={canvasSchema}>
        {({ values: { displayName }, handleSubmit, setFieldValue, isValid }) => (
          <CreateCanvasSteps
            isValid={isValid}
            entities={{
              ...entities,
              displayName,
              template: selectedTemplate,
            }}
            actions={{
              ...actions,
              onSubmit: () => {
                if (selectedTemplate) {
                  setFieldValue('value', selectedTemplate.value);
                }
                handleSubmit();
              },
              onTemplateSelected: canvas => {
                setSelectedTemplateId(canvas?.id);
              },
            }}
            state={{}}
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default CanvasCreateDialog;
