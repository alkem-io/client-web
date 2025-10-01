import { useCallback, useMemo, useState } from 'react';
import {
  useCreateSpaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
  useSubspaceCommunityAndRoleSetIdLazyQuery,
  useAssignRoleToVirtualContributorMutation,
  useCreateLinkOnCalloutMutation,
  useAllSpaceSubspacesLazyQuery,
  refetchMyResourcesQuery,
  useRefreshBodyOfKnowledgeMutation,
  useUploadVisualMutation,
  useSpaceAboutBaseLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  VirtualContributorBodyOfKnowledgeType,
  AuthorizationPrivilege,
  RoleName,
  CreateCalloutInput,
  CreateVirtualContributorOnAccountMutationVariables,
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
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import useNavigate from '@/core/routing/useNavigate';
import { addVCCreationCache } from './TryVC/utils';
import CreateExternalAIDialog, { ExternalVcFormValues } from './CreateExternalAIDialog';
import { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';
import { useVirtualContributorWizardProvided, UserAccountProps } from './virtualContributorProps';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import ChooseCommunity from './ChooseCommunity';
import TryVcInfo from './TryVC/TryVcInfo';
import { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

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
  authorization?: {
    myPrivileges?: string[];
  };
  about: SpaceAboutMinimalUrlModel;
  subspaces?: SelectableSpace[];
};

const useVirtualContributorWizard = (): useVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const notify = useNotification();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>(steps.initial);

  const [targetAccount, setTargetAccount] = useState<UserAccountProps>();
  const [accountName, setAccountName] = useState<string>();
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps>();

  const [createdVc, setCreatedVc] = useState<
    { id: string; profile: { url: string; avatar?: { id: string } } } | undefined
  >();
  const [availableExistingSpaces, setAvailableExistingSpaces] = useState<SelectableSpace[]>([]);
  const [availableExistingSpacesLoading, setAvailableExistingSpacesLoading] = useState(false);

  const [avatar, setAvatar] = useState<VisualUploadModel>();

  const [uploadVisual] = useUploadVisualMutation({
    onError: () => notify(t('components.visual-upload.error'), 'error'),
    onCompleted: () => notify(t('components.visual-upload.success'), 'success'),
  });

  const uploadAvatar = useCallback(async (avatar: VisualUploadModel | undefined, visualID: string | undefined) => {
    if (avatar?.file && visualID) {
      await uploadVisual({
        variables: {
          file: avatar?.file,
          uploadData: {
            visualID,
            alternativeText: avatar.altText,
          },
        },
      });
    }
  }, []);

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

  const hasReadPrivilege = (space: SelectableSpace) => {
    return space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);
  };

  const { myAccountId, allAccountSpaces, availableSpaces } = useMemo(() => {
    const account = targetAccount ?? data?.me.user?.account; // contextual or self by default
    const accountSpaces: SelectableSpace[] = account?.spaces ?? [];

    return {
      myAccountId: account?.id,
      allAccountSpaces: accountSpaces,
      availableSpaces: accountSpaces.filter(hasReadPrivilege),
    };
  }, [data, userModel, targetAccount]);

  const [allSpaceSubspaces] = useAllSpaceSubspacesLazyQuery();
  // For all the available spaces get their subspaces (and their subspaces)
  // then filter them as well and
  const getSelectableSpaces = useCallback(async () => {
    setAvailableExistingSpacesLoading(true);
    const result: SelectableSpace[] = [];

    for (const space of availableSpaces) {
      const subspaceData = await allSpaceSubspaces({
        variables: {
          spaceId: space.id,
        },
      });
      const availableSubspaces = subspaceData?.data?.lookup.space?.subspaces?.filter(hasReadPrivilege) ?? [];

      result.push({
        ...space,
        subspaces: availableSubspaces,
      });
    }

    setAvailableExistingSpacesLoading(false);
    setAvailableExistingSpaces(result);
  }, [allSpaceSubspaces, availableSpaces]);

  const [CreateNewSpace] = useCreateSpaceMutation({
    refetchQueries: ['MyAccount', 'AccountInformation', 'LatestContributionsSpacesFlat'],
  });

  const executeCreateSpace = async () => {
    // loading
    setStep(steps.loadingStep);

    const { data: newSpace } = await CreateNewSpace({
      variables: {
        spaceData: {
          accountID: myAccountId!,
          about: {
            profileData: {
              displayName: `${accountName || userModel?.profile.displayName} - ${t('common.space')}`,
            },
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
          bodyOfKnowledgeType: values.bodyOfKnowledgeType,
          bodyOfKnowledgeID: vcBoKId,
          profileData: {
            displayName: values.name,
            tagline: values.tagline,
            description: values.description,
          },
          aiPersona: {
            engine: values.engine,
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
        variables.virtualContributorData.aiPersona.externalConfig = values.externalConfig;
      }
      const { data } = await createVirtualContributor({ variables });

      if (data?.createVirtualContributor?.id) {
        notify(
          t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { name: values.name }),
          'success'
        );
      }

      return data?.createVirtualContributor;
    } catch (_error) {
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
            role: RoleName.Member,
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
        role: RoleName.Member,
      },
    });

    return Boolean(addToCommunityResult.data?.assignRoleToVirtualContributor?.id);
  };

  const notifyErrorOnAddToCommunity = () => {
    // No need to spam the user with error messages, the VC was created successfully
    console.warn('Try your VC flow was skipped. Unable to add to community.');
  };

  // post creation navigation
  const [getNewSpaceUrl] = useSpaceAboutBaseLazyQuery();
  const navigateToTryYourVC = async (url: string | undefined, spaceId: string | undefined) => {
    if (url) {
      navigate(url);
    } else {
      if (spaceId) {
        const { data } = await getNewSpaceUrl({
          variables: {
            spaceId,
          },
        });
        const spaceUrl = data?.lookup.space?.about.profile.url;

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
        calloutId,
        link: {
          uri: document.url,
          profile: {
            displayName: document.name,
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
    const createdVCData = await executeVcCreation({
      values: virtualContributorInput,
      accountId: myAccountId,
      callouts,
    });

    if (!createdVCData?.id) {
      return;
    }

    setCreatedVc(createdVCData);

    await uploadAvatar(avatar, createdVCData?.profile?.avatar?.id);

    if (hasDocuments) {
      const createdLinkCollection = createdVCData.knowledgeBase?.calloutsSet?.callouts?.find(
        c => c.framing.profile.displayName === documentsLinkCollectionName
      );
      await addDocumentLinksToCallout(documents, createdLinkCollection?.id);
    }

    refreshIngestion(createdVCData.id);
    setChooseCommunityStep();
  };

  // ###STEP 'chooseCommunityStep' - Choose Community
  const onChooseCommunity = async (selectedSpace: SelectableKnowledgeSpace) => {
    let spaceId: string | undefined = selectedSpace?.id;
    if (!createdVc) {
      return;
    }
    if (!spaceId) {
      spaceId = await executeCreateSpace();

      if (!spaceId) {
        return;
      }
    }

    const addToCommunity = await addVCToCommunity({ virtualContributorId: createdVc.id, spaceId });

    if (addToCommunity) {
      addVCCreationCache(createdVc.id);
      await navigateToTryYourVC(undefined, spaceId);
    } else {
      notifyErrorOnAddToCommunity();
      handleCloseWizard();
    }
  };

  // If there are spaces under the account, but there are no spaces with the privilege to add a VC
  // navigate to the try info VC step
  // otherwise, navigate to the choose community step
  const setChooseCommunityStep = () => {
    if (allAccountSpaces.length > 0 && availableSpaces.length === 0) {
      setStep(steps.tryVcInfo);
    } else {
      setStep(steps.chooseCommunity);
    }
  };

  // ###STEP 'existingKnowledge' - Existing Knowledge
  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeSpace) => {
    if (selectedKnowledge && virtualContributorInput && myAccountId) {
      const values = {
        ...virtualContributorInput,
        bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
      };

      const createdVC = await executeVcCreation({
        values,
        accountId: myAccountId,
        vcBoKId: selectedKnowledge.id,
      });

      if (!createdVC?.id) {
        return;
      }

      setCreatedVc(createdVC);

      await uploadAvatar(avatar, createdVC?.profile?.avatar?.id);

      refreshIngestion(createdVC.id);
      setChooseCommunityStep();
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

      virtualContributorInput.bodyOfKnowledgeType = VirtualContributorBodyOfKnowledgeType.None;

      const createdVc = await executeVcCreation({
        values: virtualContributorInput,
        accountId: myAccountId,
      });

      await uploadAvatar(avatar, createdVc?.profile?.avatar?.id);

      // navigate to VC page
      if (createdVc) {
        navigate(createdVc.profile.url);
      }
    }
  };

  const VirtualContributorWizard = useCallback(() => {
    if (!myAccountId) {
      return null;
    }

    return (
      <DialogWithGrid
        open={dialogOpen}
        columns={6}
        aria-labelledby="virtual-contributor-wizard"
        onClose={handleCloseWizard}
      >
        <StorageConfigContextProvider accountId={myAccountId} locationType="account">
          {step === 'initial' && (
            <CreateNewVirtualContributor
              titleId="virtual-contributor-wizard"
              onClose={handleCloseWizard}
              loading={loading}
              onCreateKnowledge={handleCreateKnowledge}
              onUseExistingKnowledge={values => {
                getSelectableSpaces();
                onStepSelection('existingKnowledge', values);
              }}
              onUseExternal={values => onStepSelection('externalProvider', values)}
              onChangeAvatar={setAvatar}
            />
          )}
          {step === steps.loadingStep && (
            <LoadingState titleId="virtual-contributor-wizard" onClose={handleCloseWizard} />
          )}
          {step === steps.addKnowledge && virtualContributorInput && (
            <AddContent
              titleId="virtual-contributor-wizard"
              onClose={handleCloseWizard}
              onCreateVC={onCreateVcWithKnowledge}
            />
          )}
          {step === steps.chooseCommunity && (
            <ChooseCommunity
              titleId="virtual-contributor-wizard"
              onClose={handleCloseChooseCommunity}
              vcName={virtualContributorInput?.name}
              spaces={availableSpaces}
              onSubmit={onChooseCommunity}
              loading={loading}
            />
          )}
          {step === steps.tryVcInfo && (
            <TryVcInfo
              titleId="virtual-contributor-wizard"
              vcName={virtualContributorInput?.name ?? ''}
              url={createdVc?.profile.url}
              onClose={handleCloseWizard}
            />
          )}
          {step === steps.existingKnowledge && (
            <ExistingSpace
              titleId="virtual-contributor-wizard"
              onClose={handleCloseWizard}
              onBack={() => setStep(steps.initial)}
              spaces={availableExistingSpaces}
              onSubmit={handleCreateVCWithExistingKnowledge}
              loading={loading || availableExistingSpacesLoading}
            />
          )}
          {step === steps.externalProvider && (
            <CreateExternalAIDialog
              titleId="virtual-contributor-wizard"
              onCreateExternal={handleCreateExternal}
              onClose={handleCloseWizard}
            />
          )}
        </StorageConfigContextProvider>
      </DialogWithGrid>
    );
  }, [
    dialogOpen,
    step,
    myAccountId,
    loading,
    availableExistingSpacesLoading,
    getSelectableSpaces,
    availableExistingSpaces,
  ]);

  return {
    startWizard,
    VirtualContributorWizard,
  };
};

export default useVirtualContributorWizard;
