import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from './Button';
import { useTranslation } from 'react-i18next';

interface RelationRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  text: string;
  onConfirm: () => void;
  title?: string;
}

const RemoveModal: FC<RelationRemoveModalProps> = ({ show, text, onCancel, title = 'Confirm remove', onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{text}</Modal.Body>
      <Modal.Footer>
        <Button small onClick={onCancel} text={t('buttons.cancel')} />
        <Button small variant={'negative'} onClick={onConfirm} text={t('buttons.remove')} />
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveModal;
