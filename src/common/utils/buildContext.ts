import {
  CreateContextInput,
  CreateReferenceInput,
  Reference,
  Location,
  UpdateContextInput,
  UpdateReferenceInput,
} from '../../core/apollo/generated/graphql-schema';

interface ContextObject {
  impact?: string;
  vision?: string;
  who?: string;
}

export const createContextInput = (obj: ContextObject): CreateContextInput => {
  const { impact, vision, who } = obj;

  return {
    impact: impact,
    vision: vision,
    who: who,
  };
};

export const updateContextInput = (obj: ContextObject): UpdateContextInput => {
  const { impact, vision, who } = obj;

  return {
    impact: impact,
    vision: vision,
    who: who,
  };
};

const toUpdateReferenceInput = (ref: Reference): UpdateReferenceInput => ({
  ID: ref.id,
  description: ref.description,
  name: ref.name,
  uri: ref.uri || '',
});

const toCreateReferenceInput = (ref: Reference): CreateReferenceInput => ({
  description: ref.description,
  name: ref.name,
  uri: ref.uri,
});
