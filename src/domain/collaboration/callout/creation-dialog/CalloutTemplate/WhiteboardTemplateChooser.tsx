import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Caption, CardText } from '../../../../../core/ui/typography/components';
import { Box, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormikWhiteboardPreview from '../../../../platform/admin/templates/WhiteboardTemplates/FormikWhiteboardPreview';
import EmptyWhiteboard from '../../../../../common/components/composite/entities/Canvas/EmptyWhiteboard';
import WhiteboardTemplatesLibrary from '../../../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { WhiteboardTemplateWithValue } from '../../../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplate';
import { WhiteboardTemplateFormSubmittedValues } from '../../../../platform/admin/templates/WhiteboardTemplates/WhiteboardTemplateForm';
import { gutters } from '../../../../../core/ui/grid/utils';

interface WhiteboardTemplatesChooserProps {
  name: string;
}

export const WhiteboardTemplatesChooser: FC<WhiteboardTemplatesChooserProps> = ({ name }) => {
  const { t } = useTranslation();
  const [field, , helpers] = useField<WhiteboardTemplateFormSubmittedValues>(name);
  const handleResetWhiteboardTemplate = () => {
    helpers.setValue({
      profile: {
        displayName: t('components.callout-creation.template-step.whiteboard-empty-template'),
      },
      value: JSON.stringify(EmptyWhiteboard),
    });
  };

  const handleChange = (newValue: string) => {
    helpers.setValue({
      profile: {
        displayName: t('components.callout-creation.template-step.whiteboard-custom-template'),
      },
      value: newValue,
    });
  };

  const handleSelectTemplate = (template: WhiteboardTemplateWithValue) => {
    helpers.setValue({
      profile: { displayName: template.displayName },
      value: template.value,
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Caption>
          {t('components.callout-creation.template-step.whiteboard-template-label')}
          <CardText display="inline" marginLeft={1}>
            {field.value.profile.displayName}
          </CardText>
        </Caption>
        <Button onClick={handleResetWhiteboardTemplate} sx={{ marginLeft: 'auto' }} startIcon={<RestartAltIcon />}>
          {t('components.callout-creation.template-step.whiteboard-reset-template')}
        </Button>
        <WhiteboardTemplatesLibrary onSelectTemplate={handleSelectTemplate} />
      </Box>
      <FormikWhiteboardPreview name={`${name}.value`} canEdit onChangeValue={handleChange} maxHeight={gutters(12)} />
    </>
  );
};

export default WhiteboardTemplatesChooser;
