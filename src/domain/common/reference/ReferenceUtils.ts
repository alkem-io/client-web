import { UpdateReferenceInput } from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from './ReferenceModel';

export const mapReferenceModelsToUpdateReferenceInputs = (
  references: Partial<ReferenceModel>[] | undefined
): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
};

export const mapReferenceModelToReferenceFormValues = (reference: ReferenceModel) => {
  // TODO: This `as` shouldn't be here
  return {
    name: reference.name,
    description: reference.description,
    uri: reference.uri,
  } as ReferenceModel;
};
