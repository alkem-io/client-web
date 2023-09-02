import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Caption, CardText } from '../../../../../core/ui/typography/components';
import { Box, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormikWhiteboardPreview from '../../../../platform/admin/templates/WhiteboardTemplates/FormikWhiteboardPreview';
import EmptyWhiteboard from '../../../../common/whiteboard/EmptyWhiteboard';
import WhiteboardTemplatesLibrary from '../../../whiteboard/WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { WhiteboardTemplateWithContent } from '../../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplate';
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
      content: JSON.stringify(EmptyWhiteboard),
    });
  };

  const handleChange = (newContent: string) => {
    helpers.setValue({
      profile: {
        displayName: t('components.callout-creation.custom-template'),
      },
      content: newContent,
    });
  };

  const handleSelectTemplate = (template: WhiteboardTemplateWithContent) => {
    helpers.setValue({
      profile: { displayName: template.displayName },
      content: template.content,
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>
            {t('components.callout-creation.template-step.whiteboard-template-label')}
            <CardText display="inline" marginLeft={1}>
              {field.value.profile.displayName}
            </CardText>
          </Caption>
        </Box>
        <Box sx={{ marginLeft: 'auto' }}>
          <Button onClick={handleResetWhiteboardTemplate} startIcon={<RestartAltIcon />}>
            {t('components.callout-creation.template-step.whiteboard-reset-template')}
          </Button>
          <WhiteboardTemplatesLibrary onSelectTemplate={handleSelectTemplate} />
        </Box>
      </Box>
      <FormikWhiteboardPreview
        name={`${name}.value`}
        canEdit
        onChangeContent={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('whiteboard-templates.edit-template-button') }}
      />
    </>
  );
};

export default WhiteboardTemplatesChooser;
