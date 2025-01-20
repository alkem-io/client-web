import { useCallback, useMemo, useState } from 'react';
import {
  useCreateSpaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
  usePlansTableQuery,
  useSpaceUrlLazyQuery,
  useSubspaceCommunityAndRoleSetIdLazyQuery,
  useAssignRoleToVirtualContributorMutation,
  useCreateLinkOnCalloutMutation,
  useAccountSpacesLazyQuery,
  refetchMyResourcesQuery,
  useRefreshBodyOfKnowledgeMutation,
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
import ExistingSpace, { SelectableKnowledgeSpace } from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUserContext } from '@/domain/community/user';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import useNavigate from '@/core/routing/useNavigate';
import { usePlanAvailability } from '@/domain/journey/space/createSpace/plansTable/usePlanAvailability';
import { addVCCreationCache } from './vcCreationUtil';
import { info as logInfo } from '@/core/logging/sentry/log';
import CreateExternalAIDialog, { ExternalVcFormValues } from './CreateExternalAIDialog';
import { useNewVirtualContributorWizardProvided, UserAccountProps } from './useNewVirtualContributorProps';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { getSpaceUrlFromSubSpace } from '@/main/routing/urlBuilders';
import ChooseCommunity from './ChooseCommunity';
import TryVcInfo from './TryVcInfo';

const steps = {
  initial: 'initial',
  loadingStep: 'loadingStep',
  addKnowledge: 'addKnowledge',
  existingKnowledge: 'existingKnowledge',
  externalProvider: 'externalProvider',
  chooseCommunity: 'chooseCommunity',
  tryVcInfo: 'tryVcInfo',
} as const;

type Step = keyof typeof steps;

export type SelectableSpace = {
  id: string;
  profile: {
    displayName: string;
    url: string;
  };
  community: {
    roleSet: {
      id: string;
    };
  };
  subspaces?: SelectableSpace[];
};

const useNewVirtualContributorWizard = (): useNewVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const notify = useNotification();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>(steps.initial);

  const [targetAccount, setTargetAccount] = useState<UserAccountProps>();
  const [accountName, setAccountName] = useState<string>();
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps>();
  const [createdVcId, setCreatedVc] = useState<{ id: string; nameID: string }>({
    id: '',
    nameID: '',
  });

  const startWizard = (initAccount: UserAccountProps | undefined, accountName?: string) => {
    setTargetAccount(initAccount);
    setAccountName(accountName);
    setStep(steps.initial);
    setDialogOpen(true);
  };

  const onStepSelection = (step: Step, values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(step);
  };

  const handleCloseWizard = () => {
    setDialogOpen(false);
    setStep(steps.initial);
  };

  const handleCloseChooseCommunity = () => {
    setStep(steps.tryVcInfo);
  };

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: !dialogOpen || Boolean(targetAccount),
    fetchPolicy: 'cache-and-network',
  });

  const { myAccountId, accountSpaces } = useMemo(() => {
    const account = targetAccount ?? data?.me.user?.account; // contextual or self by default

    return {
      myAccountId: account?.id,
      accountSpaces: account?.spaces ?? [],
    };
  }, [data, user, targetAccount]);

  const [getAccountSpaces, { loading: availableSpacesLoading }] = useAccountSpacesLazyQuery();
  const getSelectableSpaces = useCallback(
    async (accountId: string) => {
      const spaceData = await getAccountSpaces({
        variables: {
          accountId,
        },
      });

      return spaceData?.data?.lookup.account?.spaces ?? [];
    },
    [getAccountSpaces]
  );

  // get plans data todo: make lazy, usePlanAvailability is temp
  const skipPlansQueries = Boolean(accountSpaces.length);
  const { data: plansData } = usePlansTableQuery({ skip: skipPlansQueries });
  const { isPlanAvailable } = usePlanAvailability({ skip: skipPlansQueries });

  const plans = useMemo(
    () =>
      plansData?.platform.licensingFramework.plans
        .filter(plan => plan.enabled)
        .filter(plan => plan.type === LicensingCredentialBasedPlanType.SpacePlan)
        .filter(plan => isPlanAvailable(plan))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [plansData, isPlanAvailable]
  );

  const [CreateNewSpace] = useCreateSpaceMutation({
    refetchQueries: ['MyAccount', 'AccountInformation', 'LatestContributionsSpacesFlat'],
  });

  const executeCreateSpace = async () => {
    if (plans.length === 0) {
      logInfo(`No available plans for this account. User: ${user?.user.id}`);
      notify('No available plans for this account. Please, contact support@alkem.io.', 'error');
      return;
    }

    // loading
    setStep(steps.loadingStep);

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
      return newlyCreatedSpaceId;
    }

    // TODO: in case of failure handle
  };

  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: [
      'MyAccount',
      'AccountInformation',
      refetchMyResourcesQuery({
        accountId: myAccountId ?? '',
      }),
    ],
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
  const [getSpaceCommunity] = useSubspaceCommunityAndRoleSetIdLazyQuery();

  const [addVirtualContributorToRole] = useAssignRoleToVirtualContributorMutation();

  const addVCToCommunity = async ({
    virtualContributorId,
    parentRoleSetIds = [],
    spaceId,
  }: {
    virtualContributorId: string;
    parentRoleSetIds?: string[];
    spaceId: string;
  }) => {
    if (!spaceId) {
      return false;
    }

    if (parentRoleSetIds.length > 0) {
      // the VC cannot be added to the BoK community
      // if it's not part of the parent communities
      for (const roleSetId of parentRoleSetIds) {
        await addVirtualContributorToRole({
          variables: {
            roleSetId,
            contributorId: virtualContributorId,
            role: CommunityRoleType.Member,
          },
        });
      }
    }

    const communityData = await getSpaceCommunity({
      variables: {
        spaceId,
      },
    });

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

  const notifyErrorOnAddToCommunity = () => {
    // No need to spam the user with error messages, the VC was created successfully
    console.log('Try your VC flow was skipped. Unable to add to community.');
  };

  // post creation navigation
  const [getNewSpaceUrl] = useSpaceUrlLazyQuery();
  const navigateToTryYourVC = async (url: string | undefined, spaceId: string | undefined) => {
    if (url) {
      navigate(url);
    } else {
      if (spaceId) {
        const { data } = await getNewSpaceUrl({
          variables: {
            spaceNameId: spaceId,
          },
        });
        const spaceUrl = data?.space?.profile.url;

        if (spaceUrl) {
          navigate(spaceUrl);
        }
      }
    }

    handleCloseWizard();
  };

  // ###STEP 'addKnowledge' - Add Content
  const [updateBodyOfKnowledge] = useRefreshBodyOfKnowledgeMutation();
  const refreshIngestion = (vcId: string) => {
    updateBodyOfKnowledge({
      variables: {
        refreshData: {
          virtualContributorID: vcId,
        },
      },
    });
  };

  const handleCreateKnowledge = async (values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(steps.addKnowledge);
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

    setCreatedVc(createdVC);

    if (hasDocuments) {
      const createdLinkCollection = createdVC.knowledgeBase?.calloutsSet?.callouts?.find(
        c => c.framing.profile.displayName === documentsLinkCollectionName
      );
      await addDocumentLinksToCallout(documents, createdLinkCollection?.id);
    }

    // Refresh explicitly the ingestion after callouts creation
    refreshIngestion(createdVC.id);

    setStep(steps.chooseCommunity);
  };

  // ###STEP 'chooseCommunityStep' - Choose Community
  const onChooseCommunity = async (selectedSpace: SelectableKnowledgeSpace) => {
    let spaceId: string | undefined = selectedSpace?.id;

    if (!spaceId) {
      spaceId = await executeCreateSpace();

      if (!spaceId) {
        return;
      }
    }

    const addToCommunity = await addVCToCommunity({ virtualContributorId: createdVcId.id, spaceId });

    if (addToCommunity) {
      addVCCreationCache(createdVcId.nameID);
      await navigateToTryYourVC(undefined, spaceId);
    } else {
      notifyErrorOnAddToCommunity();
      handleCloseWizard();
    }
  };

  // ###STEP 'existingKnowledge' - Existing Knowledge
  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeSpace) => {
    if (selectedKnowledge && virtualContributorInput && myAccountId) {
      const values = { ...virtualContributorInput, bodyOfKnowledgeType: AiPersonaBodyOfKnowledgeType.AlkemioSpace };

      const createdVC = await executeVcCreation({
        values,
        accountId: myAccountId,
        vcBoKId: selectedKnowledge.id,
      });

      if (!createdVC?.id) {
        return;
      }

      const addToCommunity = await addVCToCommunity({
        virtualContributorId: createdVC?.id,
        parentRoleSetIds: selectedKnowledge.parentRoleSetIds,
        spaceId: selectedKnowledge.id,
      });

      if (addToCommunity) {
        addVCCreationCache(createdVC?.nameID);
        await navigateToTryYourVC(getSpaceUrlFromSubSpace(selectedKnowledge.url ?? ''), undefined);
      } else {
        notifyErrorOnAddToCommunity();
        handleCloseWizard();
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

  const NewVirtualContributorWizard = useCallback(() => {
    if (!myAccountId) {
      return null;
    }

    return (
      <DialogWithGrid open={dialogOpen} columns={6}>
        {/* TODO: StorageConfig, instead of user here should be account */}
        <StorageConfigContextProvider userId={user?.user.id ?? ''} locationType="user">
          {step === 'initial' && (
            <CreateNewVirtualContributor
              onClose={handleCloseWizard}
              loading={loading}
              onCreateKnowledge={handleCreateKnowledge}
              onUseExistingKnowledge={values => onStepSelection('existingKnowledge', values)}
              onUseExternal={values => onStepSelection('externalProvider', values)}
            />
          )}
          {step === steps.loadingStep && <LoadingState onClose={handleCloseWizard} />}
          {step === steps.addKnowledge && virtualContributorInput && (
            <AddContent onClose={handleCloseWizard} onCreateVC={onCreateVcWithKnowledge} />
          )}
          {step === steps.chooseCommunity && (
            <ChooseCommunity
              onClose={handleCloseChooseCommunity}
              vcName={virtualContributorInput?.name}
              spaces={accountSpaces}
              onSubmit={onChooseCommunity}
              loading={loading || availableSpacesLoading}
            />
          )}
          {step === steps.tryVcInfo && (
            <TryVcInfo
              vcName={virtualContributorInput?.name ?? ''}
              vcNameId={createdVcId.nameID}
              onClose={handleCloseWizard}
            />
          )}
          {step === steps.existingKnowledge && myAccountId && (
            <ExistingSpace
              onClose={handleCloseWizard}
              onBack={() => setStep(steps.initial)}
              onSubmit={handleCreateVCWithExistingKnowledge}
              accountId={myAccountId}
              getSpaces={getSelectableSpaces}
              loading={loading || availableSpacesLoading}
            />
          )}
          {step === steps.externalProvider && (
            <CreateExternalAIDialog onCreateExternal={handleCreateExternal} onClose={handleCloseWizard} />
          )}
        </StorageConfigContextProvider>
      </DialogWithGrid>
    );
  }, [dialogOpen, step, myAccountId, getSelectableSpaces, loading, availableSpacesLoading]);

  return {
    startWizard,
    NewVirtualContributorWizard,
  };
};

export default useNewVirtualContributorWizard;
