import { PreferenceType, PreferenceValueType } from '@/core/apollo/generated/graphql-schema';

export type PreferenceModel = {
  id: string;
  value: string;
  definition: {
    id: string;
    displayName: string;
    description: string;
    group: string;
    type: PreferenceType;
    valueType: PreferenceValueType;
  };
};
