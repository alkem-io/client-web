import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button } from '@mui/material';
import { useField } from 'formik';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import type { Identifiable } from '@/core/utils/Identifiable';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import { useSpace } from '@/domain/space/context/useSpace';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import TemplateActionButton from '../Buttons/TemplateActionButton';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';

interface WhiteboardTemplatesSelectorProps {
  name: string;
}

export const WhiteboardTemplateSelector: FC<WhiteboardTemplatesSelectorProps> = ({ name }) => {
  const { t } = useTranslation();
  const {
    space: { accountId },
  } = useSpace();
  const [, , helpers] = useField<string>(name);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleResetWhiteboardTemplate = () => {
    helpers.setValue(JSON.stringify(EmptyWhiteboard));
  };

  const handleChange = (newContent: string) => {
    helpers.setValue(newContent);
  };

  const [getTemplateContent] = useTemplateContentLazyQuery();
  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    const { data } = await getTemplateContent({ variables: { templateId, includeWhiteboard: true } });
    if (data?.lookup.template?.whiteboard?.content) {
      helpers.setValue(data?.lookup.template?.whiteboard?.content);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box sx={{ marginLeft: 'auto' }}>
          <Button onClick={handleResetWhiteboardTemplate} startIcon={<RestartAltIcon />}>
            {t('components.callout-creation.template-step.whiteboard-reset-template')}
          </Button>
          <Button onClick={() => setDialogOpen(true)} startIcon={<LibraryIcon />}>
            {t('buttons.find-template')}
          </Button>
          <ImportTemplatesDialog
            templateType={TemplateType.Whiteboard}
            accountId={accountId}
            actionButton={() => <TemplateActionButton />}
            open={isDialogOpen}
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setDialogOpen(false)}
            enablePlatformTemplates={true}
          />
        </Box>
      </Box>
      <FormikWhiteboardPreview
        name={`${name}`}
        canEdit={true}
        onChangeContent={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('templateLibrary.whiteboardTemplates.editTemplateButton') }}
      />
    </>
  );
};

export default WhiteboardTemplateSelector;
