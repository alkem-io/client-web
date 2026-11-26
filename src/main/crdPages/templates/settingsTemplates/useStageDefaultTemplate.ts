import { useSettingsSetStageTemplateDefaultMutation } from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';

const STAGE_SLOT = 'stage';

export type StageDefaultTemplate = { id: string; displayName: string } | null;

export type UseStageDefaultTemplateArgs = {
  /** The space owning the stages: the scope of their `stage` default bindings. */
  spaceId: string;
  /** Called after a successful set / clear with the stage's resulting default (null = none). */
  onTemplateSaved: (stageId: string, template: StageDefaultTemplate) => void;
};

/**
 * Sets or clears a stage's default post template (templates-screens "set / clear phase default post template" →
 * `setTemplateDefault(scope, "stage", stage, template)`; a null template clears only that stage's default,
 * surface.graphql:618-619). A failed write is shown through the error handler and leaves the column unchanged.
 */
export function useStageDefaultTemplate({ spaceId, onTemplateSaved }: UseStageDefaultTemplateArgs) {
  const handleError = useApolloErrorHandler();
  const [setTemplateDefault] = useSettingsSetStageTemplateDefaultMutation({ onError: handleError });

  return async (stageId: string, templateId: string | null): Promise<void> => {
    const { data } = await setTemplateDefault({
      variables: { scope: spaceId, stage: stageId, template: templateId },
    });
    if (!data) return;
    const binding = data.setTemplateDefault.find(entry => entry.slot === STAGE_SLOT && entry.stage?.id === stageId);
    const template = binding?.template;
    onTemplateSaved(stageId, template ? { id: template.id, displayName: template.about.displayName } : null);
  };
}
