import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Button, Jumbotron, Nav, Navbar } from 'react-bootstrap';
import './App.css';

export interface AppProps {
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  account: any;
  error: Error | undefined;
  signIn: () => Promise<void>;
  updateAccount: (account: any) => void;
  updateError: (error: Error) => void;
}

const App: React.FC<AppProps> = (props: AppProps): React.ReactElement => {
  const { isAuthenticated } = props;
  const handleSignIn = () => {
    props.signIn().then(() => {
      if (props.account) {
        console.log(props);
        props.updateAccount(props.account);
      } else if (props.error) {
        props.updateError(props.error);
      } else {
        props.updateError(new Error('Sign-in failed. Please try again.'));
      }
    });
  };

  const handleSignOut = () => {
    props.signOut().then(() => {
      if (!props.account) {
        props.updateAccount(null);
      } else if (props.error) {
        props.updateError(props.error);
      } else {
        props.updateError(new Error('Sign-out failed. Please try again.'));
      }
    });
  };

  return (
    <div className="App">
      <Navbar className="navbar" bg="dark" variant="dark">
        <Navbar.Brand href="/">Cherry Twist</Navbar.Brand>
        <Nav className="mr-auto" />
        {isAuthenticated ? (
          <Button variant="info" onClick={handleSignOut}>
            Logout
          </Button>
        ) : (
          <Button variant="outline-info" onClick={handleSignIn}>
            Login
          </Button>
        )}
        <Jumbotron className="welcome">
          <h1>Azure AD On-Behalf-Of Flow</h1>
          <p>
            A React & Redux single-page application authorizing an ASP.NET Core Web API to call MS Graph API on its
            behalf using the MS Graph SDK.
          </p>
          <Button
            variant="primary"
            onClick={() =>
              window.open(
                'https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow',
                '_blank'
              )
            }
          >
            Learn More
          </Button>
        </Jumbotron>
      </Navbar>
      {/* <EcoverseProfile />
      <ChallengeList handleIdChange={handleIdChange}/>
      <ChallengeProfile id={id} /> */}
    </div>
  );
};

export default App;
