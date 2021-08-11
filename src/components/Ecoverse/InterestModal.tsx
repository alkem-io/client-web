import React, { FC, useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import { refetchOpportunityRelationsQuery, useCreateRelationMutation, useMeQuery } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { useEcoverse } from '../../hooks';
import Button from '../core/Button';
import { Loading } from '../core';
import TextInput, { TextArea } from '../core/TextInput';
import Typography from '../core/Typography';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
}

const InterestModal: FC<P> = ({ onHide, show, opportunityId }) => {
  const { t } = useTranslation();
  const { ecoverseId } = useEcoverse();
  const roles = ['Want to help build', 'Interested in your solution', 'Sharing knowledge / network', 'Other'];
  const { data: userData } = useMeQuery();
  const handleError = useApolloErrorHandler();

  const [createRelation, { data, loading }] = useCreateRelationMutation({
    onError: handleError,
    refetchQueries: [refetchOpportunityRelationsQuery({ ecoverseId, opportunityId })],
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
    if (value.length > 380) return;

    setDescription(value);
  };

  const onSubmit = () => {
    createRelation({
      variables: {
        input: {
          parentID: opportunityId,
          type: 'incoming',
          actorName: userData?.me.displayName || '',
          actorType: 'user',
          actorRole: customRole || role,
          description: description,
        },
      },
    });
  };

  return (
    <Dialog open={show} maxWidth="md" fullWidth aria-labelledby="interest-dialog-title">
      <DialogTitle id="interest-dialog-title">Describe your relation</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {data?.createRelation.id ? (
            <Grid item lg={12}>
              <Typography variant={'h3'} color={'positive'}>
                The request successfully sent
              </Typography>
            </Grid>
          ) : (
            <>
              <Grid item lg={12}>
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
              </Grid>
              <Grid item lg={12}>
                <TextArea onChange={onDescriptionInput} value={description} label={'Interest reason'} />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {data?.createRelation.id && <Button onClick={onHide} variant={'primary'} text={t('buttons.cancel')} />}
        {loading ? (
          <Loading text={'Sending the request...'} />
        ) : (
          !data?.createRelation.id && (
            <Button onClick={onSubmit} variant={'primary'} disabled={!isFormValid} text={t('buttons.submit')} />
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InterestModal;
