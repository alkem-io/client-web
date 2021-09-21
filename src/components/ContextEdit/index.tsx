import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import {
  refetchChallengeProfileQuery,
  refetchOpportunityProfileQuery,
  useUpdateChallengeMutation,
  useUpdateOpportunityMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { useEcoverse } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import {
  Context,
  UpdateChallengeInput,
  UpdateOpportunityInput,
  UpdateReferenceInput,
} from '../../models/graphql-schema';
import Button from '../core/Button';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';
import { logger } from '../../services/logging/winston/logger';

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
  const { t } = useTranslation();
  const { ecoverseNameId } = useEcoverse();
  const styles = useContextEditStyles();
  const handleError = useApolloErrorHandler();

  const [updateChallenge] = useUpdateChallengeMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [
      refetchChallengeProfileQuery({
        ecoverseId: ecoverseNameId,
        challengeId: id,
      }),
    ],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity] = useUpdateOpportunityMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [
      refetchOpportunityProfileQuery({
        ecoverseId: ecoverseNameId,
        opportunityId: id,
      }),
    ],
    awaitRefetchQueries: true,
  });

  let submitWired;

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { references, background, impact, tagline, vision, who, visual } = values;

    const updateInput: UpdateOpportunityInput | UpdateChallengeInput = {
      ID: id,
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
      // This should not happen. It is for development purposes
      logger.error('no handler found');
    }
  };

  return (
    <Dialog open={show} maxWidth="lg" fullWidth aria-labelledby="context-edit-dialog-title">
      <DialogTitle id="context-edit-dialog-title" onClose={onHide}>
        Edit context
      </DialogTitle>
      <DialogContent dividers className={styles.body}>
        <ProfileForm
          isEdit={true}
          contextOnly={true}
          context={data}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
        />
      </DialogContent>
      <DialogActions>
        <Button type={'submit'} variant="primary" onClick={() => submitWired()} text={t('buttons.save')} />
      </DialogActions>
    </Dialog>
  );
};

export default ContextEdit;
