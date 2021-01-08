import React, { FC, useMemo, useState } from 'react';
import Typography from '../../core/Typography';
import { Form, FormGroup } from 'react-bootstrap';
import Button from '../../core/Button';
import { useCreateGroup } from '../../../hooks/useCreateGroup';
import { useParams } from 'react-router-dom';
import { PageProps } from '../../../pages';
import { useUpdateNavigation } from '../../../hooks/useNavigation';

interface Props extends PageProps {
  action:
    | 'updateGroup'
    | 'createEcoverseGroup'
    | 'createChallengeGroup'
    | 'createOpportunityGroup'
    | 'createOrganizationGroup';
}

interface Params {
  challengeId: string;
  opportunityId: string;
  organizationId: string;
}

const CreateGroupPage: FC<Props> = ({ action, paths }) => {
  const [name, setName] = useState<string>('');
  const { challengeId, opportunityId, organizationId } = useParams<Params>();

  const handler = useCreateGroup(name, organizationId || opportunityId || challengeId);

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const pageVariant = action === 'updateGroup' ? 'Edit' : 'Create';

  return (
    <>
      <Typography variant={'h3'} className={'mb-4'}>
        {pageVariant} group
      </Typography>
      <FormGroup>
        <Form.Label>Name</Form.Label>
        <Form.Control
          as={'input'}
          type={'text'}
          placeholder={'Enter a name'}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </FormGroup>
      <div className={'d-flex'}>
        <Button className={'ml-auto'} onClick={() => handler[action]()}>
          {pageVariant}
        </Button>
      </div>
    </>
  );
};

export default CreateGroupPage;
