import { useTranslation } from 'react-i18next';
import ImportTemplatesDialog from '../../../../templates/_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { useSpaceInnovationFlowTemplatesQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { Button } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import InnovationImportTemplateCard from '../../../../templates/admin/InnovationTemplates/InnovationImportTemplateCard';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';

interface ImportInnovationFlowDialogProps {
  open: boolean;
  templatesSetId: string | undefined;
  originDisplayName?: string; // TODO: I have removed this from the parents, should add it back at some point, it's the root space name //!!
  onClose?: () => void;
  handleImportTemplate: (templateId: string) => Promise<unknown>;
}

/**
 * @deprecated Maybe use directly ImportTemplatesDialog
 * //!!
 * //!! Careful I think this component is meant to import from the Space IF templates, not from the global templates
 */
const ImportInnovationFlowDialog = ({
  open,
  templatesSetId,
  originDisplayName,
  onClose,
  handleImportTemplate,
}: ImportInnovationFlowDialogProps) => {
  const { t } = useTranslation();


  return (
    <ImportTemplatesDialog
      headerText={t('templateLibrary.innovationFlowTemplates.title')}
      subtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
      templateType={TemplateType.InnovationFlow}
      open={open}
      onClose={onClose}
      onSelectTemplate={template => handleImportTemplate(template.id)}
      actionButton={
        <Button startIcon={<SystemUpdateAltIcon />} variant="contained" sx={{ marginLeft: theme => theme.spacing(1) }}>
          {t('buttons.use')}
        </Button>
      }
    />
  );
};

export default ImportInnovationFlowDialog;
