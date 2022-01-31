import {
  CreateContextInput,
  CreateReferenceInput,
  Reference,
  UpdateContextInput,
  UpdateReferenceInput,
} from '../models/graphql-schema';

interface ContextObject {
  background?: string;
  impact?: string;
  references?: Reference[];
  tagline?: string;
  vision?: string;
  who?: string;
}

export const createContextInput = (obj: ContextObject): CreateContextInput => {
  const { background, impact, tagline, vision, who, references = [] } = obj;

  return {
    background: background,
    impact: impact,
    references: references.map(toCreateReferenceInput),
    tagline: tagline,
    vision: vision,
    who: who,
  };
};

export const updateContextInput = (obj: ContextObject): UpdateContextInput => {
  const { background, impact, tagline, vision, who, references = [] } = obj;

  return {
    background: background,
    impact: impact,
    references: references.map(toUpdateReferenceInput),
    tagline: tagline,
    vision: vision,
    who: who,
  };
};

const toUpdateReferenceInput = (ref: Reference): UpdateReferenceInput => ({
  ID: ref.id,
  description: ref.description,
  name: ref.name,
  uri: ref.uri,
});

const toCreateReferenceInput = (ref: Reference): CreateReferenceInput => ({
  description: ref.description,
  name: ref.name,
  uri: ref.uri,
});
