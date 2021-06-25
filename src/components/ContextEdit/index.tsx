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
import {
  Context,
  UpdateChallengeInput,
  UpdateOpportunityInput,
  UpdateReferenceInput,
} from '../../types/graphql-schema';
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
    const { name, nameID, references, background, impact, tagline, vision, who, visual } = values;

    const updateInput: UpdateOpportunityInput | UpdateChallengeInput = {
      ID: id,
      nameID: nameID,
      displayName: name,
      context: {
        background: background,
        impact: impact,
        tagline: tagline,
        vision: vision,
        who: who,
        visual: visual,
        references: references.map<UpdateReferenceInput>(ref => ({
          ID: ref.id,
          uri: ref.uri,
          name: ref.name,
          description: ref.description,
        })),
      },
    };

    if (variant === 'challenge') {
      await updateChallenge({
        variables: {
          input: updateInput,
        },
      });
    } else if (variant === 'opportunity') {
      await updateOpportunity({
        variables: {
          input: updateInput,
        },
      });
    } else {
      console.error('no handler found');
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
