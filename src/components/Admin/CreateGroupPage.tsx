import React, { FC, useState } from 'react';
import Typography from '../core/Typography';
import { Form, FormGroup } from 'react-bootstrap';
import Button from '../core/Button';
import { useCreateGroup } from '../../hooks/useCreateGroup';

interface Props {
  action: 'createEcoverseGroup' | 'createChallengeGroup' | 'createOpportunityGroup';
}

const CreateGroupPage: FC<Props> = ({ action }) => {
  const [name, setName] = useState<string>('');
  const handler = useCreateGroup();

  return (
    <div>
      <Typography as={'h3'} className={'mb-4'}>
        Create group
      </Typography>
      <FormGroup>
        <Form.Label>Name</Form.Label>
        <Form.Control
          as={'input'}
          type={'text'}
          placeholder={'Enter a group name'}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </FormGroup>
      <div className={'d-flex'}>
        <Button onClick={() => handler[action]()}>Create</Button>
      </div>
    </div>
  );
};

export default CreateGroupPage;
