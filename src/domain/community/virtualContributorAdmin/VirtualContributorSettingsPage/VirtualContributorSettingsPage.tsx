import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { AiPersonaEngine, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import BodyOfKnowledgeManagement from '../components/BodyOfKnowledgeManagement';
import ExternalConfig from '../components/ExternalConfig';
import { PromptConfig } from '../components/PromptConfig';
import { PromptGraphConfig } from '../components/promptGraph';
import VisibilityForm from '../components/VisibilityForm';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';

const VirtualContributorSettingsPage = () => {
  const { vcId } = useUrlResolver();
  const { data } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  const { platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();

  const vc = data?.lookup.virtualContributor;

  const isPlatformAdmin = userWrapper?.hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

  const isExternalConfigAvailable = [
    AiPersonaEngine.LibraFlow,
    AiPersonaEngine.OpenaiAssistant,
    AiPersonaEngine.GenericOpenai,
  ].includes(vc?.aiPersona?.engine!);

  const isPromptConfigAvailable = [AiPersonaEngine.GenericOpenai, AiPersonaEngine.LibraFlow].includes(
    vc?.aiPersona?.engine!
  );

  const canShowPromptGraphSection =
    vc?.aiPersona?.engine === AiPersonaEngine.Expert &&
    (isPlatformAdmin || vc.platformSettings?.promptGraphEditingEnabled);

  if (!vc || !vc.aiPersona || !vc.profile) {
    return null;
  }

  const vcWithProfile = { ...vc, profile: vc.profile, aiPersona: vc.aiPersona };

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={vc?.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <VisibilityForm vc={vcWithProfile} />
        <BodyOfKnowledgeManagement vc={vcWithProfile} />
        {canShowPromptGraphSection && <PromptGraphConfig vc={vcWithProfile} isPlatformAdmin={!!isPlatformAdmin} />}
        {isPromptConfigAvailable && <PromptConfig vc={vcWithProfile} />}
        {isExternalConfigAvailable && <ExternalConfig vc={vcWithProfile} />}
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VirtualContributorSettingsPage;
