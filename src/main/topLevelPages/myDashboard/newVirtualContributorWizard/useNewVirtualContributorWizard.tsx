import { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchMyAccountQuery,
  refetchSubspacesInSpaceQuery,
  useAddVirtualContributorToCommunityMutation,
  useCreateLinkOnCalloutMutation,
  useCreateNewSpaceMutation,
  useCreatePostFromContributeTabMutation,
  useCreateSubspaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useDeleteSpaceMutation,
  useNewVirtualContributorMySpacesQuery,
  usePlansTableQuery,
  useSpaceUrlLazyQuery,
  useSubspaceProfileInfoQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutGroupName,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  LicensePlanType,
  NewVirtualContributorMySpacesQuery,
  SpaceType,
} from '../../../../core/apollo/generated/graphql-schema';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import useNavigate from '../../../../core/routing/useNavigate';
import { info } from '../../../../core/logging/sentry/log';
import { useUserContext } from '../../../../domain/community/user';
import { usePlanAvailability } from '../../../../domain/journey/space/createSpace/plansTable/usePlanAvailability';
import {
  CalloutCreationType,
  useCalloutCreation,
} from '../../../../domain/collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreation';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent, { ContentFormValues, DocumentValues, PostValues } from './AddContent';
import ExistingSpace, { SelectableKnowledgeProps } from './ExistingSpace';
import { addVCCreationCache } from './vcCreationUtil';
import SetupVCInfo from './SetupVCInfo';

const SPACE_LABEL = '(space)';
const entityNamePostfixes = {
  SPACE: "'s Space",
  SUBSPACE: "'s Knowledge Subspace",
};

type Step = 'initial' | 'createSpace' | 'addKnowledge' | 'existingKnowledge' | 'loadingVCSetup';

interface useNewVirtualContributorWizardProvided {
  startWizard: () => void;
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
  const [spaceId, setSpaceId] = useState<string>();
  const [bokId, setbokId] = useState<string | undefined>(undefined);
  const [creationIndex, setCreationIndex] = useState<number>(0);
  const [bokCommunityId, setBokCommunityId] = useState<string | undefined>(undefined);
  const [accountId, setAccountId] = useState<string>();
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps | undefined>(
    undefined
  );
  const [calloutPostData, setCalloutPostData] = useState<PostValues[] | undefined>(undefined);
  const [calloutDocumentData, setCalloutDocumentData] = useState<DocumentValues[] | undefined>(undefined);
  const [tryCreateCallout, setTryCreateCallout] = useState<boolean>(false);
  const calloutId = useRef<string>();

  const startWizard = () => {
    setStep('initial');
    setDialogOpen(true);
  };

  const onStepSelection = (step: Step, values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(step);
  };

  const handleAddContent = async (values: ContentFormValues) => {
    setCalloutPostData(values.posts);
    const docsFiltered = values.documents.filter(doc => doc.url && doc.name);
    setCalloutDocumentData(docsFiltered);
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

  const findMySpaces = (
    userId: string | undefined,
    mySpaces: NewVirtualContributorMySpacesQuery['me']['myCreatedSpaces'] | undefined
  ) => {
    if (!userId || !mySpaces) {
      return undefined;
    }

    const spacesHostedByUser = mySpaces.filter(space => space.account.host?.id === userId);
    if (spacesHostedByUser.length > 0) {
      return spacesHostedByUser;
    }
  };

  // selectableSpaces are space and subspaces
  // subspaces has communityId in order to manually add the VC to it
  const { mySpaceId, myAccountId, selectableSpaces } = useMemo(() => {
    const mySpaces = findMySpaces(user?.user.id, data?.me.myCreatedSpaces);
    let selectableSpaces: SelectableKnowledgeProps[] = [];

    mySpaces?.forEach(space => {
      if (space) {
        selectableSpaces.push({
          id: space.id,
          name: `${space.profile.displayName} ${SPACE_LABEL}`,
          accountId: space.account.id,
          url: space.profile.url,
        });
        selectableSpaces = selectableSpaces.concat(
          space.subspaces?.map(subspace => ({
            id: subspace.id,
            name: subspace.profile.displayName,
            accountId: space.account.id,
            url: space.profile.url,
            communityId: subspace.community.id,
          })) ?? []
        );
      }
    });

    return {
      mySpaceId: mySpaces?.[0]?.id,
      myAccountId: mySpaces?.[0]?.account.id,
      selectableSpaces,
    };
  }, [data, user]);

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: spaceId! })],
  });

  const handleSubspaceCreation = async (parentId: string, vcName: string) => {
    return await createSubspace({
      variables: {
        input: {
          type: SpaceType.Knowledge,
          spaceID: parentId,
          context: {
            vision: '-',
          },
          profileData: {
            displayName: generateSubSpaceName(vcName),
            tagline: 'A Knowledge Base of a Virtual Contributor',
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
    skip: !!mySpaceId,
  });

  const { isPlanAvailable } = usePlanAvailability({ skip: !!mySpaceId });

  const plans = useMemo(
    () =>
      plansData?.platform.licensing.plans
        .filter(plan => plan.enabled)
        .filter(plan => plan.type === LicensePlanType.SpacePlan)
        .filter(plan => isPlanAvailable(plan))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [plansData, isPlanAvailable]
  );

  const [CreateNewSpace] = useCreateNewSpaceMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });
  const handleCreateSpace = async (values: VirtualContributorFromProps) => {
    if (!user?.user.id) {
      return;
    }

    setVirtualContributorInput(values);
    setStep('createSpace');

    // in case of existing space, create subspace as BoK
    // otherwise create a new space
    if (mySpaceId && myAccountId) {
      setSpaceId(mySpaceId);
      setAccountId(myAccountId);

      const subspace = await handleSubspaceCreation(mySpaceId, values.name);
      setbokId(subspace?.data?.createSubspace.id);
      setBokCommunityId(subspace?.data?.createSubspace.community.id);
    } else {
      if (plans.length === 0) {
        info(`No available plans for this account. User: ${user?.user.id}`);
        notify('No available plans for this account. Please, contact support@alkem.io.', 'error');
        return;
      }

      const { data: newSpace } = await CreateNewSpace({
        variables: {
          hostId: user?.user.id,
          spaceData: {
            profileData: {
              displayName: generateSpaceName(user?.user.profile.displayName!, creationIndex),
            },
            collaborationData: {},
          },
          licensePlanId: plans[0]?.id,
        },
      });
      setSpaceId(newSpace?.createAccount.spaceID);
      setAccountId(newSpace?.createAccount.id);
      setCreationIndex(0);

      const subspace = await handleSubspaceCreation(newSpace?.createAccount.spaceID ?? '', values.name);
      setbokId(subspace?.data?.createSubspace.id);
      setBokCommunityId(subspace?.data?.createSubspace.community.id);
    }

    setStep('addKnowledge');
  };

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchMyAccountQuery()],
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
    }

    // if there was a space before the VC creation, let's not delete it
    if (spaceId && spaceId !== mySpaceId) {
      await deleteSpace({
        variables: {
          input: {
            ID: spaceId,
          },
        },
      });

      setCreationIndex(prevIndex => prevIndex + 1);
      setSpaceId(undefined);
    }

    onDialogClose();
  };

  const [getNewSpaceUrl] = useSpaceUrlLazyQuery({
    variables: {
      spaceNameId: spaceId!,
    },
  });

  const { data: subspaceProfile } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: bokId! },
    skip: !bokId,
  });

  const callabId = subspaceProfile?.lookup.space?.collaboration?.id;

  // load the following hook either with bokId (created subspace) or spaceId (created/existing space)
  const { handleCreateCallout, canCreateCallout } = useCalloutCreation({
    journeyId: bokId ?? spaceId,
    collabId: callabId,
  });

  const calloutPostDetails: CalloutCreationType = {
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
  // where CalloutPostDetails will refetch the details
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
            type: CalloutType.Post,
          },
        },
      },
    });
  };

  const [createLinkOnCallout] = useCreateLinkOnCalloutMutation();
  const onCreateLink = async (document: DocumentValues, calloutId: string) => {
    await createLinkOnCallout({
      variables: {
        input: {
          calloutID: calloutId,
          link: {
            uri: document.url,
            profile: {
              displayName: document.name,
            },
          },
        },
      },
    });
  };

  const createCalloutContent = async () => {
    setStep('loadingVCSetup');

    // create collection of posts
    if (calloutPostData && calloutPostData.length > 0) {
      const postCallout = await handleCreateCallout(calloutPostDetails);
      calloutId.current = postCallout?.id;

      // add posts to collection
      if (postCallout?.id) {
        for (const post of calloutPostData) {
          await onCreatePost(post, postCallout.id);
        }
      }

      setTryCreateCallout(false);
    }

    if (calloutDocumentData && calloutDocumentData.length > 0) {
      const documentsCallout = await handleCreateCallout(calloutDocumentsDetails);
      calloutId.current = documentsCallout?.id;

      if (documentsCallout?.id) {
        for (const document of calloutDocumentData) {
          await onCreateLink(document, documentsCallout.id);
        }
      }

      setTryCreateCallout(false);
    }

    // create VC
    if (virtualContributorInput && accountId && spaceId) {
      await handleCreateVirtualContributor(virtualContributorInput, accountId, bokId ?? spaceId, bokCommunityId);
      addVCCreationCache(virtualContributorInput.name);
      const { data } = await getNewSpaceUrl();
      navigate(data?.space.profile.url ?? '');
    }
  };

  const calloutDocumentsDetails: CalloutCreationType = {
    framing: {
      profile: {
        displayName: t('createVirtualContributorWizard.addContent.documents.initialDocuments'),
        description: '',
        referencesData: [],
      },
    },
    type: CalloutType.LinkCollection,
    contributionPolicy: {
      state: CalloutState.Open,
    },
    groupName: CalloutGroupName.Home,
    visibility: CalloutVisibility.Published,
    sendNotification: false,
  };

  const [addVirtualContributorToSubspace] = useAddVirtualContributorToCommunityMutation();
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });

  const handleCreateVirtualContributor = async (
    values: VirtualContributorFromProps,
    accountId: string,
    spaceId: string,
    communityId?: string
  ) => {
    if (!accountId || !spaceId || !virtualContributorInput) {
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
              bodyOfKnowledgeID: spaceId,
            },
          },
        },
      },
    });
    if (data?.createVirtualContributor.id) {
      if (communityId) {
        await addVirtualContributorToSubspace({
          variables: {
            communityId: communityId,
            virtualContributorId: data.createVirtualContributor.id,
          },
        });
      }

      notify(
        t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { values: { name: values.name } }),
        'success'
      );
    }
  };

  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeProps) => {
    if (selectedKnowledge && virtualContributorInput) {
      await handleCreateVirtualContributor(
        virtualContributorInput,
        selectedKnowledge.accountId,
        selectedKnowledge.id,
        selectedKnowledge.communityId
      );
      addVCCreationCache(virtualContributorInput.name);
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
        {step === 'createSpace' && <LoadingState onClose={handleCancel} entity={mySpaceId ? 'subspace' : 'space'} />}
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
