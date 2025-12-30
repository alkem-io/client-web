import { CreateProfileInput, TagsetReservedName, UpdateProfileInput } from '@/core/apollo/generated/graphql-schema';
import { ProfileModel } from './ProfileModel';
import { mapTagsetModelsToUpdateTagsetInputs } from '../tagset/TagsetUtils';
import { formatLocationInput } from '../location/LocationUtils';
import { mapReferenceModelsToUpdateReferenceInputs } from '../reference/ReferenceUtils';

type ProfileModelWithoutId = {
  [K in keyof ProfileModel as K extends 'id' ? never : K]: ProfileModel[K];
};

export const mapProfileModelToUpdateProfileInput = (
  profileModel: ProfileModelWithoutId | undefined
): UpdateProfileInput => {
  if (!profileModel) {
    return {
      displayName: '',
      description: '',
      tagline: '',
      references: undefined,
      tagsets: undefined,
      location: undefined,
    };
  }

  return {
    displayName: profileModel.displayName,
    description: profileModel.description,
    tagline: profileModel.tagline,
    references: mapReferenceModelsToUpdateReferenceInputs(profileModel.references),
    tagsets: mapTagsetModelsToUpdateTagsetInputs(profileModel.tagsets),
    location: formatLocationInput(profileModel.location),
  };
};

export const mapProfileModelToCreateProfileInput = (
  profileModel: Omit<ProfileModel, 'id'> | undefined
): CreateProfileInput => {
  if (!profileModel)
    return {
      displayName: '',
      description: '',
      tagline: '',
      referencesData: undefined,
      location: undefined,
    };
  const result: CreateProfileInput = {
    displayName: profileModel.displayName,
    description: profileModel.description,
    tagline: profileModel.tagline,
    referencesData: profileModel.references,
    location: formatLocationInput(profileModel.location),
  };
  return result;
};

export const mapProfileTagsToCreateTags = (profileModel: Pick<ProfileModel, 'tagsets'>): string[] | undefined => {
  if (!profileModel || !profileModel.tagsets || profileModel.tagsets.length === 0) {
    return undefined;
  }

  if (profileModel.tagsets.length === 1) {
    return profileModel.tagsets[0].tags;
  }

  return profileModel.tagsets.find(tagset => tagset.name === TagsetReservedName.Default)?.tags;
};
