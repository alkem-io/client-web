import React, { ReactNode, useEffect, useMemo } from 'react';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import TemplatePreviewDialog, {
  TemplatePreviewDialogProps,
} from '../../../../template/templatePreviewDialog/TemplatePreviewDialog';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import { TemplateBase } from '../../../../collaboration/templates/CollaborationTemplatesLibrary/TemplateBase';

export interface ImportTemplatesDialogPreviewStepProps<T extends TemplateBase, V extends T> {
  onClose: () => void;
  template: T & Identifiable;
  getImportedTemplateContent?: (template: T) => void;
  importedTemplateContent?: V | undefined;
  actions?: ReactNode;
  templateType: TemplateType;
}

const ImportTemplatesDialogPreviewStep = <T extends TemplateBase, V extends T>({
  template,
  getImportedTemplateContent,
  importedTemplateContent,
  actions,
  onClose,
  templateType,
}: ImportTemplatesDialogPreviewStepProps<T, V>) => {
  const templateWithValue = useMemo(() => {
    const templateWithValue =
      templateType === TemplateType.WhiteboardTemplate
        ? {
            ...template,
            ...(importedTemplateContent as V),
          }
        : template;

    return templateWithValue as unknown as V;
  }, [template, templateType]);

  const templatePreview = useMemo(() => {
    if (!templateWithValue) {
      return undefined;
    }

    return {
      template: templateWithValue,
      templateType,
      // TODO make sure that templateType matches the actual type of the template
    } as TemplatePreviewDialogProps['templatePreview'];
  }, [templateWithValue]);

  useEffect(() => {
    if (templateType === TemplateType.WhiteboardTemplate && getImportedTemplateContent) {
      getImportedTemplateContent(template);
    }
  }, [template, templateType, getImportedTemplateContent]);

  return <TemplatePreviewDialog open templatePreview={templatePreview} actions={actions} onClose={onClose} />;
};

export default ImportTemplatesDialogPreviewStep;
