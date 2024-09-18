import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import {
  refetchSubspacesInSpaceQuery,
  useCreateSpaceMutation,
  useCreatePostFromContributeTabMutation,
  useCreateSubspaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useDeleteSpaceMutation,
  useNewVirtualContributorMySpacesQuery,
  usePlansTableQuery,
  useSpaceUrlLazyQuery,
  useSubspaceProfileInfoQuery,
  useSubspaceCommunityIdLazyQuery,
  useAssignCommunityRoleToVirtualContributorMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutGroupName,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  LicensePlanType,
  SpaceType,
} from '../../../../core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent, { PostsFormValues, PostValues } from './AddContent';
import ExistingSpace, { SelectableKnowledgeProps } from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUserContext } from '../../../../domain/community/user';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import useNavigate from '../../../../core/routing/useNavigate';
import { usePlanAvailability } from '../../../../domain/journey/space/createSpace/plansTable/usePlanAvailability';
import { addVCCreationCache } from './vcCreationUtil';
import {
  CalloutCreationType,
  useCalloutCreation,
} from '../../../../domain/collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreation';
import SetupVCInfo from './SetupVCInfo';
import { info } from '../../../../core/logging/sentry/log';
import { compact } from 'lodash';

const SPACE_LABEL = '(space)';
const entityNamePostfixes = {
  SPACE: "'s Space",
  SUBSPACE: "'s Knowledge Subspace",
};

type Step = 'initial' | 'createSpace' | 'addKnowledge' | 'existingKnowledge' | 'loadingVCSetup';

export interface UserAccountProps {
  id: string;
  host?: {
    id: string;
  };
  spaces: Array<{
    id: string;
    community: {
      id: string;
    };
    profile: {
      id: string;
      displayName: string;
      url: string;
    };
    subspaces: Array<{
      id: string;
      type: SpaceType;
      profile: {
        id: string;
        displayName: string;
        url: string;
      };
      community: {
        id: string;
      };
    }>;
  }>;
}

interface useNewVirtualContributorWizardProvided {
  startWizard: (initAccount?: UserAccountProps | undefined) => void;
  NewVirtualContributorWizard: ComponentType<NewVirtualContributorWizardProps>;
}

interface NewVirtualContributorWizardProps {}

// generate name for the space/subspace based on the VC name
// index is needed in case of canceling the flow. Creation with the same name/nameID leads to issues accessing it later
const generateEntityName = (name: string, entityPostfix: string, index: number = 0) => {
  return `${name}${entityPostfix}${index > 0 ? ` ${index}` : ''}`;
};
const generateSpaceName = (name: string, index?: number) => generateEntityName(name, entityNamePostfixes.SPACE, index);
const generateSubSpaceName = (name: string) => generateEntityName(name, entityNamePostfixes.SUBSPACE);

const useNewVirtualContributorWizard = (): useNewVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const notify = useNotification();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>('initial');

  const [targetAccount, setTargetAccount] = useState<UserAccountProps | undefined>(undefined);
  const [createdSpaceId, setCreatedSpaceId] = useState<string | undefined>(undefined);
  const [bokId, setbokId] = useState<string | undefined>(undefined);
  const [bokCommunityId, setBokCommunityId] = useState<string | undefined>(undefined);
  const [boKParentCommunityId, setBoKParentCommunityId] = useState<string | undefined>(undefined);
  const [creationIndex, setCreationIndex] = useState<number>(0); // used in case of space deletion
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps | undefined>(
    undefined
  );
  const [calloutPostData, setCalloutPostData] = useState<PostsFormValues | undefined>(undefined);
  const [tryCreateCallout, setTryCreateCallout] = useState<boolean>(false);

  const startWizard = (initAccount: UserAccountProps | undefined) => {
    setTargetAccount(initAccount);
    setStep('initial');
    setDialogOpen(true);
  };

  const onStepSelection = (step: Step, values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(step);
  };

  const handleAddContent = async (posts: PostsFormValues) => {
    setCalloutPostData(posts);
    // trigger useEffect to create the callout once canCreateCallout is true
    setTryCreateCallout(true);
  };

  const onDialogClose = () => {
    setDialogOpen(false);
    setStep('initial');
  };

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: !dialogOpen,
    fetchPolicy: 'cache-and-network',
  });

  // selectableSpaces are space and subspaces
  // subspaces has communityId in order to manually add the VC to it
  const { selectedExistingSpaceId, myAccountId, selectableSpaces } = useMemo(() => {
    const account = targetAccount ?? data?.me.user?.account;
    const accountId = account?.id;
    const mySpaces = compact(account?.spaces);
    let selectableSpaces: SelectableKnowledgeProps[] = [];

    if (accountId) {
      account?.spaces?.forEach(space => {
        if (space) {
          selectableSpaces.push({
            id: space.id,
            name: `${space.profile.displayName} ${SPACE_LABEL}`,
            accountId,
            url: space.profile.url,
            communityId: space.community.id,
          });
          selectableSpaces = selectableSpaces.concat(
            space.subspaces?.map(subspace => ({
              id: subspace.id,
              name: subspace.profile.displayName,
              accountId,
              url: space.profile.url, // land on parent space
              communityId: subspace.community.id,
              parentCommunityId: space.community.id,
            })) ?? []
          );
        }
      });
    }

    return {
      selectedExistingSpaceId: mySpaces?.[0]?.id, // TODO: auto-selecting the first space, not ideal
      myAccountId: accountId,
      selectableSpaces,
    };
  }, [data, user, targetAccount]);

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: createdSpaceId ?? selectedExistingSpaceId })],
  });

  const handleSubspaceCreation = async (parentId: string, vcName: string) => {
    return await createSubspace({
      variables: {
        input: {
          type: SpaceType.Knowledge,
          spaceID: parentId,
          context: {
            vision: t('createVirtualContributorWizard.autoCreated.subSpaceVision'),
          },
          profileData: {
            displayName: generateSubSpaceName(vcName),
            tagline: t('createVirtualContributorWizard.autoCreated.subSpaceTagline'),
          },
          tags: [],
          collaborationData: {
            addDefaultCallouts: true,
          },
        },
      },
    });
  };

  const { data: plansData } = usePlansTableQuery({
    skip: !!selectedExistingSpaceId,
  });

  const { isPlanAvailable } = usePlanAvailability({ skip: !!selectedExistingSpaceId });

  const plans = useMemo(
    () =>
      plansData?.platform.licensing.plans
        .filter(plan => plan.enabled)
        .filter(plan => plan.type === LicensePlanType.SpacePlan)
        .filter(plan => isPlanAvailable(plan))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [plansData, isPlanAvailable]
  );

  const [CreateNewSpace] = useCreateSpaceMutation({
    refetchQueries: ['MyAccount'],
  });
  const handleCreateSpace = async (values: VirtualContributorFromProps) => {
    if (!user?.user.id) {
      return;
    }

    setVirtualContributorInput(values);
    setStep('createSpace');

    // in case of existing space, create subspace as BoK
    // otherwise create a new space
    if (selectedExistingSpaceId && myAccountId) {
      const subspace = await handleSubspaceCreation(selectedExistingSpaceId, values.name);
      setbokId(subspace?.data?.createSubspace.id);
      setBokCommunityId(subspace?.data?.createSubspace.community.id);
      const parentCommunityId = selectableSpaces.filter(space => space.id === selectedExistingSpaceId)[0]?.communityId;

      if (parentCommunityId) {
        setBoKParentCommunityId(parentCommunityId);
      }
    } else {
      if (plans.length === 0) {
        info(`No available plans for this account. User: ${user?.user.id}`);
        notify('No available plans for this account. Please, contact support@alkem.io.', 'error');
        return;
      }

      const { data: newSpace } = await CreateNewSpace({
        variables: {
          spaceData: {
            accountID: myAccountId!,
            profileData: {
              displayName: generateSpaceName(user?.user.profile.displayName!, creationIndex),
            },
            collaborationData: {},
          },
        },
      });

      const newlyCreatedSpaceId = newSpace?.createSpace.id;

      if (newlyCreatedSpaceId) {
        setCreatedSpaceId(newlyCreatedSpaceId);
        setCreationIndex(0);

        const subspace = await handleSubspaceCreation(newlyCreatedSpaceId, values.name);
        setbokId(subspace?.data?.createSubspace.id);
        setBokCommunityId(subspace?.data?.createSubspace.community.id);

        const parentCommunityData = await getSpaceCommunity();
        setBoKParentCommunityId(parentCommunityData.data?.lookup.space?.community.id);
      }
    }

    setStep('addKnowledge');
  };

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: ['MyAccount'],
  });

  const handleCancel = async () => {
    // delete the BoK (Subspace) if it was created
    if (bokId) {
      await deleteSpace({
        variables: {
          input: {
            ID: bokId,
          },
        },
      });

      // cleanup state
      setbokId(undefined);
      setBokCommunityId(undefined);
      setBoKParentCommunityId(undefined);
    }

    if (createdSpaceId) {
      await deleteSpace({
        variables: {
          input: {
            ID: createdSpaceId,
          },
        },
      });

      setCreationIndex(prevIndex => prevIndex + 1);
      setCreatedSpaceId(undefined);
    }

    onDialogClose();
  };

  const [getNewSpaceUrl] = useSpaceUrlLazyQuery({
    variables: {
      spaceNameId: createdSpaceId ?? selectedExistingSpaceId,
    },
  });

  const [getSpaceCommunity] = useSubspaceCommunityIdLazyQuery({
    variables: {
      spaceId: createdSpaceId!,
    },
  });

  const { data: subspaceProfile } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: bokId! },
    skip: !bokId,
  });

  const collaborationId = subspaceProfile?.lookup.space?.collaboration?.id;

  // load the following hook either with bokId (created subspace) or spaceId (created/existing space)
  const { handleCreateCallout, canCreateCallout } = useCalloutCreation({
    journeyId: bokId,
    overrideCollaborationId: collaborationId,
  });

  const calloutDetails: CalloutCreationType = {
    framing: {
      profile: {
        displayName: t('createVirtualContributorWizard.addContent.post.initialPosts'),
        description: '',
        referencesData: [],
      },
    },
    type: CalloutType.PostCollection,
    contributionPolicy: {
      state: CalloutState.Open,
    },
    groupName: CalloutGroupName.Home,
    visibility: CalloutVisibility.Published,
    sendNotification: false,
  };

  // no need of 'update' implementation as the callout is on another page
  // where CalloutDetails will refetch the details
  const [createPost] = useCreatePostFromContributeTabMutation();
  const onCreatePost = async (post: PostValues, calloutId: string) => {
    await createPost({
      variables: {
        postData: {
          calloutID: calloutId!,
          post: {
            profileData: {
              displayName: post.title,
              description: post.description,
            },
          },
        },
      },
    });
  };

  const createCalloutContent = async () => {
    setStep('loadingVCSetup');

    // create collection of posts
    if (calloutPostData?.posts && calloutPostData?.posts.length > 0 && bokId) {
      const callout = await handleCreateCallout(calloutDetails);

      // add posts to collection
      if (callout?.id) {
        for (const post of calloutPostData?.posts) {
          await onCreatePost(post, callout.id);
        }
      }

      setTryCreateCallout(false);
    }

    // create VC
    if (virtualContributorInput && myAccountId && bokId && bokCommunityId) {
      await handleCreateVirtualContributor(
        virtualContributorInput,
        myAccountId,
        bokId,
        bokCommunityId,
        boKParentCommunityId
      );

      const { data } = await getNewSpaceUrl();
      navigate(data?.space.profile.url ?? '');
    }
  };

  const [addVirtualContributorToCommunity] = useAssignCommunityRoleToVirtualContributorMutation();
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: ['MyAccount', 'AccountInformation'],
  });

  const handleCreateVirtualContributor = async (
    values: VirtualContributorFromProps,
    accountId: string,
    vcBoKId: string,
    communityId: string,
    parentCommunityId?: string
  ) => {
    if (!accountId || !vcBoKId || !virtualContributorInput) {
      return;
    }

    const { data } = await createVirtualContributor({
      variables: {
        virtualContributorData: {
          accountID: accountId,
          profileData: {
            displayName: values.name,
            tagline: values.tagline,
            description:
              values.description ?? t('createVirtualContributorWizard.createdVirtualContributor.description'),
          },
          aiPersona: {
            aiPersonaService: {
              bodyOfKnowledgeID: vcBoKId,
            },
          },
        },
      },
    });

    const vcId = data?.createVirtualContributor.id;

    if (vcId) {
      if (parentCommunityId) {
        // the VC cannot be added to the BoK community
        // if it's not part of the parent community
        await addVirtualContributorToCommunity({
          variables: {
            communityId: parentCommunityId,
            virtualContributorId: vcId,
          },
        });
      }

      // add the VC to the BoK community
      await addVirtualContributorToCommunity({
        variables: {
          communityId: communityId,
          virtualContributorId: vcId,
        },
      });

      // add vc's nameId to the cache for the TryVC dialog
      if (data?.createVirtualContributor.nameID) {
        addVCCreationCache(data?.createVirtualContributor.nameID);
      }

      notify(
        t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { name: values.name }),
        'success'
      );
    }
  };

  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeProps) => {
    if (selectedKnowledge && selectedKnowledge.communityId && virtualContributorInput) {
      await handleCreateVirtualContributor(
        virtualContributorInput,
        selectedKnowledge.accountId,
        selectedKnowledge.id,
        selectedKnowledge.communityId,
        selectedKnowledge.parentCommunityId
      );

      navigate(selectedKnowledge.url ?? '');
    }
  };

  useEffect(() => {
    if (tryCreateCallout && canCreateCallout) {
      createCalloutContent();
    }
  }, [tryCreateCallout, canCreateCallout]);

  const NewVirtualContributorWizard = useCallback(
    () => (
      <DialogWithGrid open={dialogOpen} columns={6}>
        {step === 'initial' && (
          <CreateNewVirtualContributor
            onClose={onDialogClose}
            loading={loading}
            onCreateSpace={handleCreateSpace}
            onUseExistingKnowledge={values => onStepSelection('existingKnowledge', values)}
          />
        )}
        {step === 'createSpace' && (
          <LoadingState onClose={handleCancel} entity={selectedExistingSpaceId ? 'subspace' : 'space'} />
        )}
        {step === 'addKnowledge' && virtualContributorInput && (
          <AddContent onClose={handleCancel} onCreateVC={handleAddContent} />
        )}
        {step === 'existingKnowledge' && (
          <ExistingSpace
            onClose={onDialogClose}
            onBack={() => setStep('initial')}
            onSubmit={handleCreateVCWithExistingKnowledge}
            availableSpaces={selectableSpaces}
            loading={loading}
          />
        )}
        {step === 'loadingVCSetup' && <SetupVCInfo />}
      </DialogWithGrid>
    ),
    [dialogOpen, step, loading]
  );

  return {
    startWizard,
    NewVirtualContributorWizard,
  };
};

export default useNewVirtualContributorWizard;
