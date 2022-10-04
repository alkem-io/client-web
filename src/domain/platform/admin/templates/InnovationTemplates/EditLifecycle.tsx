import React, { FC, useCallback, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Lifecycle } from '../../../../../models/graphql-schema';
import LifecycleVisualizer from './LifecycleVisualizer';
import LifecycleButton from './LifecycleButton';
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

const EditLifecycle: FC<EditLifecycleProps> = ({ lifecycle, id, onSetNewState, innovationFlowTemplates, onSubmit }) => {
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
      {lifecycle && <LifecycleVisualizer lifecycle={lifecycle} />}
      <Button variant="outlined" onClick={openSelectInnovationFlowDialog}>
        {t('buttons.change-template')}
      </Button>
      {nextEvents && (
        <Grid container spacing={1} justifyContent="flex-end">
          {nextEvents.map((x, i) => (
            <Grid item key={i}>
              <LifecycleButton stateName={x} onClick={() => onSetNewState(id, x)} />
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
export default EditLifecycle;
