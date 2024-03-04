import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeInnovationFlowVisualizer } from '../../templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import FormikSelect, { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';

interface InnovationFlowTemplateSegmentProps {
  innovationFlowTemplateOptions: FormikSelectValue[];
  states: InnovationFlowState[];
  required: boolean;
}

export const InnovationFlowTemplateSegment: FC<InnovationFlowTemplateSegmentProps> = ({
  innovationFlowTemplateOptions,
  states = [],
  required,
}) => {
  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <FormikSelect
        name="innovationFlowTemplateID"
        values={innovationFlowTemplateOptions}
        required={required}
        helpText={t('components.innovation-flow-template-segment.help-text.title')}
      />
      {false && <SafeInnovationFlowVisualizer states={states} />}
    </Grid>
  );
};
