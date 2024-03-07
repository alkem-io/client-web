import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InnovationFlowVisualizer from '../../templates/InnovationTemplates/InnovationFlowVisualizer';
import FormikSelect, { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';

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
      {false && <InnovationFlowVisualizer states={states} />}
    </Grid>
  );
};
