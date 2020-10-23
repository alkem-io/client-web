import { AuthError } from '@azure/msal-browser';
import { ReactComponent as XCircleFill } from 'bootstrap-icons/icons/x-circle-fill.svg';
import React, { FC } from 'react';
import { Badge, Toast } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { clearError } from '../reducers/error/actions';
import { ErrorBoundary } from './ErrorBoundary';

export const ErrorHandler: FC = ({ children }) => {
  const error = useTypedSelector<Error | AuthError | undefined>(state => {
    return state.error.errors[0];
  });

  const count = useTypedSelector<number>(state => state.error.errors.length);

  const dispatch = useDispatch();

  const closeMessage = (): void => {
    dispatch(clearError());
  };

  const show = !!error;
  const message = error?.message || (error as AuthError)?.errorMessage;

  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'relative',
          minHeight: '0px',
          zIndex: 999,
        }}
      >
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <Toast show={show} onClose={closeMessage}>
            <Toast.Header>
              <XCircleFill className="bi bi-alert-triangle text-danger mr-2" height="20" width="20" />
              <strong className="mr-auto">
                Error <Badge variant="light">{count}</Badge>
              </strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </div>
      </div>
      <ErrorBoundary>{children}</ErrorBoundary>
    </>
  );
};
