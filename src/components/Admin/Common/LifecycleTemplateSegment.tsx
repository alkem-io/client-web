import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { SafeLifecycleVisualizer } from '../../../domain/admin/templates/InnovationTemplates/SafeLifecycleVisualizer';
import FormikSelect, { FormikSelectValue } from '../../composite/forms/FormikSelect';

interface LifecycleTemplateSegmentProps {
  lifecycleTemplateOptions: FormikSelectValue[];
  definition: string;
  required: boolean;
}

export const LifecycleTemplateSegment: FC<LifecycleTemplateSegmentProps> = ({
  lifecycleTemplateOptions,
  definition,
  required,
}) => {
  return (
    <Grid item xs={12}>
      <FormikSelect
        name="innovationFlowTemplateID"
        values={lifecycleTemplateOptions}
        title="Select template"
        required={required}
      />
      {definition !== '' && <SafeLifecycleVisualizer definition={definition} />}
    </Grid>
  );
};
