import { Box, OutlinedInput } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select/Select';
import { makeStyles } from '@mui/styles';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useHub } from '../../../../../hooks';
import {
  refetchOpportunityRelationsQuery,
  useCreateRelationMutation,
  useMeQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { Loading } from '../../../core';
import WrapperButton from '../../../core/WrapperButton';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import TextInput, { TextArea } from '../../../core/TextInput';
import WrapperTypography from '../../../core/WrapperTypography';

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 150,
  },
}));

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
  collaborationId: string | undefined;
}

const InterestModal: FC<P> = ({ onHide, show, opportunityId, collaborationId }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { hubNameId } = useHub();
  const roles = ['Want to help build', 'Interested in your solution', 'Sharing knowledge / network', 'Other'];
  const { data: userData } = useMeQuery();
  const handleError = useApolloErrorHandler();

  const [createRelation, { data, loading }] = useCreateRelationMutation({
    onError: handleError,
    refetchQueries: [refetchOpportunityRelationsQuery({ hubId: hubNameId, opportunityId })],
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
    if (!collaborationId) {
      return;
    }

    createRelation({
      variables: {
        input: {
          collaborationID: collaborationId,
          type: 'incoming',
          actorName: userData?.me.displayName || '',
          actorType: 'user',
          actorRole: customRole || role,
          description: description,
        },
      },
    });
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setRole(event.target.value as string);
  };

  return (
    <Dialog open={show} maxWidth="md" fullWidth aria-labelledby="interest-dialog-title">
      <DialogTitle id="interest-dialog-title" onClose={onHide}>
        Describe your relation
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {data?.createRelationOnCollaboration.id ? (
            <Grid item lg={12}>
              <WrapperTypography variant={'h3'} color={'positive'}>
                The request successfully sent
              </WrapperTypography>
            </Grid>
          ) : (
            <>
              <Grid item lg={12}>
                <Box marginBottom={2}>
                  <WrapperTypography variant={'h5'}>Type of collaboration</WrapperTypography>
                </Box>
                <FormControl variant="outlined" className={styles.formControl}>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={role}
                    label={role}
                    onChange={handleRoleChange}
                    input={<OutlinedInput notched label={'Role'} />}
                  >
                    {roles.map(r => (
                      <MenuItem value={r} onClick={() => setRole(r)} key={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {role === roles[3] && (
                  <Box marginBottom={4}>
                    <TextInput
                      onChange={e => setCustomRole(e.target.value)}
                      value={customRole}
                      label={'Describe your role'}
                      max={380}
                    />
                  </Box>
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
        {data?.createRelationOnCollaboration.id && (
          <WrapperButton onClick={onHide} variant={'primary'} text={t('buttons.close')} />
        )}
        {loading ? (
          <Loading text={'Sending the request...'} />
        ) : (
          !data?.createRelationOnCollaboration.id && (
            <WrapperButton onClick={onSubmit} variant={'primary'} disabled={!isFormValid} text={t('buttons.submit')} />
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InterestModal;
