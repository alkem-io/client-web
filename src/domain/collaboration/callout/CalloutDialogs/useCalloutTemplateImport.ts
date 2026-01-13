import { useState, useEffect } from 'react';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import { CalloutFormSubmittedValues, isEmptyCalloutForm } from '../CalloutForm/CalloutFormModel';
import { CalloutRestrictions } from '../CalloutRestrictionsTypes';
import { mapCalloutTemplateToCalloutForm } from '../models/mappings';

interface UseCalloutTemplateImportProps {
  calloutRestrictions?: CalloutRestrictions;
  defaultTemplateId?: string | null;
  dialogOpen?: boolean;
}

export const useCalloutTemplateImport = ({
  calloutRestrictions,
  defaultTemplateId,
  dialogOpen,
}: UseCalloutTemplateImportProps = {}) => {
  const [templateSelected, setTemplateSelected] = useState<CalloutFormSubmittedValues | undefined>(undefined);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [fetchTemplateContent] = useTemplateContentLazyQuery();

  const handleSelectTemplate = async ({ id: templateId }: Identifiable) => {
    const { data } = await fetchTemplateContent({
      variables: {
        templateId,
        includeCallout: true,
      },
    });

    const template = data?.lookup.template;
    const templateCallout = template?.callout;
    setTemplateSelected(mapCalloutTemplateToCalloutForm(templateCallout, calloutRestrictions));
    if (!template || !templateCallout) {
      throw new Error("Couldn't load CalloutTemplate");
    }

    setImportDialogOpen(false);
  };

  const handleImportClick = (currentFormData?: CalloutFormSubmittedValues) => {
    if (isEmptyCalloutForm(currentFormData)) {
      setImportDialogOpen(true);
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const clearTemplate = () => {
    setTemplateSelected(undefined);
  };

  const closeDialogs = () => {
    setImportDialogOpen(false);
    setConfirmDialogOpen(false);
  };

  // Auto-load default template when dialog opens, clear when it closes
  useEffect(() => {
    if (!dialogOpen) {
      // Clear template when closing
      setTemplateSelected(undefined);
    } else if (defaultTemplateId) {
      // Auto-load when opening
      handleSelectTemplate({ id: defaultTemplateId });
    }
  }, [dialogOpen, defaultTemplateId]);

  return {
    templateSelected,
    importDialogOpen,
    confirmDialogOpen,
    setImportDialogOpen,
    setConfirmDialogOpen,
    handleSelectTemplate,
    handleImportClick,
    clearTemplate,
    closeDialogs,
  };
};
