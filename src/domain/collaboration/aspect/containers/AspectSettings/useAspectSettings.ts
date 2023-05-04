import { ApolloError } from '@apollo/client';
import { ContainerHook } from '../../../../../core/container/container';
import { PushFunc, RemoveFunc, useEditReference } from '../../../../shared/Reference/useEditReference';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  useChallengeAspectSettingsQuery,
  useDeleteAspectMutation,
  useHubAspectSettingsQuery,
  useOpportunityAspectSettingsQuery,
  useUpdateAspectMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  Aspect,
  AspectSettingsCalloutFragment,
  AspectSettingsFragment,
  Profile,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../../common/profile/Profile';
import { newReferenceName } from '../../../../../common/utils/newReferenceName';
import removeFromCache from '../../../../shared/utils/apollo-cache/removeFromCache';
import { getCardCallout } from '../getAspectCallout';

type AspectUpdateData = Pick<Aspect, 'id' | 'type'> & {
  displayName: Profile['displayName'];
  description: string;
  tags: string[];
  references?: Reference[];
};

export interface AspectSettingsContainerEntities {
  aspect?: AspectSettingsFragment;
  aspectsNames?: string[] | undefined;
  parentCallout: AspectSettingsCalloutFragment | undefined;
}

export interface AspectSettingsContainerActions {
  handleUpdate: (aspect: AspectUpdateData) => Promise<void>;
  handleAddReference: (push: PushFunc, referencesLength: number) => void;
  handleRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
  handleDelete: (id: string) => Promise<void>;
}

export interface AspectSettingsContainerState {
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  error?: ApolloError;
  updateError?: ApolloError;
}

export interface AspectSettingsContainerProps {
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  aspectNameId: string;
  calloutNameId: string;
}

const useAspectSettings: ContainerHook<
  AspectSettingsContainerProps,
  AspectSettingsContainerEntities,
  AspectSettingsContainerActions,
  AspectSettingsContainerState
> = ({ hubNameId, aspectNameId, challengeNameId, opportunityNameId, calloutNameId }) => {
  const notify = useNotification();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();
  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectSettingsQuery({
    variables: { hubNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !!(challengeNameId || opportunityNameId),
  });

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectSettingsQuery({
    variables: { hubNameId, challengeNameId: challengeNameId ?? '', aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !challengeNameId || !!opportunityNameId,
  });

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectSettingsQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId ?? '', aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !opportunityNameId,
  });

  const collaborationCallouts =
    hubData?.hub?.collaboration?.callouts ??
    challengeData?.hub?.challenge?.collaboration?.callouts ??
    opportunityData?.hub?.opportunity?.collaboration?.callouts;

  // TODO fetch calloutID for the Aspect for building a reliable link between entities
  const parentCallout = getCardCallout(collaborationCallouts, aspectNameId);
  const parentCalloutAspectNames = parentCallout?.aspectNames?.map(x => x.profile.displayName);

  const aspect = parentCallout?.aspects?.find(x => x.nameID === aspectNameId);
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const [updateAspect, { loading: updating, error: updateError }] = useUpdateAspectMutation({
    onCompleted: () => notify('Aspect updated successfully', 'success'),
  });

  const handleUpdate = async (newAspect: AspectUpdateData) => {
    if (aspect) {
      await updateAspect({
        variables: {
          input: {
            ID: newAspect.id,
            profileData: {
              displayName: newAspect.displayName,
              description: newAspect.description,
              references: newAspect.references?.map(x => ({
                ID: x.id ?? '',
                name: x.name,
                description: x.description,
                uri: x.uri,
              })),
              tagsets: [
                {
                  ID: aspect.profile.tagset?.id ?? '',
                  tags: newAspect.tags,
                },
              ],
            },
            type: newAspect.type,
          },
        },
      });
    }
  };

  const [deleteAspect, { loading: deleting }] = useDeleteAspectMutation({
    update: removeFromCache,
  });

  const handleDelete = async (id: string) => {
    await deleteAspect({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const handleAddReference = (push: PushFunc, referencesLength: number) => {
    setPush(push);
    if (aspect) {
      addReference({
        profileId: aspect.profile.id,
        name: newReferenceName(referencesLength),
      });
    }
  };

  const handleRemoveReference = (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return {
    entities: { aspect, aspectsNames: parentCalloutAspectNames, parentCallout },
    state: { loading, error, updating, deleting, updateError },
    actions: { handleUpdate, handleAddReference, handleRemoveReference, handleDelete },
  };
};

export default useAspectSettings;
