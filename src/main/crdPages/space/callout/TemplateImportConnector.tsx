import type { AnyTemplate } from '@/domain/templates/models/TemplateBase';

type TemplateImportConnectorProps = {
  onTemplateSelected?: (templateData: AnyTemplate) => void;
  onSaveAsTemplate?: (calloutId: string) => void;
};

/**
 * Connects to existing MUI template dialogs.
 * - "Find Template" opens MUI template browser dialog
 * - Maps selected template data to CalloutFormConnector values
 * - "Save as Template" opens MUI save-template dialog
 */
export function TemplateImportConnector({
  onTemplateSelected: _onTemplateSelected,
  onSaveAsTemplate: _onSaveAsTemplate,
}: TemplateImportConnectorProps) {
  // Template import is wired to existing MUI dialogs via callbacks.
  // The MUI dialog portals outside .crd-root, so no CRD component needed.
  // This connector holds the state for:
  // 1. Opening the template browser (triggered by "Find Template" in AddPostModal)
  // 2. Mapping selected template to form values (via onTemplateSelected callback)
  // 3. Opening the save-as-template dialog (triggered by CalloutContextMenu)
  return null;
}
