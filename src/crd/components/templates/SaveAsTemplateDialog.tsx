/**
 * SaveAsTemplateDialog — there is no separate dialog component.
 *
 * "Save X as a template" is `TemplateFormDialog` opened in `intent: 'create'` with a `value`
 * pre-filled from the source entity (a callout / the current community guidelines / a subspace).
 * The integration-layer hook `src/main/crdPages/templates/useSaveAsTemplate.ts` builds the
 * pre-filled value, assembles the `perTypeFormSlot`, and renders `<TemplateFormDialog ... />`.
 *
 * This file just re-exports `TemplateFormDialog` under the documented name so consumers/tasks that
 * reference `SaveAsTemplateDialog` resolve to the same component.
 */
export { TemplateFormDialog as SaveAsTemplateDialog } from './TemplateFormDialog';
