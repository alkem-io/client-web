import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import {
  refetchOpportunityActorGroupsQuery,
  useCreateActorGroupMutation,
  useOpportunityProfileQuery,
} from '../../hooks/generated/graphql';
import { useEcoverse } from '../../hooks';
import { replaceAll } from '../../utils/replaceAll';
import Button from '../core/Button';
import { Loading } from '../core';
import { TextArea } from '../core/TextInput';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@material-ui/core';

interface P {
  onHide: () => void;
  show: boolean;
  opportunityId: string;
  availableActorGroupNames: string[];
}

const ActorGroupCreateModal: FC<P> = ({ onHide, show, opportunityId, availableActorGroupNames }) => {
  const { t } = useTranslation();
  const { ecoverseId } = useEcoverse();
  const [createActorGroup, { loading }] = useCreateActorGroupMutation({
    onCompleted: () => onHide(),
    refetchQueries: [refetchOpportunityActorGroupsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });
  const [name, setName] = useState<string>(availableActorGroupNames[0]);
  const [description, setDescription] = useState<string>('');
  const { data, loading: loadingOpportunity } = useOpportunityProfileQuery({
    variables: { ecoverseId, opportunityId },
  });
  const ecosystemModelId = data?.ecoverse?.opportunity?.context?.ecosystemModel?.id;
  const isFormValid = name && description && description.length >= 2 && description.length <= 380;

  const onDescriptionInput = ({ target: { value } }) => {
    if (value.length > 380) return;

    setDescription(value);
  };

  const onSubmit = () => {
    if (ecosystemModelId)
      createActorGroup({
        variables: {
          input: {
            ecosystemModelID: ecosystemModelId,
            name,
            description,
          },
        },
      }).then(() => {
        setName('');
        setDescription('');
      });
  };

  if (loadingOpportunity) return <Loading text={'Loading opportunity'} />;

  return (
    <Dialog open={show} maxWidth="md" aria-labelledby="actor-group-dialog-title">
      <DialogTitle id="actor-group-dialog-title" onClose={onHide}>
        Actor group creation
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item lg={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel shrink={true}>{'Name'}</InputLabel>
              <Select
                value={name}
                label={'Name'}
                onChange={e => {
                  e.preventDefault();
                  setName(e.target.value as string);
                }}
                defaultValue={availableActorGroupNames[0]}
                input={<OutlinedInput notched label={'Name'} />}
              >
                {availableActorGroupNames.map((el, i) => (
                  <MenuItem key={i} value={el}>
                    {replaceAll('_', ' ', el)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item lg={12}>
            <TextArea onChange={onDescriptionInput} value={description} rows={2} label={'Description'} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {loading ? (
          <Loading text={'Creating actor group'} />
        ) : (
          <Button onClick={onSubmit} variant={'primary'} disabled={!isFormValid} text={t('buttons.submit')} />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ActorGroupCreateModal;
