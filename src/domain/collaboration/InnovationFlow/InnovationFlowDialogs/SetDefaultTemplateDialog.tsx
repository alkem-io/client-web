import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { useNotification } from '@/core/ui/notifications/useNotification';

interface SetDefaultTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string | null) => Promise<unknown>;
  currentTemplate?: {
    id: string;
    profile: {
      displayName: string;
    };
  } | null;
}

const SetDefaultTemplateDialog = ({
  open,
  onClose,
  onSelectTemplate,
  currentTemplate,
}: SetDefaultTemplateDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSelectTemplate = async (template: AnyTemplate) => {
    // If same template selected, do nothing (just close preview)
    if (template.id === currentTemplate?.id) {
      return; // Preview dialog will close, main dialog stays open
    }

    setLoading(true);
    try {
      await onSelectTemplate(template.id);
      // Don't close main dialog - let user see the selection
    } catch (e) {
      if (e instanceof Error) {
        notify(t('components.innovationFlowSettings.defaultTemplate.errors.selectFailed'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTemplate = async () => {
    setLoading(true);
    try {
      await onSelectTemplate(null);
    } catch (e) {
      if (e instanceof Error) {
        notify(t('components.innovationFlowSettings.defaultTemplate.errors.removeFailed'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImportTemplatesDialog
      open={open}
      onClose={onClose}
      templateType={TemplateType.Callout}
      enablePlatformTemplates
      onSelectTemplate={handleSelectTemplate}
      selectedTemplateId={currentTemplate?.id}
      onRemoveTemplate={currentTemplate ? handleRemoveTemplate : undefined}
      removeTemplateLoading={loading}
    />
  );
};

export default SetDefaultTemplateDialog;
