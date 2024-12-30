import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import { CalloutGroupNameValuesMap } from '../../calloutsSet/CalloutsInContext/CalloutsGroup';

export const getCalloutGroupNameValue = (tags: string[] | undefined): CalloutGroupName => {
  if (!tags) return CalloutGroupName.Knowledge;
  const displaLocationValue = tags[0];

  for (const [key, value] of Object.entries(CalloutGroupNameValuesMap)) {
    if (value === displaLocationValue) return CalloutGroupName[key];
  }

  return CalloutGroupName.Knowledge;
};
