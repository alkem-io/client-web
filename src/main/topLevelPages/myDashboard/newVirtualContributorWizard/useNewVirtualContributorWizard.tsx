import { Dialog } from '@mui/material';
import { ComponentType, useCallback, useMemo, useState } from 'react';
import CreateNewVirtualContributorStep0 from './CreateNewVirtualContributorStep0';
import CreateSubspaceStep1 from './CreateSubspaceStep1';
import ChooseSubspaceStep1b from './ChooseSubspaceStep1b';
import {
  useAddVirtualContributorToCommunityMutation,
  useAssignCommunityRoleToVirtualContributorMutation,
  useCreateSubspaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  CommunityRole,
  NewVirtualContributorMySpacesQuery,
  SpaceType,
} from '../../../../core/apollo/generated/graphql-schema';
import NameVirtualContributorStep2 from './NameVirtualContributorStep2';
import WhatsNextStep3 from './WhatsNextStep3';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUserContext } from '../../../../domain/community/user';

enum Step {
  step0,
  step1,
  step1b,
  step2,
  step3,
}

interface SelectedSubspace {
  id: string;
  profile: {
    displayName: string;
    url: string;
  };
  community: {
    id: string;
  };
}

interface useNewVirtualContributorWizardProvided {
  startWizard: () => void;
  NewVirtualContributorWizard: ComponentType<NewVirtualContributorWizardProps>;
}

interface NewVirtualContributorWizardProps {}

const useNewVirtualContributorWizard = (): useNewVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { user } = useUserContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>(Step.step0);
  const onDialogClose = () => {
    setDialogOpen(false);
    setStep(Step.step0);
  };

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: !dialogOpen,
  });

  const findMySpace = (
    userId: string | undefined,
    mySpaces: NewVirtualContributorMySpacesQuery['me']['mySpaces'] | undefined
  ) => {
    if (!userId || !mySpaces) {
      return undefined;
    }
    const spacesHostedByUser = mySpaces.filter(space => space.space.account.host?.id === userId);
    if (spacesHostedByUser.length > 0) {
      return spacesHostedByUser[0];
    } else {
      notify(t('createVirtualContributorWizard.noSpaces'), 'error');
      return undefined;
    }
  };

  const { mySpaceId, myAccountId, mySpaceName, mySubspaces, selectableSubspaces } = useMemo(() => {
    const mySpace = findMySpace(user?.user.id, data?.me.mySpaces);

    const mySubspaces = mySpace?.space.subspaces ?? [];
    const selectableSubspaces = mySubspaces.map(subspace => ({ id: subspace.id, name: subspace.profile.displayName }));

    return {
      mySpaceId: mySpace?.space.id,
      myAccountId: mySpace?.space.account.id,
      mySpaceName: mySpace?.space.profile.displayName,
      mySubspaces,
      selectableSubspaces,
    };
  }, [data, user]);

  const startWizard = () => {
    setStep(Step.step0);
    setDialogOpen(true);
  };
  const canCreateSubspace = mySpaceId !== undefined;
  const canUseExistingSubspace = selectableSubspaces.length > 0;

  const [createSubspace] = useCreateSubspaceMutation();
  const handleCreateSubspace = async (subspaceName: string) => {
    if (!mySpaceId) {
      return;
    }
    const { data } = await createSubspace({
      variables: {
        input: {
          spaceID: mySpaceId,
          profileData: {
            displayName: subspaceName,
            description: t('createVirtualContributorWizard.createdSubspace.description'),
            tagline: t('createVirtualContributorWizard.createdSubspace.tagline'),
          },
          type: SpaceType.Knowledge,
          collaborationData: {
            addDefaultCallouts: true,
          },
          context: {
            vision: t('createVirtualContributorWizard.createdSubspace.vision'),
            impact: t('createVirtualContributorWizard.createdSubspace.impact'),
            who: t('createVirtualContributorWizard.createdSubspace.who'),
          },
        },
      },
    });
    if (data?.createSubspace?.id) {
      setSelectedSubspace(data.createSubspace);
      notify(t('createVirtualContributorWizard.createdSubspace.successMessage', { subspaceName }), 'success');
      setStep(Step.step2);
    }
  };

  const [selectedSubspace, setSelectedSubspace] = useState<SelectedSubspace | undefined>(undefined);
  const handleChooseSubspace = async (subspaceId: string) => {
    const subspace = mySubspaces.find(subspace => subspace.id === subspaceId);
    if (subspace) {
      setSelectedSubspace(subspace);
      setStep(Step.step2);
    }
  };

  const [createdVirtualContributorUrl, setCreatedVirtualContributorUrl] = useState<string | undefined>(undefined);
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation();
  const [addVirtualContributorToSubspace] = useAddVirtualContributorToCommunityMutation();
  const [assignCommunityRole] = useAssignCommunityRoleToVirtualContributorMutation();
  const handleCreateVirtualContributor = async (virtualContributorName: string) => {
    if (!myAccountId || !selectedSubspace) {
      return;
    }
    const { data } = await createVirtualContributor({
      variables: {
        virtualContributorData: {
          accountID: myAccountId,
          profileData: {
            displayName: virtualContributorName,
            description: t('createVirtualContributorWizard.createdVirtualContributor.description'),
          },
          aiPersona: {
            aiPersonaService: {
              bodyOfKnowledgeID: selectedSubspace?.id,
            },
          },
        },
      },
    });
    if (data?.createVirtualContributor.id) {
      await addVirtualContributorToSubspace({
        variables: {
          communityId: selectedSubspace.community.id,
          virtualContributorId: data.createVirtualContributor.id,
        },
      });
      await assignCommunityRole({
        variables: {
          communityId: selectedSubspace.community.id,
          role: CommunityRole.Lead,
          virtualContributorId: data.createVirtualContributor.id,
        },
      });
      notify(
        t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { virtualContributorName }),
        'success'
      );
      setCreatedVirtualContributorUrl(data.createVirtualContributor.profile.url);
      setStep(Step.step3);
    }
  };

  const NewVirtualContributorWizard = useCallback(
    () => (
      <Dialog open={dialogOpen}>
        {step === Step.step0 && (
          <CreateNewVirtualContributorStep0
            onClose={onDialogClose}
            canCreateSubspace={canCreateSubspace}
            canUseExisting={canUseExistingSubspace}
            loading={loading}
            onCreateSubspace={() => setStep(Step.step1)}
            onUseExistingSubspace={() => setStep(Step.step1b)}
          />
        )}
        {step === Step.step1 && (
          <CreateSubspaceStep1
            onClose={onDialogClose}
            onBack={() => setStep(Step.step0)}
            onCreateSubspace={handleCreateSubspace}
            mySpaceName={mySpaceName}
            loading={loading}
          />
        )}
        {step === Step.step1b && (
          <ChooseSubspaceStep1b
            onClose={onDialogClose}
            onBack={() => setStep(Step.step0)}
            onChooseSubspace={handleChooseSubspace}
            selectedSubspaceId={selectedSubspace?.id}
            mySpaceName={mySpaceName}
            subspaces={selectableSubspaces}
            loading={loading}
          />
        )}
        {step === Step.step2 && (
          <NameVirtualContributorStep2
            onClose={onDialogClose}
            onBack={() => setStep(Step.step1b)}
            onCreateVirtualContributor={handleCreateVirtualContributor}
          />
        )}
        {step === Step.step3 && (
          <WhatsNextStep3
            onClose={onDialogClose}
            updateProfileUrl={createdVirtualContributorUrl}
            addKnowledgeUrl={selectedSubspace?.profile.url}
          />
        )}
      </Dialog>
    ),
    [dialogOpen, step, loading]
  );

  return {
    startWizard,
    NewVirtualContributorWizard,
  };
};

export default useNewVirtualContributorWizard;
