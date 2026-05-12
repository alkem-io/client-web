import type { ReferenceRow, TemplateFormValues } from '@/crd/components/templates/types';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { type UseTemplateFormsResult, useTemplateForms } from './useTemplateForms';

/**
 * The source entity a "save X as a template" flow is launched from.
 * - `communityGuidelines` — the current community guidelines (a new flow vs. legacy, which only *applies* a guidelines template)
 * - `subspace` — a subspace, captured as a Space template (`createTemplateFromSpace` with the subspace as the source)
 * - `callout` — an existing callout, captured as a Callout template (the caller maps it to CRD callout-form values)
 */
export type SaveAsTemplateSource =
  | { kind: 'communityGuidelines'; title: string; bodyMarkdown: string; references: ReferenceRow[] }
  | { kind: 'subspace'; subspaceId: string; name: string; description?: string; tags?: string[] }
  | {
      kind: 'callout';
      name: string;
      description?: string;
      tags?: string[];
      /** CRD callout-form values pre-filled from the source callout (built by the caller). */
      calloutBody: Partial<CalloutFormValues>;
    };

export type UseSaveAsTemplateResult = {
  /** `TemplateFormDialog` props — the consumer renders `<TemplateFormDialog {...form} />`. */
  form: UseTemplateFormsResult;
  /** Open the (pre-filled) Create Template dialog from a source entity. The consumer should first guard against
   *  the source having unsaved changes (e.g. via a `ConfirmationDialog`) — this hook doesn't. */
  openSaveAs: (source: SaveAsTemplateSource) => void;
};

function toSaveAsValues(source: Exclude<SaveAsTemplateSource, { kind: 'callout' }>): TemplateFormValues {
  switch (source.kind) {
    case 'communityGuidelines':
      return {
        type: 'communityGuidelines',
        name: source.title || 'Community guidelines',
        description: '',
        tags: [],
        title: source.title,
        guidelinesMarkdown: source.bodyMarkdown,
        references: source.references,
      };
    case 'subspace':
      return {
        type: 'space',
        name: source.name,
        description: source.description ?? '',
        tags: source.tags ?? [],
        recursive: true,
        sourceSpaceId: source.subspaceId,
      };
  }
}

/**
 * "Save X as a template" — opens `TemplateFormDialog` in create mode with values pre-filled from the source entity,
 * and routes the submit through the matching create mutation (delegated to `useTemplateForms`). One hook instance per
 * host (callout-settings menu, the community-guidelines editor, the Subspaces tab).
 */
export function useSaveAsTemplate(args: {
  templatesSetId: string | undefined;
  /** Parent space id — threaded into the Callout template form. */
  spaceId?: string;
  onSaved?: () => void;
}): UseSaveAsTemplateResult {
  const form = useTemplateForms({ templatesSetId: args.templatesSetId, spaceId: args.spaceId, onSaved: args.onSaved });
  return {
    form,
    openSaveAs: source => {
      if (source.kind === 'callout') {
        form.openCreateCallout({
          common: { name: source.name, description: source.description ?? '', tags: source.tags ?? [] },
          body: source.calloutBody,
        });
        return;
      }
      form.openCreatePrefilled(toSaveAsValues(source));
    },
  };
}
