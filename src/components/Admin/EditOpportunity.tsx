import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router';
import { Container } from 'react-bootstrap';
import { Path } from '../../context/NavigationProvider';
import {
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../generated/graphql';
import { useNotification } from '../../hooks/useNotification';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';
import { CreateContextInput, UpdateContextInput, UpdateReferenceInput } from '../../types/graphql-schema';
import Typography from '../core/Typography';
import Button from '../core/Button';
import Loading from '../core/Loading';
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
}

const EditOpportunity: FC<Props> = ({ paths, mode, title }) => {
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

  const currentPaths = useMemo(() => [...paths, { name: opportunity?.displayName || 'new', real: false }], [
    paths,
    opportunity,
  ]);
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, background, impact, tagline, vision, who, references, visual, tagsets } = values;

    const updatedRefs: UpdateReferenceInput[] = references.map<UpdateReferenceInput>(r => ({
      ID: r.id,
      description: r.description,
      name: r.name,
      uri: r.uri,
    }));

    const updateContext: UpdateContextInput = {
      background: background,
      impact: impact,
      references: updatedRefs,
      tagline: tagline,
      vision: vision,
      visual: visual,
      who: who,
    };
    const createContext: CreateContextInput = {
      background: background,
      impact: impact,
      references: references,
      tagline: tagline,
      vision: vision,
      visual: visual,
      who: who,
    };

    switch (mode) {
      case FormMode.create:
        createOpportunity({
          variables: {
            input: {
              nameID: nameID,
              context: createContext,
              displayName: name,
              challengeID: challengeNameId,
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
              context: updateContext,
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
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {title}
      </Typography>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={opportunity?.displayName}
        nameID={opportunity?.nameID}
        tagset={opportunity?.tagset}
        context={opportunity?.context}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <div className={'d-flex mt-4 mb-4'}>
        <Button disabled={isLoading} className={'ml-auto'} variant="primary" onClick={() => submitWired()}>
          {isLoading ? <Loading text={'Processing'} /> : 'Save'}
        </Button>
      </div>
    </Container>
  );
};
export default EditOpportunity;
