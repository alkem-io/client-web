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
  useCreateLinkOnCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AiPersonaBodyOfKnowledgeType,
  CommunityRoleType,
  CreateCalloutInput,
  CreateVirtualContributorOnAccountMutationVariables,
  LicensingCredentialBasedPlanType,
} from '@/core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent from './AddContent/AddContent';
import {
  BoKCalloutsFormValues,
  DocumentValues,
  getDocumentCalloutRequestData,
  getPostCalloutRequestData,
} from './AddContent/AddContentProps';
import ExistingSpace, { SelectableKnowledgeProps } from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUserContext } from '@/domain/community/user';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import useNavigate from '@/core/routing/useNavigate';
import { usePlanAvailability } from '@/domain/journey/space/createSpace/plansTable/usePlanAvailability';
import { addVCCreationCache } from './vcCreationUtil';
import SetupVCInfo from './SetupVCInfo';
import { info as logInfo } from '@/core/logging/sentry/log';
import { compact } from 'lodash';
import InfoDialog from '@/core/ui/dialogs/InfoDialog';
import CreateExternalAIDialog, { ExternalVcFormValues } from './CreateExternalAIDialog';
import { useNewVirtualContributorWizardProvided, UserAccountProps } from './useNewVirtualContributorProps';

type Step =
  | 'initial'
  | 'createSpace'
  | 'addKnowledge'
  | 'existingKnowledge'
  | 'externalProvider'
  | 'loadingVCSetup'
  | 'insufficientPrivileges'; // not used ATM

const useNewVirtualContributorWizard = (): useNewVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const notify = useNotification();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>('initial');

  const [targetAccount, setTargetAccount] = useState<UserAccountProps>();
  const [accountName, setAccountName] = useState<string>();
  const [createdSpaceId, setCreatedSpaceId] = useState<string>();
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps>();

  const startWizard = (initAccount: UserAccountProps | undefined, accountName?: string) => {
    setTargetAccount(initAccount);
    setAccountName(accountName);
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
  const { selectedExistingSpaceId, myAccountId, selectableSpaces } = useMemo(() => {
    const account = targetAccount ?? data?.me.user?.account; // contextual or self by default
    const accountId = account?.id;
    const mySpaces = compact(account?.spaces);
    const mySpace = mySpaces?.[0]; // TODO: auto-selecting the first space, not ideal
    let selectableSpaces: SelectableKnowledgeProps[] = [];

    if (accountId) {
      account?.spaces?.forEach(space => {
        if (space) {
          selectableSpaces.push({
            id: space.id,
            name: `${space.profile.displayName} (${t('common.space')})`,
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
      selectableSpaces,
    };
  }, [data, user, targetAccount]);

  // get plans data in case there's no space under the account
  const { data: plansData } = usePlansTableQuery({ skip: Boolean(selectedExistingSpaceId) });
  const { isPlanAvailable } = usePlanAvailability({ skip: Boolean(selectedExistingSpaceId) });

  const plans = useMemo(
    () =>
      plansData?.platform.licensingFramework.plans
        .filter(plan => plan.enabled)
        .filter(plan => plan.type === LicensingCredentialBasedPlanType.SpacePlan)
        .filter(plan => isPlanAvailable(plan))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [plansData, isPlanAvailable]
  );

  // TODO: review both the privileges and the space as it's preselected no matter the user selection
  // const hasPrivilegesOnSpaceAndCommunity = () => {
  //   // in case of clean creation, the user is an admin of the space
  //   // no way and need to check the privileges
  //   if (!selectedExistingSpaceId) {
  //     return true;
  //   }
  //
  //   const { myPrivileges: myPrivilegesOnCollaboration } = spacePrivileges.collaboration;
  //
  //   const hasRequiredPrivileges = myPrivilegesOnCollaboration?.includes(
  //     AuthorizationPrivilege.CommunityAddMemberVcFromAccount
  //   );
  //
  //   if (!hasRequiredPrivileges) {
  //     logInfo(
  //       `Insufficient privileges to create a VC, Collaboration Privileges: ${JSON.stringify(
  //         myPrivilegesOnCollaboration
  //       )}`,
  //       {
  //         category: TagCategoryValues.VC,
  //       }
  //     );
  //   }
  //
  //   return hasRequiredPrivileges;
  // };

  const [CreateNewSpace] = useCreateSpaceMutation({
    refetchQueries: ['MyAccount', 'AccountInformation', refetchDashboardWithMembershipsQuery()],
  });

  const executeCreateSpace = async () => {
    if (plans.length === 0) {
      logInfo(`No available plans for this account. User: ${user?.user.id}`);
      notify('No available plans for this account. Please, contact support@alkem.io.', 'error');
      return;
    }

    // loading
    setStep('createSpace');

    const { data: newSpace } = await CreateNewSpace({
      variables: {
        spaceData: {
          accountID: myAccountId!,
          profileData: {
            displayName: `${accountName || user?.user.profile.displayName} - ${t('common.space')}`,
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

  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: ['MyAccount', 'AccountInformation'],
  });

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
              bodyOfKnowledgeType: values.bodyOfKnowledgeType,
              bodyOfKnowledgeID: vcBoKId,
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

  // Add To Community
  const [getSpaceCommunity] = useSubspaceCommunityAndRoleSetIdLazyQuery({
    variables: {
      spaceId: createdSpaceId ?? selectedExistingSpaceId,
    },
  });

  const [addVirtualContributorToRole] = useAssignRoleToVirtualContributorMutation();

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

  // post creation navigation
  const [getNewSpaceUrl] = useSpaceUrlLazyQuery({
    variables: {
      spaceNameId: createdSpaceId ?? selectedExistingSpaceId,
    },
  });

  const navigateToTryYourVC = async (url?: string) => {
    const { data } = await getNewSpaceUrl();

    navigate(url ?? data?.space?.profile?.url ?? '');
  };

  // ###STEP 'addKnowledge' - Add Content
  const handleCreateKnowledge = async (values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep('addKnowledge');
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

  const addDocumentLinksToCallout = async (documents: DocumentValues[], calloutId: string | undefined) => {
    if (calloutId) {
      for (const doc of documents) {
        await onCreateLink(doc, calloutId);
      }
    }
  };

  const onCreateVcWithKnowledge = async (values: BoKCalloutsFormValues) => {
    const callouts: Array<CreateCalloutInput> = [];
    const documents: Array<DocumentValues> = [];
    const documentsLinkCollectionName = t('createVirtualContributorWizard.addContent.documents.initialDocuments');
    const hasDocuments = values?.documents && values?.documents.length > 0;

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
    if (hasDocuments) {
      callouts.push(getDocumentCalloutRequestData(documentsLinkCollectionName));

      const documentsArray = values?.documents ?? [];

      for (const doc of documentsArray) {
        documents.push(doc);
      }
    }

    // create the VC
    const createdVC = await executeVcCreation({
      values: virtualContributorInput,
      accountId: myAccountId,
      callouts,
    });

    if (!createdVC?.id) {
      return;
    }

    if (hasDocuments) {
      const createdLinkCollection = createdVC.knowledgeBase?.calloutsSet?.callouts?.find(
        c => c.framing.profile.displayName === documentsLinkCollectionName
      );
      await addDocumentLinksToCallout(documents, createdLinkCollection?.id);
    }

    // TODO: after the VC creation:
    // 1. reingest the VC in case of documents?
    // 2. New Step - do you want ot add your VC to community? (instead of auto-adding)

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

  // ###STEP 'existingKnowledge' - Existing Knowledge
  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeProps) => {
    if (selectedKnowledge && virtualContributorInput) {
      const values = { ...virtualContributorInput, bodyOfKnowledgeType: AiPersonaBodyOfKnowledgeType.AlkemioSpace };

      const createdVC = await executeVcCreation({
        values,
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

  // ###STEP 'externalProvider' - External VC
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
        {step === 'createSpace' && <LoadingState onClose={handleCloseWizard} />}
        {step === 'addKnowledge' && virtualContributorInput && (
          <AddContent
            onClose={handleCloseWizard}
            onCreateVC={onCreateVcWithKnowledge}
            spaceId={selectedExistingSpaceId ?? ''}
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
    [dialogOpen, step, loading, selectableSpaces, selectedExistingSpaceId]
  );

  return {
    startWizard,
    NewVirtualContributorWizard,
  };
};

export default useNewVirtualContributorWizard;
