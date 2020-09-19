
const initialState = {
  account: null,
  error: null,
  idToken: null,
  accessToken: null,
  isAuthenticated: false,
};

export interface IAction {
  type: string;
}

export default (state = initialState, action: IAction) => {
  switch (action.type) {
    default:
      return state
  }
}