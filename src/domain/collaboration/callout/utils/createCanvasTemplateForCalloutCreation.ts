import { CanvasTemplateWithValueFragment } from '../../../../core/apollo/generated/graphql-schema';

export const createCanvasTemplateForCalloutCreation = (canvasTemplate?: CanvasTemplateWithValueFragment) => {
  if (!canvasTemplate) {
    return undefined;
  }

  const calloutCanvasTemplate = {
    value: canvasTemplate.value,
    tags: canvasTemplate.profile.tagset?.tags ?? [],
    visualUri: canvasTemplate.profile.visual?.uri ?? '',
    profile: {
      description: canvasTemplate.profile.description,
      displayName: canvasTemplate.profile.displayName,
    },
  };

  return calloutCanvasTemplate;
};
