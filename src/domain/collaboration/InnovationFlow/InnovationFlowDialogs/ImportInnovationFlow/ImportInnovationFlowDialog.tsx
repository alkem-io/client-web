import { useTranslation } from 'react-i18next';
import ImportTemplatesDialog from '../../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialog';
import InnovationImportTemplateCard from '../../../../platform/admin/templates/InnovationTemplates/InnovationImportTemplateCard';

import { useSpaceInnovationFlowTemplatesQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { Button } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { TemplateType } from '../../../InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';

interface ImportInnovationFlowDialogProps {
  open: boolean;
  onClose?: () => void;
  handleImportTemplate: (templateId: string) => Promise<unknown>;
}

const ImportInnovationFlowDialog = ({ open, onClose, handleImportTemplate }: ImportInnovationFlowDialogProps) => {
  const { t } = useTranslation();
  const {
    spaceId,
    profile: { displayName: spaceDisplayName },
  } = useSpace();

  const { data: templatesData, loading: loadingTemplates } = useSpaceInnovationFlowTemplatesQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || !open,
  });

  const innovationPacks = [
    {
      profile: { id: '', displayName: spaceDisplayName },
      nameID: '',
      id: '',
      templates: templatesData?.lookup.space?.account.library?.innovationFlowTemplates ?? [],
    },
  ];

  return (
    <ImportTemplatesDialog
      headerText={t('templateLibrary.innovationFlowTemplates.title')}
      dialogSubtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
      templateImportCardComponent={InnovationImportTemplateCard}
      templateType={TemplateType.InnovationFlowTemplate}
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
