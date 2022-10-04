import React, { FC, useCallback, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../../../models/graphql-schema';
import InnovationFlowVisualizer from './InnovationFlowVisualizer';
import SelectInnovationFlowDialog, {
  LifecycleTemplate,
  SelectInnovationFlowFormValuesType,
} from './SelectInnovationFlowDialog';

interface EditLifecycleProps {
  lifecycle: Lifecycle | undefined;
  id: string;
  onSetNewState: (id: string, newState: string) => void;
  innovationFlowTemplates: LifecycleTemplate[] | undefined;
  onSubmit: (formData: SelectInnovationFlowFormValuesType) => void;
}

const UpdateInnovationFlow: FC<EditLifecycleProps> = ({
  lifecycle,
  id,
  onSetNewState,
  innovationFlowTemplates,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [isSelectInnovationFlowDialogOpen, setSelectInnovationFlowDialogOpen] = useState(false);
  // const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const nextEvents = lifecycle?.nextEvents || [];

  const openSelectInnovationFlowDialog = useCallback(() => setSelectInnovationFlowDialogOpen(true), []);
  const closeSelectInnovationFlowDialog = useCallback(() => setSelectInnovationFlowDialogOpen(false), []);
  // const openConfirmationDialog = useCallback(() => setConfirmationDialogOpen(true), []);
  // const closeConfirmationDialog = useCallback(() => setConfirmationDialogOpen(false), []);

  const innovationFlowTemplate = innovationFlowTemplates?.find(
    template => lifecycle && lifecycle.templateName && template.definition.includes(lifecycle.templateName)
  );

  return (
    <>
      {lifecycle && <InnovationFlowVisualizer lifecycle={lifecycle} />}
      <Button variant="outlined" onClick={openSelectInnovationFlowDialog}>
        {t('buttons.change-template')}
      </Button>
      {nextEvents && (
        <Grid container spacing={1} justifyContent="flex-end">
          {nextEvents.map((stateName, i) => (
            <Grid item key={i}>
              <Button variant="contained" color="primary" onClick={() => onSetNewState(id, stateName)}>
                {stateName}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
      <SelectInnovationFlowDialog
        isOpen={isSelectInnovationFlowDialogOpen}
        onClose={closeSelectInnovationFlowDialog}
        onSubmit={onSubmit}
        innovationFlowTemplateID={innovationFlowTemplate?.id || ''}
        innovationFlowTemplates={innovationFlowTemplates}
      />
    </>
  );
};
export default UpdateInnovationFlow;
