import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../core/Button';

interface RelationRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  text: string;
  onConfirm: () => void;
}

const RemoveModal: FC<RelationRemoveModalProps> = ({ show, text, onCancel, onConfirm }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm remove</Modal.Title>
      </Modal.Header>
      <Modal.Body>{text}</Modal.Body>
      <Modal.Footer>
        <Button small onClick={onCancel}>
          Cancel
        </Button>
        <Button small variant={'negative'} onClick={onConfirm}>
          Remove
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveModal;
