import React, { FC, useState } from 'react';
import { Col, Modal } from 'react-bootstrap';
import Button from '../core/Button';
import { TextArea } from '../core/TextInput';
import { useCreateActorGroupMutation } from '../../generated/graphql';
import { QUERY_OPPORTUNITY_ACTOR_GROUPS } from '../../graphql/opportunity';
import Loading from '../core/Loading';

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
}

const ActorGroupCreateModal: FC<P> = ({ onHide, show, opportunityId }) => {
  const [createActorGroup, { loading }] = useCreateActorGroupMutation({
    onCompleted: () => onHide(),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const isFormValid = name && description && description.length >= 2 && description.length <= 380;

  const onDescriptionInput = ({ target: { value } }) => {
    if (value.length > 380) return;

    setDescription(value);
  };

  const onSubmit = () => {
    createActorGroup({
      variables: {
        opportunityID: Number(opportunityId),
        actorGroupData: {
          name: name,
          description: description,
        },
      },
    }).then(() => {
      setName('');
      setDescription('');
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Actor group creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <>
          <Col lg={12} className={'mb-4'}>
            <TextArea onChange={e => setName(e.target.value)} value={name} rows={2} label={'Name'} />
          </Col>
          <Col lg={12}>
            <TextArea onChange={onDescriptionInput} value={description} rows={2} label={'Description'} />
          </Col>
        </>
      </Modal.Body>
      <Modal.Footer>
        {loading ? (
          <Loading text={'Sending the request...'} />
        ) : (
          <Button onClick={onSubmit} variant={'primary'} disabled={!isFormValid}>
            Submit
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ActorGroupCreateModal;
