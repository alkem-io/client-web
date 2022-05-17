import { HubEditFormValuesType } from '../components/Admin/HubEditForm';
import { ProfileFormValues } from '../components/composite/forms/ProfileForm';
import { ProfileFormValuesType } from '../components/composite/forms/ProfileFormWithContext';
import { formatDatabaseLocation } from '../domain/location/LocationUtils';
import {
  CreateContextInput,
  CreateReferenceInput,
  Reference,
  Location,
  UpdateContextInput,
  UpdateReferenceInput,
} from '../models/graphql-schema';

export interface ContextObject {
  background?: string;
  impact?: string;
  references?: Reference[];
  tagline?: string;
  location?: Pick<Location, 'city' | 'country'>;
  vision?: string;
  who?: string;
}

export const createContextInput = (obj: ContextObject): CreateContextInput => {
  const { background, impact, tagline, vision, who, references = [], location } = obj;

  return {
    background: background,
    impact: impact,
    references: references.map(toCreateReferenceInput),
    tagline: tagline,
    location: location,
    vision: vision,
    who: who,
  };
};

export const updateContextInput = (obj: ContextObject): UpdateContextInput => {
  const { background, impact, tagline, vision, who, references = [], location } = obj;

  return {
    background: background,
    impact: impact,
    references: references.map(toUpdateReferenceInput),
    tagline: tagline,
    location: location,
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
