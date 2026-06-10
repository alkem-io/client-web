import { useState } from 'react';
import { VCCreationWizardView } from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView';
import type {
  VcWizardCreatedVc,
  VcWizardDocument,
  VcWizardExternalConfig,
  VcWizardIdentityValues,
  VcWizardPath,
  VcWizardPost,
  VcWizardStep,
} from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView.types';
import { MOCK_WIZARD_CREATED_VC, MOCK_WIZARD_SELECTABLE_SPACES } from '../data/virtualContributors';

const STEP_FOR_PATH: Record<VcWizardPath, VcWizardStep> = {
  writtenKnowledge: 'addKnowledge',
  existingSpace: 'existingKnowledge',
  external: 'externalProvider',
};

/** Sample post pre-filled on the add-knowledge step — mirrors the MUI wizard's
 *  example text so the markdown editor opens with structured demo content. */
const EXAMPLE_POST: VcWizardPost = {
  title: 'Example: About Alkemio',
  description:
    'Tip: Create a structured and specific text, for example:\n\n' +
    '**Background**\n\n' +
    'Alkemio, founded in 2020, was born out of frustration with slow progress on societal ' +
    'challenges and a recognition of the many fast-moving problems we face daily.\n\n' +
    '**Governance**\n\n' +
    'To maintain trust and realize our long-term vision, we have adopted Steward Ownership as our ' +
    'core group structure.',
};

/**
 * Demo: full-page CRD VC creation wizard. Holds the step machine + form values
 * in local state, wires every path (written-knowledge / existing-space /
 * external) through to the choose-community step and the final "try the VC"
 * info step against mock data. All side-effecting callbacks console.log.
 */
export function VCCreationWizardDemoPage() {
  const [step, setStep] = useState<VcWizardStep>('initial');
  const [identity, setIdentity] = useState<VcWizardIdentityValues>({ name: '', tagline: '', description: '' });
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(undefined);
  const [selectedPath, setSelectedPath] = useState<VcWizardPath | undefined>(undefined);
  const [posts, setPosts] = useState<VcWizardPost[]>([EXAMPLE_POST]);
  const [documents, setDocuments] = useState<VcWizardDocument[]>([]);
  const [externalConfig, setExternalConfig] = useState<VcWizardExternalConfig>({
    engine: 'genericOpenai',
    apiKey: '',
    assistantId: '',
  });
  const [createdVc, setCreatedVc] = useState<VcWizardCreatedVc | undefined>(undefined);

  const identityValid = identity.name.trim().length >= 3;
  const externalValid =
    externalConfig.apiKey.trim().length > 0 &&
    (externalConfig.engine !== 'openaiAssistant' || externalConfig.assistantId.trim().length > 0);

  const goToCommunity = () => setStep('chooseCommunity');

  const finish = (communitySpaceId: string | undefined) => {
    console.log('Demo: create VC; add to community', communitySpaceId);
    setCreatedVc(MOCK_WIZARD_CREATED_VC);
    setStep('tryVcInfo');
  };

  const reset = () => {
    setStep('initial');
    setIdentity({ name: '', tagline: '', description: '' });
    setAvatarPreviewUrl(undefined);
    setSelectedPath(undefined);
    setPosts([{ title: '', description: '' }]);
    setDocuments([]);
    setExternalConfig({ engine: 'genericOpenai', apiKey: '', assistantId: '' });
    setCreatedVc(undefined);
  };

  return (
    <VCCreationWizardView
      step={step}
      loading={false}
      identity={identity}
      onChangeIdentity={patch => setIdentity(prev => ({ ...prev, ...patch }))}
      onUploadAvatar={file => {
        console.log('Demo: upload avatar', file.name);
        setAvatarPreviewUrl(URL.createObjectURL(file));
      }}
      avatarPreviewUrl={avatarPreviewUrl}
      identityValid={identityValid}
      selectedPath={selectedPath}
      onSelectPath={setSelectedPath}
      onSubmitInitial={() => selectedPath && setStep(STEP_FOR_PATH[selectedPath])}
      posts={posts}
      documents={documents}
      onChangePosts={setPosts}
      onChangeDocuments={setDocuments}
      onSubmitKnowledge={goToCommunity}
      availableSpaces={MOCK_WIZARD_SELECTABLE_SPACES}
      onSubmitExistingSpace={spaceId => {
        console.log('Demo: chosen Body of Knowledge space', spaceId);
        goToCommunity();
      }}
      externalConfig={externalConfig}
      onChangeExternalConfig={patch => setExternalConfig(prev => ({ ...prev, ...patch }))}
      externalValid={externalValid}
      onSubmitExternal={goToCommunity}
      availableCommunities={MOCK_WIZARD_SELECTABLE_SPACES}
      onChooseCommunity={finish}
      createdVc={createdVc}
      onBack={() => setStep('initial')}
      onCancel={reset}
    />
  );
}
