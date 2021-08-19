import { Grid } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Path } from '../../context/NavigationProvider';
import { useApolloErrorHandler, useNotification, useUpdateNavigation } from '../../hooks';
import {
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../hooks/generated/graphql';
import { createContextInput, updateContextInput } from '../../utils/buildContext';
import Button from '../core/Button';
import Typography from '../core/Typography';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';
import FormMode from './FormMode';

interface Params {
  ecoverseId?: string;
  challengeId?: string;
  opportunityId?: string;
}

interface Props {
  mode: FormMode;
  paths: Path[];
  title: string;
  challengeId: string;
}

const EditOpportunity: FC<Props> = ({ paths, mode, title, challengeId }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const onSuccess = (message: string) => notify(message, 'success');

  const {
    ecoverseId = '',
    opportunityId: opportunityNameId = '',
    challengeId: challengeNameId = '',
  } = useParams<Params>();

  const [createOpportunity, { loading: isCreating }] = useCreateOpportunityMutation({
    refetchQueries: [refetchOpportunitiesQuery({ ecoverseId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
    onCompleted: () => onSuccess('Successfully created'),
    onError: handleError,
  });
  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchOpportunityProfileInfoQuery({ ecoverseId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { ecoverseId: ecoverseId, opportunityId: opportunityNameId },
    skip: mode === FormMode.create,
  });

  const opportunity = opportunityProfile?.ecoverse?.opportunity;
  const opportunityId = useMemo(() => opportunity?.id || '', [opportunity]);

  const isLoading = isCreating || isUpdating;

  const currentPaths = useMemo(
    () => [...paths, { name: opportunityId ? 'edit' : 'new', real: false }],
    [paths, opportunity]
  );
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, tagsets } = values;

    switch (mode) {
      case FormMode.create:
        createOpportunity({
          variables: {
            input: {
              nameID: nameID,
              context: createContextInput(values),
              displayName: name,
              challengeID: challengeId,
              tags: tagsets.map(x => x.tags.join()),
            },
          },
        });
        break;
      case FormMode.update:
        updateOpportunity({
          variables: {
            input: {
              nameID: nameID,
              context: updateContextInput(values),
              displayName: name,
              ID: opportunityId,
              tags: tagsets.map(x => x.tags.join()),
            },
          },
        });
        break;
      default:
        throw new Error(`Submit mode expected: (${mode}) found`);
    }
  };

  let submitWired;
  return (
    <Grid container spacing={2}>
      <Typography variant={'h2'}>{title}</Typography>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={opportunity?.displayName}
        nameID={opportunity?.nameID}
        tagset={opportunity?.tagset}
        context={opportunity?.context}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <Button
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}`)}
        />
      </Grid>
    </Grid>
  );
};
export default EditOpportunity;
