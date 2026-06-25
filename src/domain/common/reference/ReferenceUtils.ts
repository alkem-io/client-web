import type { UpdateReferenceInput } from '@/core/apollo/generated/graphql-schema';
import type { ReferenceModel } from './ReferenceModel';

export const mapReferenceModelsToUpdateReferenceInputs = (
  references: Partial<ReferenceModel>[] | undefined
): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? reference.ID ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
};
