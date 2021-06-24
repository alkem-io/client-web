import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import {
  refetchChallengeProfileQuery,
  refetchOpportunityProfileQuery,
  useUpdateChallengeMutation,
  useUpdateOpportunityMutation,
} from '../../generated/graphql';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useEcoverse } from '../../hooks/useEcoverse';
import { createStyles } from '../../hooks/useTheme';
import { Context, UpdateChallengeInput, UpdateContextInput, UpdateReferenceInput } from '../../types/graphql-schema';
import Button from '../core/Button';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';

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
  const { ecoverseId } = useEcoverse();
  const styles = useContextEditStyles();
  const handleError = useApolloErrorHandler();

  const [updateChallenge] = useUpdateChallengeMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [refetchChallengeProfileQuery({ ecoverseId, challengeId: id })],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity] = useUpdateOpportunityMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [refetchOpportunityProfileQuery({ ecoverseId, opportunityId: id })],
    awaitRefetchQueries: true,
  });

  let submitWired;

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, ...context } = values;

    const { references, ...restContext } = context;
    const updatedRefs = context.references.map<UpdateReferenceInput>(ref => ({
      ID: ref.id,
      uri: ref.uri,
      name: ref.name,
      description: ref.description,
    }));

    const contextWithUpdatedRefs: UpdateContextInput = { ...restContext, references: updatedRefs };
    const challengeUpdateData: UpdateChallengeInput = { ID: id, context: contextWithUpdatedRefs };

    if (variant === 'challenge') {
      await updateChallenge({
        variables: {
          input: challengeUpdateData,
        },
      });
    } else if (variant === 'opportunity') {
      await updateOpportunity({
        variables: {
          input: {
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
