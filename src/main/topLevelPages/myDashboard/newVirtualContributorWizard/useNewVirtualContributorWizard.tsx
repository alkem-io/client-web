import { useCallback, useMemo, useState } from 'react';
import {
  useCreateSpaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
  usePlansTableQuery,
  useSpaceUrlLazyQuery,
  useSubspaceCommunityAndRoleSetIdLazyQuery,
  useAssignRoleToVirtualContributorMutation,
  refetchDashboardWithMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AiPersonaBodyOfKnowledgeType,
  AuthorizationPrivilege,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  CommunityRoleType,
  CreateCalloutInput,
  CreateVirtualContributorOnAccountMutationVariables,
  LicensingCredentialBasedPlanType,
} from '@/core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent from './AddContent/AddContent';
import { BoKCalloutsFormValues } from './AddContent/AddContentProps';
import ExistingSpace, { SelectableKnowledgeProps } from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUserContext } from '@/domain/community/user';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import useNavigate from '@/core/routing/useNavigate';
import { usePlanAvailability } from '@/domain/journey/space/createSpace/plansTable/usePlanAvailability';
import { addVCCreationCache } from './vcCreationUtil';
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

const getPostCalloutRequestData = (title: string, description: string) => ({
  framing: {
    profile: {
      description: description,
      displayName: title,
      referencesData: [],
    },
  },
  type: CalloutType.Post,
  contributionPolicy: {
    state: CalloutState.Closed,
  },
  visibility: CalloutVisibility.Published,
  sendNotification: false,
});

const useNewVirtualContributorWizard = (): useNewVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const notify = useNotification();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>('initial');

  const [targetAccount, setTargetAccount] = useState<UserAccountProps>();
  const [createdSpaceId, setCreatedSpaceId] = useState<string>();
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps>();

  const startWizard = (initAccount: UserAccountProps | undefined) => {
    setTargetAccount(initAccount);
    setStep('initial');
    setDialogOpen(true);
  };

  const onStepSelection = (step: Step, values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(step);
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
        collaboration: {
          myPrivileges: mySpace?.community?.roleSet.authorization?.myPrivileges,
        },
      },
      selectableSpaces,
    };
  }, [data, user, targetAccount]);

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

    const { myPrivileges: myPrivilegesOnCollaboration } = spacePrivileges.collaboration;

    const hasRequiredPrivileges = myPrivilegesOnCollaboration?.includes(
      AuthorizationPrivilege.CommunityAddMemberVcFromAccount
    );

    if (!hasRequiredPrivileges) {
      logInfo(
        `Insufficient privileges to create a VC, Collaboration Privileges: ${JSON.stringify(
          myPrivilegesOnCollaboration
        )}`,
        {
          category: TagCategoryValues.VC,
        }
      );
    }

    return hasRequiredPrivileges;
  };

  const [CreateNewSpace] = useCreateSpaceMutation({
    refetchQueries: ['MyAccount', 'AccountInformation', refetchDashboardWithMembershipsQuery()],
  });

  const executeCreateSpace = async () => {
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
            displayName: generateSpaceName(user?.user.profile.displayName!),
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

      return newlyCreatedSpaceId;
    }

    // in case of failure
    setStep('addKnowledge');
  };

  const handleCreateKnowledge = async (values: VirtualContributorFromProps) => {
    if (!user?.user.id) {
      return;
    }

    setVirtualContributorInput(values);

    setStep('addKnowledge');
  };

  const [getNewSpaceUrl] = useSpaceUrlLazyQuery({
    variables: {
      spaceNameId: createdSpaceId ?? selectedExistingSpaceId,
    },
  });

  const [getSpaceCommunity] = useSubspaceCommunityAndRoleSetIdLazyQuery({
    variables: {
      spaceId: createdSpaceId ?? selectedExistingSpaceId,
    },
  });

  // const calloutDocumentsDetails: CalloutCreationType = {
  //   framing: {
  //     profile: {
  //       displayName: t('createVirtualContributorWizard.addContent.documents.initialDocuments'),
  //       description: '',
  //       referencesData: [],
  //     },
  //   },
  //   type: CalloutType.LinkCollection,
  //   contributionPolicy: {
  //     state: CalloutState.Open,
  //   },
  //   groupName: CalloutGroupName.Home,
  //   visibility: CalloutVisibility.Published,
  //   sendNotification: false,
  // };

  // const [createLinkOnCallout] = useCreateLinkOnCalloutMutation();
  // const onCreateLink = async (document: DocumentValues, calloutId: string) => {
  //   await createLinkOnCallout({
  //     variables: {
  //       input: {
  //         calloutID: calloutId,
  //         link: {
  //           uri: document.url,
  //           profile: {
  //             displayName: document.name,
  //           },
  //         },
  //       },
  //     },
  //   });
  // };

  const navigateToTryYourVC = async (url?: string) => {
    const { data } = await getNewSpaceUrl();

    navigate(url ?? data?.space?.profile?.url ?? '');
  };

  const onCreateVcWithKnowledge = async (values: BoKCalloutsFormValues) => {
    const callouts: Array<CreateCalloutInput> = [];

    if (!virtualContributorInput || !myAccountId) {
      return;
    }

    // create collection of posts
    if (values?.posts && values?.posts.length > 0) {
      const postsArray = values?.posts ?? [];

      for (const post of postsArray) {
        callouts.push(getPostCalloutRequestData(post.title, post.description));
      }
    }

    // create collection of docs & links
    // if (calloutData?.documents && calloutData?.documents.length > 0 && bokId) {
    //   const documentsCallout = await handleCreateCallout(calloutDocumentsDetails);
    //   const documentsCalloutId = documentsCallout?.id;
    //   calloutId.current = documentsCalloutId;
    //
    //   // add documents to collection
    //   if (documentsCalloutId) {
    //     const documentsArray = calloutData?.documents ?? [];
    //
    //     for (const document of documentsArray) {
    //       await onCreateLink(document, documentsCalloutId);
    //     }
    //   }
    // }

    // create the VC
    const createdVC = await executeVcCreation({
      values: virtualContributorInput,
      accountId: myAccountId,
      callouts,
    });

    // TODO: after VC creation:
    // 1. document and links to the collection;
    // 2. reingest the VC?
    // 3. new Step - do you want ot add your VC to community?
    // 3.1. create space here (if needed)
    // 4. navigate to Space page or to the VC profile.

    if (!createdVC?.id) {
      return;
    }

    // create a space if no space is available under the account
    if (!selectedExistingSpaceId) {
      const spaceId = await executeCreateSpace();

      if (!spaceId) {
        return;
      }
    }

    const addToCommunity = await addVCToCommunity(createdVC?.id);

    if (addToCommunity) {
      addVCCreationCache(createdVC?.nameID);
      await navigateToTryYourVC();
    }
  };

  const [addVirtualContributorToRole] = useAssignRoleToVirtualContributorMutation();
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: ['MyAccount', 'AccountInformation'],
  });

  const addVCToCommunity = async (virtualContributorId: string, parentRoleSetId?: string) => {
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
    const communityData = await getSpaceCommunity();
    const roleSetId = communityData.data?.lookup.space?.community.roleSet.id;
    if (!roleSetId) {
      return false;
    }

    const addToCommunityResult = await addVirtualContributorToRole({
      variables: {
        roleSetId,
        contributorId: virtualContributorId,
        role: CommunityRoleType.Member,
      },
    });

    return Boolean(addToCommunityResult.data?.assignRoleToVirtualContributor?.id);
  };

  const executeVcCreation = async ({
    values,
    accountId,
    vcBoKId,
    callouts,
  }: {
    values: VirtualContributorFromProps;
    accountId: string;
    vcBoKId?: string;
    callouts?: Array<CreateCalloutInput>;
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
              bodyOfKnowledgeType: values.bodyOfKnowledgeType ?? AiPersonaBodyOfKnowledgeType.AlkemioKnowledgeBase,
              bodyOfKnowledgeID: vcBoKId ?? createdSpaceId ?? selectedExistingSpaceId,
            },
          },
          knowledgeBaseData: {
            calloutsSetData: {
              calloutsData: callouts,
            },
            profile: {
              displayName: values.name,
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

      if (data?.createVirtualContributor?.id) {
        notify(
          t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { name: values.name }),
          'success'
        );
      }

      return data?.createVirtualContributor;
    } catch (error) {
      return;
    }
  };

  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeProps) => {
    if (!hasPrivilegesOnSpaceAndCommunity()) {
      setStep('insufficientPrivileges');
      return undefined;
    }

    if (selectedKnowledge && virtualContributorInput) {
      const createdVC = await executeVcCreation({
        values: virtualContributorInput,
        accountId: selectedKnowledge.accountId,
        vcBoKId: selectedKnowledge.id,
      });

      if (!createdVC?.id) {
        return;
      }

      const addToCommunity = await addVCToCommunity(createdVC?.id, selectedKnowledge.parentRoleSetId);

      if (addToCommunity) {
        addVCCreationCache(createdVC?.nameID);
        await navigateToTryYourVC(selectedKnowledge.url);
      }
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

      const createdVc = await executeVcCreation({
        values: virtualContributorInput,
        accountId: myAccountId,
      });

      // navigate to VC page
      if (createdVc) {
        navigate(createdVc.profile.url);
      }
    }
  };

  const NewVirtualContributorWizard = useCallback(
    () => (
      <DialogWithGrid open={dialogOpen} columns={6}>
        {step === 'initial' && (
          <CreateNewVirtualContributor
            onClose={handleCloseWizard}
            loading={loading}
            onCreateKnowledge={handleCreateKnowledge}
            onUseExistingKnowledge={values => onStepSelection('existingKnowledge', values)}
            onUseExternal={values => onStepSelection('externalProvider', values)}
          />
        )}
        {step === 'createSpace' && (
          <LoadingState onClose={handleCloseWizard} entity={selectedExistingSpaceId ? 'subspace' : 'space'} />
        )}
        {step === 'addKnowledge' && virtualContributorInput && (
          <AddContent
            onClose={handleCloseWizard}
            onCreateVC={onCreateVcWithKnowledge}
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
