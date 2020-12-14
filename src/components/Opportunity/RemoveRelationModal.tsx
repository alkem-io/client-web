import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../core/Button';

interface RelationRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  name: string | undefined;
  onConfirm: () => void;
}

const RelationRemoveModal: FC<RelationRemoveModalProps> = ({ show, name, onCancel, onConfirm }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm remove</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to remove {name} from relations?</Modal.Body>
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

export default RelationRemoveModal;
