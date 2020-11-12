import { AuthError } from '@azure/msal-browser';
import { ReactComponent as XCircleFill } from 'bootstrap-icons/icons/x-circle-fill.svg';
import React, { FC } from 'react';
import { Badge, Toast } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { clearError } from '../reducers/error/actions';

export const ErrorHandler: FC = () => {
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
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
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
      {/* <ErrorBoundary>{children}</ErrorBoundary> */}
    </>
  );
};
