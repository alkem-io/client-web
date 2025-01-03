import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useSubspaceCommunityAndRoleSetIdLazyQuery,
  useAssignRoleToVirtualContributorMutation,
  refetchDashboardWithMembershipsQuery,
  useCreateLinkOnCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AiPersonaBodyOfKnowledgeType,
  AuthorizationPrivilege,
  CalloutGroupName,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  CommunityRoleType,
  CreateVirtualContributorOnAccountMutationVariables,
  LicensingCredentialBasedPlanType,
  SpaceType,
} from '@/core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent from './AddContent/AddContent';
import { BoKCalloutsFormValues, DocumentValues, PostValues } from './AddContent/AddContentProps';
import ExistingSpace, { SelectableKnowledgeProps } from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUserContext } from '@/domain/community/user';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import useNavigate from '@/core/routing/useNavigate';
import { usePlanAvailability } from '@/domain/journey/space/createSpace/plansTable/usePlanAvailability';
import { addVCCreationCache } from './vcCreationUtil';
import {
  CalloutCreationType,
  useCalloutCreation,
} from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import SetupVCInfo from './SetupVCInfo';
import { info, TagCategoryValues } from '@/core/logging/sentry/log';
import { compact } from 'lodash';
import InfoDialog from '@/core/ui/dialogs/InfoDialog';
import CreateExternalAIDialog, { ExternalVcFormValues } from './CreateExternalAIDialog';
import { useNewVirtualContributorWizardProvided, UserAccountProps } from './useNewVirtualContributorProps';
import { info as logInfo } from '@/core/logging/sentry/log';

const SPACE_LABEL = '(space)';
const entityNamePostfixes = {
  SPACE: "'s Space",
  SUBSPACE: "'s Knowledge Subspace",
};

type Step =
  | 'initial'
  | 'createSpace'
  | 'addKnowledge'
  | 'existingKnowledge'
  | 'externalProvider'
  | 'loadingVCSetup'
  | 'insufficientPrivileges';

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

  const [targetAccount, setTargetAccount] = useState<UserAccountProps>();
  const [createdSpaceId, setCreatedSpaceId] = useState<string>();
  const [bokId, setbokId] = useState<string>();
  const [bokRoleSetId, setBokRoleSetId] = useState<string>();
  const [boKParentRoleSetId, setBoKParentRoleSetId] = useState<string>();
  const [creationIndex, setCreationIndex] = useState<number>(0); // used in case of space deletion
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps>();
  const [calloutData, setCalloutData] = useState<BoKCalloutsFormValues>();
  const [tryCreateCallout, setTryCreateCallout] = useState<boolean>(false);
  const calloutId = useRef<string>();

  const startWizard = (initAccount: UserAccountProps | undefined) => {
    setTargetAccount(initAccount);
    setStep('initial');
    setDialogOpen(true);
  };

  const onStepSelection = (step: Step, values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(step);
  };

  const handleAddContent = async (values: BoKCalloutsFormValues) => {
    setCalloutData(values);
    // trigger useEffect to create the callout once canCreateCallout is true
    setTryCreateCallout(true);
  };

  const handleCloseWizard = () => {
    setDialogOpen(false);
    setStep('initial');
  };

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: !dialogOpen,
    fetchPolicy: 'cache-and-network',
  });

  // selectableSpaces are space and subspaces
  // subspaces has communityId in order to manually add the VC to it
  const { selectedExistingSpaceId, spacePrivileges, myAccountId, selectableSpaces } = useMemo(() => {
    const account = targetAccount ?? data?.me.user?.account;
    const accountId = account?.id;
    const mySpaces = compact(account?.spaces);
    const mySpace = mySpaces?.[0]; // TODO: auto-selecting the first space, not ideal
    let selectableSpaces: SelectableKnowledgeProps[] = [];

    if (accountId) {
      account?.spaces?.forEach(space => {
        if (space) {
          selectableSpaces.push({
            id: space.id,
            name: `${space.profile.displayName} ${SPACE_LABEL}`,
            accountId,
            url: space.profile.url,
            roleSetId: space.community.roleSet.id,
          });
          selectableSpaces = selectableSpaces.concat(
            space.subspaces?.map(subspace => ({
              id: subspace.id,
              name: subspace.profile.displayName,
              accountId,
              url: space.profile.url, // land on parent space
              roleSetId: subspace.community.roleSet.id,
              parentRoleSetId: space.community.roleSet.id,
            })) ?? []
          );
        }
      });
    }

    return {
      selectedExistingSpaceId: mySpace?.id,
      myAccountId: accountId,
      spacePrivileges: {
        myPrivileges: mySpace?.authorization?.myPrivileges,
        collaboration: {
          myPrivileges: mySpace?.community?.roleSet.authorization?.myPrivileges,
        },
      },
      selectableSpaces,
    };
  }, [data, user, targetAccount]);

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({ spaceId: createdSpaceId ?? selectedExistingSpaceId }),
      refetchDashboardWithMembershipsQuery(),
    ],
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
            addTutorialCallouts: false,
            addCallouts: true,
            calloutsSetData: {},
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
      plansData?.platform.licensingFramework.plans
        .filter(plan => plan.enabled)
        .filter(plan => plan.type === LicensingCredentialBasedPlanType.SpacePlan)
        .filter(plan => isPlanAvailable(plan))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [plansData, isPlanAvailable]
  );

  const hasPrivilegesOnSpaceAndCommunity = () => {
    // in case of clean creation, the user is an admin of the space
    // no way and need to check the privileges
    if (!selectedExistingSpaceId) {
      return true;
    }

    // todo: check create callout privilege (community) if needed
    const { myPrivileges: spaceMyPrivileges } = spacePrivileges;
    const { myPrivileges: collaborationMyPrivileges } = spacePrivileges.collaboration;

    const hasRequiredPrivileges =
      spaceMyPrivileges?.includes(AuthorizationPrivilege.CreateSubspace) &&
      collaborationMyPrivileges?.includes(AuthorizationPrivilege.CommunityAddMemberVcFromAccount);

    if (!hasRequiredPrivileges) {
      logInfo(`Insufficient privileges to create a VC, Space Privileges: ${JSON.stringify(spacePrivileges)}`, {
        category: TagCategoryValues.VC,
      });
      logInfo(
        `Insufficient privileges to create a VC, Collaboration Privileges: ${JSON.stringify(
          collaborationMyPrivileges
        )}`,
        {
          category: TagCategoryValues.VC,
        }
      );
    }

    return hasRequiredPrivileges;
  };

  const [CreateNewSpace] = useCreateSpaceMutation({
    refetchQueries: ['MyAccount', refetchDashboardWithMembershipsQuery()],
  });

  const handleCreateSpace = async (values: VirtualContributorFromProps) => {
    if (!user?.user.id) {
      return;
    }

    setVirtualContributorInput(values);

    // in case of existing space, create subspace as BoK
    // otherwise create a new space
    if (selectedExistingSpaceId && myAccountId) {
      if (!hasPrivilegesOnSpaceAndCommunity()) {
        setStep('insufficientPrivileges');
        return;
      }
      setStep('createSpace');

      const subspace = await handleSubspaceCreation(selectedExistingSpaceId, values.name);
      setbokId(subspace?.data?.createSubspace.id);
      setBokRoleSetId(subspace?.data?.createSubspace.community.roleSet.id);
      const parentCommunityId = selectableSpaces.filter(space => space.id === selectedExistingSpaceId)[0]?.roleSetId;

      if (parentCommunityId) {
        setBoKParentRoleSetId(parentCommunityId);
      }
    } else {
      if (plans.length === 0) {
        info(`No available plans for this account. User: ${user?.user.id}`);
        notify('No available plans for this account. Please, contact support@alkem.io.', 'error');
        return;
      }
      setStep('createSpace');

      const { data: newSpace } = await CreateNewSpace({
        variables: {
          spaceData: {
            accountID: myAccountId!,
            profileData: {
              displayName: generateSpaceName(user?.user.profile.displayName!, creationIndex),
            },
            collaborationData: {
              calloutsSetData: {},
            },
          },
        },
      });

      const newlyCreatedSpaceId = newSpace?.createSpace.id;

      if (newlyCreatedSpaceId) {
        setCreatedSpaceId(newlyCreatedSpaceId);
        setCreationIndex(0);

        const subspace = await handleSubspaceCreation(newlyCreatedSpaceId, values.name);
        setbokId(subspace?.data?.createSubspace.id);
        setBokRoleSetId(subspace?.data?.createSubspace.community.roleSet.id);

        const parentCommunityData = await getSpaceCommunity();
        setBoKParentRoleSetId(parentCommunityData.data?.lookup.space?.community.roleSet.id);
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
      setBokRoleSetId(undefined);
      setBoKParentRoleSetId(undefined);
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

    handleCloseWizard();
  };

  const [getNewSpaceUrl] = useSpaceUrlLazyQuery({
    variables: {
      spaceNameId: createdSpaceId ?? selectedExistingSpaceId,
    },
  });

  const [getSpaceCommunity] = useSubspaceCommunityAndRoleSetIdLazyQuery({
    variables: {
      spaceId: createdSpaceId!,
    },
  });

  const { data: subspaceProfile } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: bokId! },
    skip: !bokId,
  });

  const calloutsSetId = subspaceProfile?.lookup.space?.collaboration?.calloutsSet.id;

  // load the following hook either with bokId (created subspace) or spaceId (created/existing space)
  const { handleCreateCallout, canCreateCallout } = useCalloutCreation({
    calloutsSetId,
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
    if (calloutData?.posts && calloutData?.posts.length > 0 && bokId) {
      const postCallout = await handleCreateCallout(calloutDetails);
      const postCalloutId = postCallout?.id;
      calloutId.current = postCalloutId;

      // add posts to collection
      if (postCalloutId) {
        const postsArray = calloutData?.posts ?? [];

        for (const post of postsArray) {
          await onCreatePost(post, postCalloutId);
        }
      }
    }

    // create collection of docs & links
    if (calloutData?.documents && calloutData?.documents.length > 0 && bokId) {
      const documentsCallout = await handleCreateCallout(calloutDocumentsDetails);
      const documentsCalloutId = documentsCallout?.id;
      calloutId.current = documentsCalloutId;

      // add documents to collection
      if (documentsCalloutId) {
        const documentsArray = calloutData?.documents ?? [];

        for (const document of documentsArray) {
          await onCreateLink(document, documentsCalloutId);
        }
      }
    }

    setTryCreateCallout(false);

    // create VC
    if (virtualContributorInput && myAccountId && bokId && bokRoleSetId) {
      const creationSuccess = await handleCreateVirtualContributor({
        values: virtualContributorInput,
        accountId: myAccountId,
        vcBoKId: bokId,
        roleSetId: bokRoleSetId,
        parentRoleSetId: boKParentRoleSetId,
      });

      if (creationSuccess) {
        const { data } = await getNewSpaceUrl();
        navigate(data?.space.profile.url ?? '');
      }
    }
  };

  const [addVirtualContributorToRole] = useAssignRoleToVirtualContributorMutation();
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: ['MyAccount', 'AccountInformation'],
  });

  const handleCreateVirtualContributor = async ({
    values,
    accountId,
    vcBoKId,
    roleSetId,
    parentRoleSetId,
  }: {
    values: VirtualContributorFromProps;
    accountId: string;
    vcBoKId: string;
    roleSetId: string;
    parentRoleSetId?: string;
  }) => {
    if (!accountId || !vcBoKId || !virtualContributorInput) {
      return;
    }

    if (!hasPrivilegesOnSpaceAndCommunity()) {
      setStep('insufficientPrivileges');
      return false;
    }
    const createdVc = await executeMutation({ values, accountId, vcBoKId });

    const virtualContributorId = createdVc?.id;

    if (virtualContributorId) {
      if (parentRoleSetId) {
        // the VC cannot be added to the BoK community
        // if it's not part of the parent community
        await addVirtualContributorToRole({
          variables: {
            roleSetId: parentRoleSetId,
            contributorId: virtualContributorId,
            role: CommunityRoleType.Member,
          },
        });
      }

      // add the VC to the BoK community
      await addVirtualContributorToRole({
        variables: {
          roleSetId: roleSetId,
          contributorId: virtualContributorId,
          role: CommunityRoleType.Member,
        },
      });

      notify(
        t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { name: values.name }),
        'success'
      );

      addVCCreationCache(createdVc.nameID);

      return true;
    }

    return false;
  };

  const executeMutation = async ({
    values,
    accountId,
    vcBoKId,
  }: {
    values: VirtualContributorFromProps;
    accountId: string;
    vcBoKId?: string;
  }) => {
    try {
      const variables: CreateVirtualContributorOnAccountMutationVariables = {
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
              engine: values.engine,
              bodyOfKnowledgeType: values.bodyOfKnowledgeType,
              bodyOfKnowledgeID: vcBoKId,
            },
          },
        },
      };

      if (values.externalConfig) {
        variables.virtualContributorData.aiPersona.aiPersonaService!.externalConfig = values.externalConfig;
      }
      const { data } = await createVirtualContributor({
        variables,
      });
      return data?.createVirtualContributor;
    } catch (error) {
      return;
    }
  };

  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeProps) => {
    if (selectedKnowledge && selectedKnowledge.roleSetId && virtualContributorInput) {
      const creationSuccess = await handleCreateVirtualContributor({
        values: virtualContributorInput,
        accountId: selectedKnowledge.accountId,
        vcBoKId: selectedKnowledge.id,
        roleSetId: selectedKnowledge.roleSetId,
        parentRoleSetId: selectedKnowledge.parentRoleSetId,
      });

      creationSuccess && navigate(selectedKnowledge.url ?? '');
    }
  };

  const handleCreateExternal = async (externalVcValues: ExternalVcFormValues) => {
    if (virtualContributorInput && myAccountId) {
      virtualContributorInput.engine = externalVcValues.engine;

      virtualContributorInput.externalConfig = {
        apiKey: externalVcValues.apiKey,
      };
      if (externalVcValues.assistantId) {
        virtualContributorInput.externalConfig.assistantId = externalVcValues.assistantId;
      }

      virtualContributorInput.bodyOfKnowledgeType = AiPersonaBodyOfKnowledgeType.None;

      const createdVc = await executeMutation({
        values: virtualContributorInput,
        accountId: myAccountId,
      });

      // navigate to VC page
      if (createdVc) {
        navigate(createdVc.profile.url);
      }
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
            onClose={handleCloseWizard}
            loading={loading}
            onCreateSpace={handleCreateSpace}
            onUseExistingKnowledge={values => onStepSelection('existingKnowledge', values)}
            onUseExternal={values => onStepSelection('externalProvider', values)}
          />
        )}
        {step === 'createSpace' && (
          <LoadingState onClose={handleCancel} entity={selectedExistingSpaceId ? 'subspace' : 'space'} />
        )}
        {step === 'addKnowledge' && virtualContributorInput && (
          <AddContent
            onClose={handleCancel}
            onCreateVC={handleAddContent}
            spaceId={createdSpaceId ?? selectedExistingSpaceId ?? ''}
          />
        )}
        {step === 'existingKnowledge' && (
          <ExistingSpace
            onClose={handleCloseWizard}
            onBack={() => setStep('initial')}
            onSubmit={handleCreateVCWithExistingKnowledge}
            availableSpaces={selectableSpaces}
            loading={loading}
          />
        )}
        {step === 'externalProvider' && (
          <CreateExternalAIDialog onCreateExternal={handleCreateExternal} onClose={handleCloseWizard} />
        )}
        {step === 'loadingVCSetup' && <SetupVCInfo />}
        {step === 'insufficientPrivileges' && (
          <InfoDialog
            entities={{
              title: t('createVirtualContributorWizard.insufficientPrivileges.title'),
              content: t('createVirtualContributorWizard.insufficientPrivileges.description'),
              buttonCaption: t('buttons.ok'),
            }}
            actions={{ onButtonClick: handleCloseWizard }}
            options={{ show: true }}
          />
        )}
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
