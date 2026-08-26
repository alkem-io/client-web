import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleMatrixCallback } from './matrixCallback';

const MatrixCallbackHandler = () => {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // Inside the silent-SSO iframe the parent page never navigated away, so
    // there is nothing to restore — the parent detects success via storage.
    const framed = window.self !== window.top;

    handleMatrixCallback(undefined, framed ? undefined : path => navigate(path, { replace: true }))
      .then(outcome => {
        if (!outcome.ok && !framed) {
          navigate('/', { replace: true });
        }
      })
      .catch(() => {
        if (!framed) {
          navigate('/', { replace: true });
        }
      });
  }, [navigate]);

  return null;
};

export default MatrixCallbackHandler;
