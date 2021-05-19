import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import { ChallengeProfileDocument, useUpdateChallengeMutation } from '../../generated/graphql';
import { Context } from '../../types/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import Button from '../core/Button';
import ProfileForm from '../ProfileForm/ProfileForm';

interface Props {
  variant: 'challenge' | 'opportunity';
  show: boolean;
  onHide: () => void;
  data: Context;
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
    refetchQueries: [{ query: ChallengeProfileDocument, variables: { id } }],
    awaitRefetchQueries: true,
  });

  let submitWired;

  const onSubmit = async values => {
    const { name, textID, state, ...context } = values;

    const updatedRefs = context.references.map(ref => ({ uri: ref.uri, name: ref.name }));
    const contextWithUpdatedRefs = { ...context };
    const challengeUpdateData = { name, state: '', context: contextWithUpdatedRefs };
    contextWithUpdatedRefs.references = updatedRefs;

    if (variant === 'challenge') {
      await updateChallenge({
        variables: {
          input: { ID: id, ...challengeUpdateData },
        },
      });
    } else if (variant === 'opportunity') {
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
