import React, { FC, useState } from 'react';
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
          Please copy the "Generated password". Once form is closed it will be lost forever.
          <InputWithCopy label="Generated Password" text={password} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Understood
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default PasswordPrompt;
