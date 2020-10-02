import React, { FC, useState } from 'react';
import { Toast } from 'react-bootstrap';

export const Message: FC = () => {
  const [show, setShow] = useState(true);

  const closeMessage = () => {
    setShow(false);
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'relative',
        minHeight: '100px',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 10 }}>
        <Toast show={show} onClose={closeMessage}>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
            <strong className="mr-auto">Bootstrap</strong>
            <small>11 mins ago</small>
          </Toast.Header>
          <Toast.Body>Woohoo, you&apos;re reading this text in a Toast!</Toast.Body>
        </Toast>
      </div>
    </div>
  );
};
