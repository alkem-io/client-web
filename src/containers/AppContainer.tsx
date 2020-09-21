/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import App from '../components/App/App';
// import AuthProvider from '../utils/authProvider';

// import { updateAccount, updateError, updateToken } from '../actions/updateActions';

const AppContainer = (props: any) => {
  return (
    <div>
      <App {...props} />
    </div>
  );
};

// const mapStateToProps = state => state;

// const mapDispatchToProps = dispatch => ({
//   updateAccount: account => {
//     dispatch(updateAccount(account));
//   },
//   updateError: error => {
//     dispatch(updateError(error));
//   },
//   updateToken: token => {
//     dispatch(updateToken(token));
//   },
// });

// // AppContainer is a container component wrapped by HOC AuthProvider
// export default connect(mapStateToProps, mapDispatchToProps)(AuthProvider(AppContainer));
// export default AuthProvider(AppContainer);
export default AppContainer;
