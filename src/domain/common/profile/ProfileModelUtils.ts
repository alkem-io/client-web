import { CreateProfileInput, UpdateProfileInput } from '@/core/apollo/generated/graphql-schema';
import { ProfileModel } from './ProfileModel';
import { mapTagsetModelsToUpdateTagsetInputs } from '../tagset/TagsetUtils';
import { formatCreateLocationInput, formatUpdateLocationInput } from '../location/LocationUtils';
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
    location: formatUpdateLocationInput(profileModel.location),
  };
};

export const mapProfileModelToCreateProfileInput = (profileModel: ProfileModel | undefined): CreateProfileInput => {
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
    location: formatCreateLocationInput(profileModel.location),
  };
  return result;
};
