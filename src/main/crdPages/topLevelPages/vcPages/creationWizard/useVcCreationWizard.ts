import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchMyResourcesQuery,
  useAllSpaceSubspacesLazyQuery,
  useAssignRoleToVirtualContributorMutation,
  useCreateLinkOnCalloutMutation,
  useCreateVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
  useRefreshBodyOfKnowledgeMutation,
  useSubspaceCommunityAndRoleSetIdLazyQuery,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AiPersonaEngine,
  type CreateCalloutInput,
  RoleName,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type {
  VcWizardCreatedVc,
  VcWizardEngine,
  VcWizardSelectableSpace,
  VcWizardStep,
} from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView.types';
import {
  getDocumentCalloutRequestData,
  getPostCalloutRequestData,
} from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/AddContent/AddContentProps';
import type { UserAccountProps } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/virtualContributorProps';
import { hasReadPrivilege, type MappableSpace, mapSpaceToSelectable } from './vcCreationWizardMapper';

type LegacySpace = NonNullable<UserAccountProps['spaces']>[number] & { subspaces?: LegacySpace[] };

const ENGINE_MAP: Record<VcWizardEngine, AiPersonaEngine> = {
  expert: AiPersonaEngine.Expert,
  genericOpenai: AiPersonaEngine.GenericOpenai,
  openaiAssistant: AiPersonaEngine.OpenaiAssistant,
};

const toSelectable = (space: LegacySpace, level: 'space' | 'subspace') =>
  mapSpaceToSelectable(space as MappableSpace, level);

export type UseVcCreationWizardArgs = {
  initialAccount?: UserAccountProps;
  accountName?: string;
  /** Leave the wizard (navigate away from the route). */
  onExit: () => void;
};

export const useVcCreationWizard = ({ initialAccount, onExit }: UseVcCreationWizardArgs) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();

  const [step, setStep] = useState<VcWizardStep>('initial');
  const [identity, setIdentity] = useState({ name: '', tagline: '', description: '' });
  const [selectedPath, setSelectedPath] = useState<'writtenKnowledge' | 'existingSpace' | 'external'>();
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>();
  const [posts, setPosts] = useState([{ title: '', description: '' }]);
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
  const [externalConfig, setExternalConfig] = useState<{
    engine: VcWizardEngine;
    apiKey: string;
    assistantId: string;
  }>({ engine: 'genericOpenai', apiKey: '', assistantId: '' });
  const [createdVc, setCreatedVc] = useState<VcWizardCreatedVc>();
  const [existingSpaces, setExistingSpaces] = useState<VcWizardSelectableSpace[]>([]);
  const [subspacesLoading, setSubspacesLoading] = useState(false);

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: Boolean(initialAccount),
    fetchPolicy: 'cache-and-network',
  });

  const account = (initialAccount ?? data?.me.user?.account) as UserAccountProps | undefined;
  const myAccountId = account?.id;
  const allAccountSpaces = (account?.spaces ?? []) as LegacySpace[];
  const availableSpaces = allAccountSpaces.filter(hasReadPrivilege);
  const availableCommunities = availableSpaces.map(s => toSelectable(s, 'space'));

  const [uploadVisual] = useUploadVisualMutation();
  const uploadAvatar = async (visualID: string | undefined) => {
    if (avatarFile && visualID) {
      await uploadVisual({ variables: { file: avatarFile, uploadData: { visualID } } });
    }
  };

  const [allSpaceSubspaces] = useAllSpaceSubspacesLazyQuery();
  const loadExistingSpaces = async () => {
    setSubspacesLoading(true);
    const result: VcWizardSelectableSpace[] = [];
    for (const space of availableSpaces) {
      const sub = await allSpaceSubspaces({ variables: { spaceId: space.id } });
      const subspaces = (sub?.data?.lookup.space?.subspaces ?? []).filter(hasReadPrivilege) as LegacySpace[];
      result.push(toSelectable({ ...space, subspaces }, 'space'));
    }
    setSubspacesLoading(false);
    setExistingSpaces(result);
  };

  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: ['MyAccount', 'AccountInformation', refetchMyResourcesQuery({ accountId: myAccountId ?? '' })],
  });

  const executeVcCreation = async (opts: {
    engine: AiPersonaEngine;
    bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType;
    vcBoKId?: string;
    callouts?: CreateCalloutInput[];
    externalConfig?: { apiKey?: string; assistantId?: string };
  }) => {
    if (!myAccountId) return undefined;
    try {
      const { data: created } = await createVirtualContributor({
        variables: {
          virtualContributorData: {
            accountID: myAccountId,
            bodyOfKnowledgeType: opts.bodyOfKnowledgeType,
            bodyOfKnowledgeID: opts.vcBoKId,
            profileData: { displayName: identity.name, tagline: identity.tagline, description: identity.description },
            aiPersona: { engine: opts.engine, ...(opts.externalConfig ? { externalConfig: opts.externalConfig } : {}) },
            knowledgeBaseData: {
              calloutsSetData: { calloutsData: opts.callouts },
              profile: { displayName: identity.name },
            },
          },
        },
      });
      const vc = created?.createVirtualContributor;
      if (vc?.id) {
        notify(
          t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { name: identity.name }),
          'success'
        );
      }
      return vc;
    } catch {
      return undefined;
    }
  };

  const [refreshBoK] = useRefreshBodyOfKnowledgeMutation();
  const refreshIngestion = (vcId: string) => refreshBoK({ variables: { refreshData: { virtualContributorID: vcId } } });

  const [createLinkOnCallout] = useCreateLinkOnCalloutMutation();
  const [getSpaceCommunity] = useSubspaceCommunityAndRoleSetIdLazyQuery();
  const [assignRole] = useAssignRoleToVirtualContributorMutation();

  const addVcToCommunity = async (vcId: string, spaceId: string) => {
    const community = await getSpaceCommunity({ variables: { spaceId } });
    const roleSetId = community.data?.lookup.space?.community.roleSet.id;
    if (!roleSetId) return false;
    const result = await assignRole({ variables: { roleSetId, contributorId: vcId, role: RoleName.Member } });
    return Boolean(result.data?.assignRoleToVirtualContributor?.id);
  };

  const advanceAfterCreate = () => {
    if (allAccountSpaces.length > 0 && availableSpaces.length === 0) setStep('tryVcInfo');
    else setStep('chooseCommunity');
  };

  // ── handlers exposed to the view ──
  const onChangeIdentity = (patch: Partial<typeof identity>) => setIdentity(prev => ({ ...prev, ...patch }));
  const onUploadAvatar = (file: File) => {
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };
  const identityValid = identity.name.trim().length >= 3;

  const onSubmitInitial = () => {
    if (selectedPath === 'writtenKnowledge') setStep('addKnowledge');
    else if (selectedPath === 'existingSpace') {
      void loadExistingSpaces();
      setStep('existingKnowledge');
    } else if (selectedPath === 'external') setStep('externalProvider');
  };

  const onSubmitKnowledge = async () => {
    const callouts: CreateCalloutInput[] = [];
    const validPosts = posts.filter(p => p.title.trim().length >= 3);
    for (const post of validPosts) callouts.push(getPostCalloutRequestData(post.title, post.description));

    const docCollectionName = t('createVirtualContributorWizard.addContent.documents.initialDocuments');
    const validDocs = documents.filter(d => d.name.trim() && d.url.trim());
    if (validDocs.length > 0) callouts.push(getDocumentCalloutRequestData(docCollectionName));

    setStep('loadingStep');
    const vc = await executeVcCreation({
      engine: AiPersonaEngine.Expert,
      bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase,
      callouts,
    });
    if (!vc?.id) {
      setStep('addKnowledge');
      return;
    }
    setCreatedVc({ id: vc.id, name: identity.name, profileUrl: vc.profile?.url });
    await uploadAvatar(vc.profile?.avatar?.id);
    if (validDocs.length > 0) {
      const linkCollection = vc.knowledgeBase?.calloutsSet?.callouts?.find(
        c => c.framing.profile.displayName === docCollectionName
      );
      if (linkCollection?.id) {
        for (const doc of validDocs) {
          await createLinkOnCallout({
            variables: { calloutId: linkCollection.id, link: { uri: doc.url, profile: { displayName: doc.name } } },
          });
        }
      }
    }
    refreshIngestion(vc.id);
    advanceAfterCreate();
  };

  const onSubmitExistingSpace = async (spaceId: string) => {
    setStep('loadingStep');
    const vc = await executeVcCreation({
      engine: AiPersonaEngine.Expert,
      bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
      vcBoKId: spaceId,
    });
    if (!vc?.id) {
      setStep('existingKnowledge');
      return;
    }
    setCreatedVc({ id: vc.id, name: identity.name, profileUrl: vc.profile?.url });
    await uploadAvatar(vc.profile?.avatar?.id);
    refreshIngestion(vc.id);
    advanceAfterCreate();
  };

  const externalValid =
    externalConfig.apiKey.trim().length > 0 &&
    (externalConfig.engine !== 'openaiAssistant' || externalConfig.assistantId.trim().length > 0);

  const onSubmitExternal = async () => {
    setStep('loadingStep');
    const vc = await executeVcCreation({
      engine: ENGINE_MAP[externalConfig.engine],
      bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.None,
      externalConfig: {
        apiKey: externalConfig.apiKey,
        ...(externalConfig.assistantId ? { assistantId: externalConfig.assistantId } : {}),
      },
    });
    await uploadAvatar(vc?.profile?.avatar?.id);
    if (vc?.profile?.url) navigate(vc.profile.url);
    else onExit();
  };

  const onChooseCommunity = async (spaceId: string | undefined) => {
    if (!createdVc) return;
    if (!spaceId) {
      setStep('tryVcInfo');
      return;
    }
    setStep('loadingStep');
    const added = await addVcToCommunity(createdVc.id, spaceId);
    if (added && createdVc.profileUrl) navigate(createdVc.profileUrl);
    else setStep('tryVcInfo');
  };

  const onBack = () => setStep('initial');

  return {
    loading,
    step,
    identity,
    onChangeIdentity,
    onUploadAvatar,
    avatarPreviewUrl,
    identityValid,
    selectedPath,
    onSelectPath: setSelectedPath,
    onSubmitInitial,
    posts,
    documents,
    onChangePosts: setPosts,
    onChangeDocuments: setDocuments,
    onSubmitKnowledge,
    availableSpaces: existingSpaces,
    onSubmitExistingSpace,
    externalConfig,
    onChangeExternalConfig: (patch: Partial<typeof externalConfig>) =>
      setExternalConfig(prev => ({ ...prev, ...patch })),
    externalValid,
    onSubmitExternal,
    availableCommunities,
    onChooseCommunity,
    createdVc,
    onBack,
    onCancel: onExit,
    subspacesLoading,
  };
};
