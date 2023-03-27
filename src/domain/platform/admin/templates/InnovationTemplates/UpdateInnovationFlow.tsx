import React, { FC, useCallback, useState } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../../../core/apollo/generated/graphql-schema';
import InnovationFlowVisualizer from './InnovationFlowVisualizer';
import SelectInnovationFlowDialog, {
  InnovationFlowTemplate,
  SelectInnovationFlowFormValuesType,
} from './SelectInnovationFlowDialog';
import InnovationFlowUpdateConfirmDialog from './InnovationFlowUpdateConfirmDialog';

interface EditLifecycleProps {
  lifecycle: Lifecycle | undefined;
  entityId: string;
  onSetNewState: (id: string, newState: string) => void;
  innovationFlowTemplates: InnovationFlowTemplate[] | undefined;
  onSubmit: (formData: SelectInnovationFlowFormValuesType) => void;
}

const UpdateInnovationFlow: FC<EditLifecycleProps> = ({
  lifecycle,
  entityId,
  onSetNewState,
  innovationFlowTemplates,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [isSelectInnovationFlowDialogOpen, setSelectInnovationFlowDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const nextEvents = lifecycle?.nextEvents || [];

  const openSelectInnovationFlowDialog = useCallback(() => setSelectInnovationFlowDialogOpen(true), []);
  const closeSelectInnovationFlowDialog = useCallback(() => setSelectInnovationFlowDialogOpen(false), []);
  const openConfirmationDialog = useCallback(() => setConfirmationDialogOpen(true), []);
  const closeConfirmationDialog = useCallback(() => setConfirmationDialogOpen(false), []);

  const innovationFlowTemplate = innovationFlowTemplates?.find(
    template => lifecycle && lifecycle.templateName && template.definition.includes(lifecycle.templateName)
  );

  let wiredSubmit;

  const handleConfirmDialogSubmit = () => {
    wiredSubmit?.();
    closeConfirmationDialog();
    closeSelectInnovationFlowDialog();
  };

  const handleSelectInnovationFlowFormSubmit = useCallback(
    (values: SelectInnovationFlowFormValuesType) => {
      onSubmit(values);
    },
    [onSubmit]
  );

  const handleSelectInnovationFlowDialogSubmit = useCallback(() => {
    openConfirmationDialog();
  }, [openConfirmationDialog]);

  return (
    <>
      {innovationFlowTemplate?.profile.displayName && (
        <Typography variant="h5" color="black" fontWeight={600}>
          {`${t('components.update-innovation-flow.template-label.title')}: ${
            innovationFlowTemplate?.profile.displayName
          }`}
        </Typography>
      )}
      {lifecycle && <InnovationFlowVisualizer lifecycle={lifecycle} />}
      {nextEvents && (
        <>
          <Grid container>
            <Grid item xs>
              <Button
                variant="outlined"
                onClick={openSelectInnovationFlowDialog}
                sx={{ alignSelf: 'start', marginX: 1 }}
              >
                {t('buttons.change-template')}
              </Button>
            </Grid>
            {nextEvents.map((stateName, i) => (
              <Grid key={i} item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onSetNewState(entityId, stateName)}
                  sx={{ alignSelf: 'end', marginX: 0.5 }}
                >
                  {stateName}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <SelectInnovationFlowDialog
        isOpen={isSelectInnovationFlowDialogOpen}
        onClose={closeSelectInnovationFlowDialog}
        onSubmitForm={handleSelectInnovationFlowFormSubmit}
        wireSubmit={submit => (wiredSubmit = submit)}
        onSubmitDialog={handleSelectInnovationFlowDialogSubmit}
        innovationFlowTemplateID={innovationFlowTemplate?.id}
        innovationFlowTemplates={innovationFlowTemplates}
      />
      <InnovationFlowUpdateConfirmDialog
        isOpen={isConfirmationDialogOpen}
        onClose={closeConfirmationDialog}
        onSubmit={handleConfirmDialogSubmit}
      />
    </>
  );
};

export default UpdateInnovationFlow;
