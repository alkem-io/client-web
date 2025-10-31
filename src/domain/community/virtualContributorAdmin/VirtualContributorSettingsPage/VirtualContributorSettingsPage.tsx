import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import VisibilityForm from '../components/VisibilityForm';
import BodyOfKnowledgeManagement from '../components/BodyOfKnowledgeManagement';
import { PromptGraphConfig } from '../components/promptGraph';
import { PromptConfig } from '../components/PromptConfig';
import ExternalConfig from '../components/ExternalConfig';
import { AiPersonaEngine, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';

const VirtualContributorSettingsPage = () => {
  const { vcId } = useUrlResolver();
  const { data } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  const { platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();

  const vc = data?.lookup.virtualContributor;

  const isExternalConfigAvailable = [
    AiPersonaEngine.LibraFlow,
    AiPersonaEngine.OpenaiAssistant,
    AiPersonaEngine.GenericOpenai,
  ].includes(vc?.aiPersona?.engine!);

  const isPromptConfigAvailable = [AiPersonaEngine.GenericOpenai, AiPersonaEngine.LibraFlow].includes(
    vc?.aiPersona?.engine!
  );

  const isPromptGraphConfighAvailable =
    userWrapper?.hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin) &&
    vc?.aiPersona?.engine === AiPersonaEngine.Expert;

  if (!vc || !vc.aiPersona) {
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={vc?.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <VisibilityForm vc={vc} />
        <BodyOfKnowledgeManagement vc={vc} />
        {isPromptGraphConfighAvailable && <PromptGraphConfig vc={vc} />}
        {isPromptConfigAvailable && <PromptConfig vc={vc} />}
        {isExternalConfigAvailable && <ExternalConfig vc={vc} />}
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VirtualContributorSettingsPage;
