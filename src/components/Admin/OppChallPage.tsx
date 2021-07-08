import React, { FC, useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Path } from '../../context/NavigationProvider';
import {
  refetchChallengeProfileInfoQuery,
  refetchChallengesWithCommunityQuery,
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useChallengeProfileInfoLazyQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoLazyQuery,
  useUpdateChallengeMutation,
  useUpdateOpportunityMutation,
} from '../../generated/graphql';
import { useApolloErrorHandler } from '../../hooks/useApolloErrorHandler';
import { useEcoverse } from '../../hooks/useEcoverse';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { useNotification } from '../../hooks/useNotification';
import { CreateContextInput, UpdateContextInput, UpdateReferenceInput } from '../../types/graphql-schema';
import Button from '../core/Button';
import Loading from '../core/Loading';
import Typography from '../core/Typography';
import ProfileForm, { ProfileFormValuesType } from '../ProfileForm/ProfileForm';

export enum ProfileSubmitMode {
  createChallenge,
  updateChallenge,
  createOpportunity,
  updateOpportunity,
}

interface Props {
  mode: ProfileSubmitMode;
  paths: Path[];
  title: string;
}
interface Params {
  challengeId?: string;
  opportunityId?: string;
  ecoverseId?: string;
}

const OppChallPage: FC<Props> = ({ paths, mode, title }) => {
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const {
    challengeId: challengeNameId = '',
    opportunityId: opportunityNameId = '',
    ecoverseId = '',
  } = useParams<Params>();
  const { toEcoverseId } = useEcoverse();
  const [getChallengeProfileInfo, { data: challengeProfile }] = useChallengeProfileInfoLazyQuery();
  const [getOpportunityProfileInfo, { data: opportunityProfile }] = useOpportunityProfileInfoLazyQuery();
  const challengeId = useMemo(() => challengeProfile?.ecoverse.challenge.id || '', [challengeProfile]);
  const opportunityId = useMemo(() => opportunityProfile?.ecoverse.opportunity.id || '', [opportunityProfile]);

  const [createChallenge, { loading: loading1 }] = useCreateChallengeMutation({
    refetchQueries: [refetchChallengesWithCommunityQuery({ ecoverseId })],
    awaitRefetchQueries: true,
    onCompleted: () => onSuccess('Successfully created'),
    onError: handleError,
  });
  const [createOpportunity, { loading: loading2 }] = useCreateOpportunityMutation({
    refetchQueries: [refetchOpportunitiesQuery({ ecoverseId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
    onCompleted: () => onSuccess('Successfully created'),
    onError: handleError,
  });
  const [updateChallenge, { loading: loading3 }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchChallengeProfileInfoQuery({ ecoverseId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });
  const [updateOpportunity, { loading: loading4 }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchOpportunityProfileInfoQuery({ ecoverseId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (mode === ProfileSubmitMode.updateChallenge)
      getChallengeProfileInfo({
        variables: {
          ecoverseId,
          challengeId: challengeNameId,
        },
      });
    if (mode === ProfileSubmitMode.updateOpportunity)
      getOpportunityProfileInfo({ variables: { ecoverseId, opportunityId: opportunityNameId } });
  }, []);

  const isEdit = mode === ProfileSubmitMode.updateOpportunity || mode === ProfileSubmitMode.updateChallenge;

  const isLoading = loading1 || loading2 || loading3 || loading4;
  const entity = challengeProfile?.ecoverse?.challenge || opportunityProfile?.ecoverse?.opportunity;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const currentPaths = useMemo(() => [...paths, { name: entity?.displayName || 'new', real: false }], [paths, entity]);
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

    if (ProfileSubmitMode) {
      switch (mode) {
        case ProfileSubmitMode.createChallenge:
          createChallenge({
            variables: {
              input: {
                nameID: nameID,
                displayName: name,
                parentID: toEcoverseId(ecoverseId),
                context: createContext,
                tags: tagsets.map(x => x.tags.join()),
              },
            },
          });
          break;
        case ProfileSubmitMode.updateChallenge:
          updateChallenge({
            variables: {
              input: {
                ID: challengeId,
                nameID: nameID,
                displayName: name,
                context: updateContext,
                tags: tagsets.map(x => x.tags.join()),
              },
            },
          });
          break;
        case ProfileSubmitMode.createOpportunity:
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
        case ProfileSubmitMode.updateOpportunity:
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
          throw new Error('Submit handler not found');
      }
    }
  };

  let submitWired;
  return (
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {title}
      </Typography>
      <ProfileForm
        isEdit={isEdit}
        name={entity?.displayName}
        nameID={entity?.nameID}
        tagset={entity?.tagset}
        context={entity?.context}
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

export default OppChallPage;
