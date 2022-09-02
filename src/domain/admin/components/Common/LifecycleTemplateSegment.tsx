import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { SafeLifecycleVisualizer } from '../../templates/InnovationTemplates/SafeLifecycleVisualizer';
import FormikSelect, { FormikSelectValue } from '../../../../common/components/composite/forms/FormikSelect';

interface LifecycleTemplateSegmentProps {
  innovationFlowTemplateOptions: FormikSelectValue[];
  definition: string;
  required: boolean;
}

export const LifecycleTemplateSegment: FC<LifecycleTemplateSegmentProps> = ({
  innovationFlowTemplateOptions,
  definition,
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
      {definition !== '' && <SafeLifecycleVisualizer definition={definition} />}
    </Grid>
  );
};
