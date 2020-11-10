export const UPDATE_PROFILE = 'UPDATE_PROFILE';

export interface UpdateProfileAction {
  type: typeof UPDATE_PROFILE;
  payload: ProfileState;
}

export interface ProfileState {
  id: string | null;
  userPrincipalName: string | null;
  givenName: string | null;
  surname: string | null;
  jobTitle: string | null;
  mobilePhone: string | null;
  preferredLanguage: string | null;
  firstLogin: boolean;
}

export type ProfileActionTypes = UpdateProfileAction;
