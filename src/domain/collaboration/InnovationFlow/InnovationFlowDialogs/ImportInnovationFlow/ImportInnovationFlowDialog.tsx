import { useTranslation } from 'react-i18next';
import ImportTemplatesDialog from '../../../../platform/admin/InnovationPacks/ImportTemplatesDialog';
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

const ImportInnovationFlowDialog = ({
  open,
  templatesSetId,
  originDisplayName,
  onClose,
  handleImportTemplate,
}: ImportInnovationFlowDialogProps) => {
  const { t } = useTranslation();

  const { data: templatesData, loading: loadingTemplates } = useSpaceInnovationFlowTemplatesQuery({
    variables: {
      templatesSetId: templatesSetId!,
    },
    skip: !templatesSetId || !open,
  });

  const innovationPacks = [
    {
      profile: { id: '', displayName: originDisplayName ?? '' },
      nameID: '',
      id: '',
      templates: templatesData?.lookup.templatesSet?.innovationFlowTemplates ?? [],
    },
  ];

  return (
    <ImportTemplatesDialog
      headerText={t('templateLibrary.innovationFlowTemplates.title')}
      dialogSubtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
      templateImportCardComponent={InnovationImportTemplateCard}
      templateType={TemplateType.InnovationFlow}
      open={open}
      onClose={onClose}
      onImportTemplate={template => handleImportTemplate(template.id)}
      innovationPacks={innovationPacks}
      loading={loadingTemplates}
      actionButton={
        <Button startIcon={<SystemUpdateAltIcon />} variant="contained" sx={{ marginLeft: theme => theme.spacing(1) }}>
          {t('buttons.use')}
        </Button>
      }
    />
  );
};

export default ImportInnovationFlowDialog;
