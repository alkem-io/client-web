import { act } from 'react-dom/test-utils';
import { ProfileActionTypes, ProfileState, UPDATE_PROFILE } from './types';

const initialState: ProfileState = {
  id: null,
  userPrincipalName: null,
  givenName: null,
  surname: null,
  jobTitle: null,
  mobilePhone: null,
  preferredLanguage: null,
  firstLogin: true,
};

export default function profileReducer(state = initialState, action: ProfileActionTypes): ProfileState {
  switch (action.type) {
    case UPDATE_PROFILE:
      return {
        ...state,
        id: action.payload.id,
        userPrincipalName: action.payload.userPrincipalName,
        givenName: action.payload.givenName,
        surname: action.payload.surname,
        jobTitle: action.payload.jobTitle,
        mobilePhone: action.payload.mobilePhone,
        preferredLanguage: action.payload.preferredLanguage,
        firstLogin: false,
      }
    default:
      return state;
  }
}