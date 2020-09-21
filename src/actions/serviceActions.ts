import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { IRootState } from '../reducers';
import { updateProfile } from '../reducers/profile/actions';
import { apiConfig } from '../utils/authConfig';

export const getProfile = (id: string): ThunkAction<void, IRootState, unknown, Action<string>> => async (
  dispatch,
  getState
) => {
  try {
    const response = await fetch(`${apiConfig.resourceUri}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getState().auth.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response && response.status !== 404) {
      dispatch(updateProfile(response.json()));
    }
  } catch (e) {
    console.error(e);
  }
};

export default getProfile;
