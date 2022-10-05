import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { SafeInnovationFlowVisualizer } from '../../templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import FormikSelect, { FormikSelectValue } from '../../../../../common/components/composite/forms/FormikSelect';

interface InnovationFlowTemplateSegmentProps {
  innovationFlowTemplateOptions: FormikSelectValue[];
  definition: string | undefined;
  required: boolean;
}

export const InnovationFlowTemplateSegment: FC<InnovationFlowTemplateSegmentProps> = ({
  innovationFlowTemplateOptions,
  definition = '',
  required,
}) => {
  return (
    <Grid item xs={12}>
      <FormikSelect
        name="innovationFlowTemplateID"
        values={innovationFlowTemplateOptions}
        title="Select template"
        required={required}
      />
      {definition !== '' && <SafeInnovationFlowVisualizer definition={definition} />}
    </Grid>
  );
};
