import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutDisplayLocationValuesMap } from '../CalloutsInContext/CalloutsGroup';

export const getCalloutDisplayLocationValue = (tags: string[] | undefined): CalloutDisplayLocation => {
  if (!tags) return CalloutDisplayLocation.Knowledge;
  const displaLocationValue = tags[0];

  for (const [key, value] of Object.entries(CalloutDisplayLocationValuesMap)) {
    if (value === displaLocationValue) return CalloutDisplayLocation[key];
  }

  return CalloutDisplayLocation.Knowledge;
};
