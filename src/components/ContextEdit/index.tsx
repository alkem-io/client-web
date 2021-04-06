import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../core/Button';
import { ContextInput, useUpdateChallengeMutation, useUpdateOpportunityMutation } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';

import { QUERY_OPPORTUNITY_PROFILE } from '../../graphql/opportunity';
import { QUERY_CHALLENGE_PROFILE } from '../../graphql/challenge';
import ProfileForm from '../ProfileForm/ProfileForm';

interface Props {
  variant: 'challenge' | 'opportunity';
  show: boolean;
  onHide: () => void;
  data: ContextInput;
  id: string;
}

const useContextEditStyles = createStyles(() => ({
  body: {
    maxHeight: 600,
    overflow: 'auto',
  },
}));

const ContextEdit: FC<Props> = ({ show, onHide, variant, data, id }) => {
  const styles = useContextEditStyles();

  const [updateChallenge] = useUpdateChallengeMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_CHALLENGE_PROFILE, variables: { id } }],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity] = useUpdateOpportunityMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_PROFILE, variables: { id } }],
    awaitRefetchQueries: true,
  });

  let submitWired;

  const onSubmit = async values => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, textID, state, ...context } = values;

    const updatedRefs = context.references.map(ref => ({ uri: ref.uri, name: ref.name }));
    const contextWithUpdatedRefs = { ...context };
    const challengeUpdateData = { name, state: '', context: contextWithUpdatedRefs };
    contextWithUpdatedRefs.references = updatedRefs;

    if (variant === 'challenge') {
      await updateChallenge({
        variables: {
          challengeData: { ID: id, ...challengeUpdateData },
        },
      });
    } else if (variant === 'opportunity') {
      await updateOpportunity({
        variables: {
          opportunityData: {
            ID: id,
            context: {
              ...contextWithUpdatedRefs,
            },
          },
        },
      });
    } else {
      console.log('no handler found');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>Edit context</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <ProfileForm
          isEdit={true}
          contextOnly={true}
          context={data}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="negative" onClick={onHide} className={'mr-2'}>
          CANCEL
        </Button>
        <Button type={'submit'} variant="primary" onClick={() => submitWired()}>
          SAVE
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContextEdit;
