import React, { FC } from 'react';
import './FourOuFour.css';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export const FourOuFour: FC = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="error-template">
            <h1>Oops!</h1>
            <h2>404 Not Found</h2>
            <div className="error-details">Sorry, an error has occured, Requested page not found!</div>
            <div className="error-actions">
              <Link to="/">
                <Button>
                  <span className="glyphicon glyphicon-home" />
                  Take Me Home{' '}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
