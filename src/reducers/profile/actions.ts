/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ProfileActionTypes, UPDATE_PROFILE } from './types';

export const updateProfile = (payload: any): ProfileActionTypes => {
  return {
    type: UPDATE_PROFILE,
    payload,
  };
};

export default updateProfile;
