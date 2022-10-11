import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <FormikSelect
        name="innovationFlowTemplateID"
        values={innovationFlowTemplateOptions}
        required={required}
        helpText={t('components.innovation-flow-template-segment.help-text.title')}
      />
      {definition !== '' && <SafeInnovationFlowVisualizer definition={definition} />}
    </Grid>
  );
};
