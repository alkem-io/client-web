import { UpdateReferenceInput, UpdateTagsetInput } from '../../../../../../core/apollo/generated/graphql-schema';

interface TemplateTagsets {
  id?: string;
  name?: string;
  tags?: string[];
}

export const mapTagsetsToUpdateTagsets = (tagsets: TemplateTagsets[] | undefined): UpdateTagsetInput[] | undefined => {
  return tagsets?.map(tagset => ({
    ID: tagset.id ?? '',
    tags: tagset.tags ?? []
  }));
}

interface TemplateReferences {
  id?: string;
  name?: string;
  uri?: string;
  description?: string;
}

export const mapReferencesToUpdateReferences = (references: TemplateReferences[] | undefined): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
}