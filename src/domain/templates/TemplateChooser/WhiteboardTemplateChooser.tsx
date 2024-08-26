import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
// import { Caption, CardText } from '../../../../../core/ui/typography/components';
import { Box, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormikWhiteboardPreview from '../../platform/admin/templates/WhiteboardTemplates/FormikWhiteboardPreview';
import EmptyWhiteboard from '../../common/whiteboard/EmptyWhiteboard';
import WhiteboardTemplatesLibrary from '../library/WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { gutters } from '../../../core/ui/grid/utils';
import { WhiteboardTemplateWithContent } from '../cards/WhiteboardTemplateCard/WhiteboardTemplateWithContent';
import CollaborationTemplatesLibraryButton from '../library/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryButton';

interface WhiteboardTemplatesChooserProps {
  name: string;
}

export const WhiteboardTemplatesChooser: FC<WhiteboardTemplatesChooserProps> = ({ name }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [, , helpers] = useField<String>(name);
  const handleResetWhiteboardTemplate = () => {
    helpers.setValue(JSON.stringify(EmptyWhiteboard));
  };

  const handleChange = (newContent: string) => {
    helpers.setValue(newContent);
  };

  const handleSelectTemplate = (template: WhiteboardTemplateWithContent) => {
    helpers.setValue(template.content);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        {/* <Box>
          <Caption>
            {t('components.callout-creation.template-step.whiteboard-template-label')}
            <CardText display="inline" marginLeft={1}>
              {field.value.profile.displayName}
            </CardText>
          </Caption>
        </Box> */}
        <Box sx={{ marginLeft: 'auto' }}>
          <Button onClick={handleResetWhiteboardTemplate} startIcon={<RestartAltIcon />}>
            {t('components.callout-creation.template-step.whiteboard-reset-template')}
          </Button>
          <CollaborationTemplatesLibraryButton onClick={() => setIsOpen(true)} />
          <WhiteboardTemplatesLibrary
            open={isOpen}
            onClose={() => setIsOpen(false)}
            onImportTemplate={handleSelectTemplate}
          />
        </Box>
      </Box>
      <FormikWhiteboardPreview
        name={`${name}`}
        canEdit
        onChangeContent={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('templateLibrary.whiteboardTemplates.editTemplateButton') }}
      />
    </>
  );
};

export default WhiteboardTemplatesChooser;
