import React, { FC, useState } from 'react';
import { Col, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Button from '../core/Button';
import TextInput, { TextArea } from '../core/TextInput';
import Typography from '../core/Typography';

interface P {
  onHide: () => void;
  onSubmit: () => void;
  show: boolean;
}

const InterestModal: FC<P> = ({ onHide, onSubmit, show }) => {
  const roles = ['contributor', 'collaborator', 'potential customer', 'other'];

  const [description, setDescription] = useState<string>('');
  const [role, setRole] = useState<string>(roles[0]);
  const [customRole, setCustomRole] = useState<string>('');
  const isFormValid = role === roles[3] ? customRole && customRole.length > 5 : description && description.length > 5;

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col lg={12}>
          <Typography variant={'h5'} className={'mb-2'}>
            Choose your role
          </Typography>
          <DropdownButton title={role} variant={'info'} className={'mb-4'}>
            {roles.map(r => (
              <Dropdown.Item onClick={() => setRole(r)} key={r}>
                <Typography>{r}</Typography>
              </Dropdown.Item>
            ))}
          </DropdownButton>
          {role === roles[3] && (
            <TextInput
              onChange={e => setCustomRole(e.target.value)}
              value={customRole}
              label={'Describe your role'}
              className={'mb-4'}
            />
          )}
        </Col>
        <Col lg={12}>
          <TextArea onChange={e => setDescription(e.target.value)} value={description} label={'Interest reason'} />
        </Col>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onSubmit} variant={'primary'} disabled={!isFormValid}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterestModal;
