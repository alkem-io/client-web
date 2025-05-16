import { UpdateReferenceInput } from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from './ReferenceModel';

export const mapReferenceModelsToUpdateReferenceInputs = (
  references: ReferenceModel[] | undefined
): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
};
