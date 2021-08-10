import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../core/Button';
import { Loading } from '../../core';
import { useTranslation } from 'react-i18next';

interface UserRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  name: string | undefined;
  loading?: boolean;
}

const UserRemoveModal: FC<UserRemoveModalProps> = ({ show, onCancel, onConfirm, name, loading = false }) => {
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm user remove</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to remove {name || 'user'}?</Modal.Body>
      <Modal.Footer>
        {loading ? (
          <Loading text={'Loading ...'} />
        ) : (
          <>
            <Button small onClick={onCancel} disabled={loading} text={t('buttons.cancel')} />
            <Button small variant={'negative'} onClick={onConfirm} disabled={loading} text={t('buttons.remove')} />
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default UserRemoveModal;
