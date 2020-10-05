import React, { FC } from 'react';
import { Toast } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ReactComponent as XCircleFill } from 'bootstrap-icons/icons/x-circle-fill.svg';
import { RootState } from '../reducers';
import { clearError } from '../reducers/error/actions';
import { ErrorBoundary } from './ErrorBoundary';

export const ErrorHandler: FC = ({ children }) => {
  const error = useSelector<RootState, Error | undefined>(state => {
    return state.error.errors[0];
  });

  const dispatch = useDispatch();

  const closeMessage = () => {
    dispatch(clearError());
  };

  const show = !!error;

  const message = error?.message;

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
              <strong className="mr-auto">Error</strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </div>
      </div>
      <ErrorBoundary>{children}</ErrorBoundary>
    </>
  );
};
