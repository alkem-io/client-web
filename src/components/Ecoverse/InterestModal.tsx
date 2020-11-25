import React, { FC, useState } from 'react';
import { Col, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Button from '../core/Button';
import TextInput, { TextArea } from '../core/TextInput';
import Typography from '../core/Typography';
import { useCreateRelationMutation, useUserProfileQuery } from '../../generated/graphql';
import { QUERY_RELATIONS_LIST } from '../../graphql/opportunity';
import Loading from '../core/Loading';

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
}

const InterestModal: FC<P> = ({ onHide, show, opportunityId }) => {
  const roles = ['Want to help build', 'Interested in your solution', 'Sharing knowledge / network', 'Other'];
  const { data: userData } = useUserProfileQuery();

  const [createRelation, { data, loading }] = useCreateRelationMutation({
    onError: error => console.log(error),
    refetchQueries: [{ query: QUERY_RELATIONS_LIST, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });
  const [description, setDescription] = useState<string>('');
  const [role, setRole] = useState<string>(roles[0]);
  const [customRole, setCustomRole] = useState<string>('');
  const isFormValid =
    role === roles[3]
      ? customRole && customRole.length >= 2
      : description && description.length >= 2 && description.length <= 380;

  const onDescriptionInput = ({ target: { value } }) => {
    console.log(value.length);
    if (value.length > 380) return;

    setDescription(value);
  };

  const onSubmit = () => {
    createRelation({
      variables: {
        opportunityId: Number(opportunityId),
        relationData: {
          type: 'incoming',
          actorName: userData?.me.name,
          actorType: 'user',
          actorRole: customRole || role,
          description: description,
        },
      },
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Describe your relation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {data?.createRelation.id ? (
          <Col lg={12}>
            <Typography variant={'h3'} color={'positive'}>
              The request successfully sent
            </Typography>
          </Col>
        ) : (
          <>
            <Col lg={12}>
              <Typography variant={'h5'} className={'mb-2'}>
                Type of collaboration
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
                  max={380}
                />
              )}
            </Col>
            <Col lg={12}>
              <TextArea onChange={onDescriptionInput} value={description} label={'Interest reason'} />
            </Col>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {data?.createRelation.id && (
          <Button onClick={onHide} variant={'primary'}>
            Close
          </Button>
        )}
        {loading ? (
          <Loading text={'Sending the request...'} />
        ) : (
          !data?.createRelation.id && (
            <Button onClick={onSubmit} variant={'primary'} disabled={!isFormValid}>
              Submit
            </Button>
          )
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default InterestModal;
