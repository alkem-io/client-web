import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Select from '@material-ui/core/Select/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { refetchOpportunityRelationsQuery, useCreateRelationMutation, useMeQuery } from '../../hooks/generated/graphql';
import { createStyles, useApolloErrorHandler } from '../../hooks';
import { useEcoverse } from '../../hooks';
import Button from '../core/Button';
import { Loading } from '../core';
import TextInput, { TextArea } from '../core/TextInput';
import Typography from '../core/Typography';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';

const useStyles = createStyles(() => ({
  formControl: {
    minWidth: 150,
  },
}));

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
}

const InterestModal: FC<P> = ({ onHide, show, opportunityId }) => {
  const { t } = useTranslation();
  const styles = useStyles();
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

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRole(event.target.value as string);
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
                <FormControl variant="outlined" className={styles.formControl}>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={role}
                    label={role}
                    onChange={handleRoleChange}
                  >
                    {roles.map(r => (
                      <MenuItem value={r} onClick={() => setRole(r)} key={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
