import React from 'react';
import ReactDOM from 'react-dom';
import Root from './root';
// import './styles/index.scss';
import { env } from './env';

let indexPage = <Root />;

if (!env) {
  indexPage = (
    <div className="container ">
      <div className="row justify-content-md-center">
        <h2>Configuration is missing!</h2>
      </div>
      <div className="row justify-content-md-center">
        <p>
          <a href="https://github.com/cherrytwist/Client.Web#configuration" target="#">
            More information!
          </a>
        </p>
      </div>
    </div>
  );
}

ReactDOM.render(indexPage, document.getElementById('root'));
