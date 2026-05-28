import {
  useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation,
  useSetDefaultCalloutTemplateOnInnovationFlowStateMutation,
  useUpdateTemplateDefaultMutation,
} from '@/core/apollo/generated/apollo-hooks';

export type UseSetDefaultTemplateResult = {
  /** True while any of the mutations below is in flight. */
  saving: boolean;
  /**
   * Set the Space's default for a per-type `TemplateDefault` (e.g. the default subspace/content template).
   * The default must reference a template in the holder's set. (Clearing a `TemplateDefault` is not supported by
   * `updateTemplateDefault` — `templateID` is required server-side.)
   */
  setTemplateDefault: (args: { templateDefaultId: string; templateId: string }) => Promise<unknown>;
  /** Set (or, with `templateId === null`, clear) an innovation-flow state's default callout template. */
  setFlowStateDefaultCallout: (args: { flowStateId: string; templateId: string | null }) => Promise<unknown>;
};

/**
 * Thin wrapper over the "set a template as a default" mutations:
 * - `updateTemplateDefault` — the holder's per-type defaults (the default subspace/content template).
 * - `setDefaultCalloutTemplateOnInnovationFlowState` / `removeDefaultCalloutTemplateOnInnovationFlowState` —
 *   an innovation-flow state's default callout template.
 *
 * `refetchQueries` (query names) are forwarded to all three mutations so the consumer can refresh whatever
 * surfaces the current default (e.g. `'SpaceTemplatesManager'`, the Layout-tab query).
 */
export function useSetDefaultTemplate(refetchQueries?: string[]): UseSetDefaultTemplateResult {
  const [updateTemplateDefault, { loading: updatingDefault }] = useUpdateTemplateDefaultMutation({ refetchQueries });
  const [setFlowStateDefault, { loading: settingFlowStateDefault }] =
    useSetDefaultCalloutTemplateOnInnovationFlowStateMutation({ refetchQueries });
  const [removeFlowStateDefault, { loading: removingFlowStateDefault }] =
    useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation({ refetchQueries });

  return {
    saving: updatingDefault || settingFlowStateDefault || removingFlowStateDefault,
    setTemplateDefault: ({ templateDefaultId, templateId }) =>
      updateTemplateDefault({ variables: { templateDefaultID: templateDefaultId, templateID: templateId } }),
    setFlowStateDefaultCallout: ({ flowStateId, templateId }) =>
      templateId === null
        ? removeFlowStateDefault({ variables: { flowStateId } })
        : setFlowStateDefault({ variables: { flowStateId, templateId } }),
  };
}
