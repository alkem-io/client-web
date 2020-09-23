import { ProfileActionTypes, UPDATE_PROFILE } from './types';

export const updateProfile = (payload: any): ProfileActionTypes => {
  return {
    type: UPDATE_PROFILE,
    payload,
  };
};

export default updateProfile;
