import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Modal } from 'react-bootstrap';
import Grid from '@material-ui/core/Grid';
import {
  refetchOpportunityActorGroupsQuery,
  useCreateActorGroupMutation,
  useOpportunityProfileQuery,
} from '../../hooks/generated/graphql';
import { useEcoverse } from '../../hooks';
import { replaceAll } from '../../utils/replaceAll';
import Button from '../core/Button';
import { Loading } from '../core';
import { TextArea } from '../core/TextInput';

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
  availableActorGroupNames: string[];
}

const ActorGroupCreateModal: FC<P> = ({ onHide, show, opportunityId, availableActorGroupNames }) => {
  const { t } = useTranslation();
  const { ecoverseId } = useEcoverse();
  const [createActorGroup, { loading }] = useCreateActorGroupMutation({
    onCompleted: () => onHide(),
    refetchQueries: [refetchOpportunityActorGroupsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });
  const [name, setName] = useState<string>(availableActorGroupNames[0]);
  const [description, setDescription] = useState<string>('');
  const { data, loading: loadingOpportunity } = useOpportunityProfileQuery({
    variables: { ecoverseId, opportunityId },
  });
  const ecosystemModelId = data?.ecoverse?.opportunity?.context?.ecosystemModel?.id;
  const isFormValid = name && description && description.length >= 2 && description.length <= 380;

  const onDescriptionInput = ({ target: { value } }) => {
    if (value.length > 380) return;

    setDescription(value);
  };

  const onSubmit = () => {
    if (ecosystemModelId)
      createActorGroup({
        variables: {
          input: {
            ecosystemModelID: ecosystemModelId,
            name,
            description,
          },
        },
      }).then(() => {
        setName('');
        setDescription('');
      });
  };

  if (loadingOpportunity) return <Loading text={'Loading opportunity'} />;

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Actor group creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid container spacing={2}>
          <Grid item lg={12} className={'mb-4'}>
            <Form.Group controlId="aspectTypeSelect">
              <Form.Label>Name</Form.Label>
              <Form.Control
                as="select"
                custom
                onChange={e => {
                  e.preventDefault();
                  setName(e.target.value);
                }}
                size={'lg'}
                defaultValue={availableActorGroupNames[0]}
              >
                {availableActorGroupNames?.map((ag, index) => (
                  <option value={ag} key={index}>
                    {replaceAll('_', ' ', ag)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {/*<TextArea onChange={e => setName(e.target.value)} value={name} rows={2} label={'Name'} />*/}
          </Grid>
          <Grid item lg={12}>
            <TextArea onChange={onDescriptionInput} value={description} rows={2} label={'Description'} />
          </Grid>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        {loading ? (
          <Loading text={'Creating actor group'} />
        ) : (
          <Button onClick={onSubmit} variant={'primary'} disabled={!isFormValid} text={t('buttons.submit')} />
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ActorGroupCreateModal;
