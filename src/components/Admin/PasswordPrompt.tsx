import React, { FC } from 'react';
import Modal from 'react-bootstrap/esm/Modal';
import Button from '../core/Button';
import InputWithCopy from './InputWithCopy';

interface PasswordPromptProps {
  password: string;
  show: boolean;
  onClose: () => void;
}

export const PasswordPrompt: FC<PasswordPromptProps> = ({ password, show, onClose }) => {
  const handleClose = () => onClose && onClose();

  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Store password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please copy this password. It is used for your first log in. Once this page is closed the password will be
          lost forever.
          <InputWithCopy label="Generated Password" text={password} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            I understand
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default PasswordPrompt;
