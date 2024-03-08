import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InnovationFlowVisualizer from '../../templates/InnovationTemplates/InnovationFlowVisualizer';
import FormikSelect, { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import { Caption } from '../../../../../core/ui/typography';
import { InnovationFlowTemplate } from '../../templates/InnovationTemplates/SelectInnovationFlowDialog';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import Gutters from '../../../../../core/ui/grid/Gutters';

interface InnovationFlowTemplateSegmentProps {
  innovationFlowTemplateOptions: FormikSelectValue[];
  selectedInnovationFlow?: InnovationFlowTemplate;
  required: boolean;
}

export const InnovationFlowTemplateSegment: FC<InnovationFlowTemplateSegmentProps> = ({
  innovationFlowTemplateOptions,
  selectedInnovationFlow,
  required,
}) => {
  const { t } = useTranslation();

  return (
    <Gutters>
      <FormikSelect
        name="innovationFlowTemplateID"
        values={innovationFlowTemplateOptions}
        required={required}
        helpText={t('components.innovation-flow-template-segment.help-text.title')}
      />
      <PageContentBlock>
        <Caption>Preview: {selectedInnovationFlow?.profile.displayName}</Caption>
        <InnovationFlowVisualizer states={selectedInnovationFlow?.states} />
      </PageContentBlock>
    </Gutters>
  );
};
