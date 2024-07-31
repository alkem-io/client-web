import { ComponentType, useCallback, useMemo, useState } from 'react';
import {
  refetchMyAccountQuery,
  useCreateSubspaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { NewVirtualContributorMySpacesQuery, SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor from './CreateNewVirtualContributor';
import CreateSubspaceStep1 from './CreateSubspace.step1';
import ExistingSpace from './ExistingSpace';
import NameVirtualContributorStep2 from './NameVirtualContributor.step2';
import WhatsNextStep3 from './WhatsNext.step3';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUserContext } from '../../../../domain/community/user';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
// import { addVCCreationCache } from './vcCreationUtil';
// import useNavigate from '../../../../core/routing/useNavigate';

type Step = 'initial' | 'step1' | 'step.existing' | 'step2' | 'step3';

interface SelectedSubspace {
  id: string;
  profile: {
    displayName: string;
    url: string;
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
  // const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>('initial');
  const onDialogClose = () => {
    setDialogOpen(false);
    setStep('initial');
  };

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: !dialogOpen,
    fetchPolicy: 'cache-and-network',
  });

  const findMySpaces = (
    userId: string | undefined,
    mySpaces: NewVirtualContributorMySpacesQuery['me']['myCreatedSpaces'] | undefined
  ) => {
    if (!userId || !mySpaces) {
      return undefined;
    }
    const spacesHostedByUser = mySpaces.filter(space => space.account.host?.id === userId);
    if (spacesHostedByUser.length > 0) {
      return spacesHostedByUser;
    }
  };

  const { mySpaceId, allSpaces, myAccountId, mySpaceName, selectableSpaces } = useMemo(() => {
    const mySpaces = findMySpaces(user?.user.id, data?.me.myCreatedSpaces);
    const allSpaces: NewVirtualContributorMySpacesQuery['me']['myCreatedSpaces'] = [];
    let selectableSpaces: { id: string; name: string }[] = [];

    mySpaces?.forEach(space => {
      if (space) {
        allSpaces.push(space);
        selectableSpaces.push({ id: space.id, name: `${space.profile.displayName} (space)` });
        selectableSpaces = selectableSpaces.concat(
          space.subspaces?.map(subspace => ({ id: subspace.id, name: subspace.profile.displayName }))
        );
      }
    });

    return {
      mySpaceId: mySpaces?.[0]?.id,
      allSpaces: allSpaces,
      myAccountId: mySpaces?.[0]?.account.id,
      mySpaceName: mySpaces?.[0]?.profile.displayName,
      selectableSpaces,
    };
  }, [data, user]);

  const startWizard = () => {
    setStep('initial');
    setDialogOpen(true);
  };
  const canCreateSubspace = mySpaceId !== undefined;
  const canUseExistingSubspace = selectableSpaces.length > 0;

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
      setStep('step2');
    }
  };

  const [selectedSubspace, setSelectedSubspace] = useState<SelectedSubspace | undefined>(undefined);
  const handleChooseSubspace = async (subspaceId: string) => {
    const selectedBoK = allSpaces.find(space => space?.id === subspaceId);

    if (selectedBoK) {
      setSelectedSubspace({
        id: selectedBoK?.id,
        profile: {
          displayName: selectedBoK?.profile.displayName,
          url: '',
        },
      });
      // TODO: #6604
      // save the VC name in the state (after choosing a step in 'initial')
      // handleCreateVirtualContributor(virtualContributorName);
      // addVCCreationCache(virtualContributorName);
      // navigate(mySpace?.profile.url);
    }
  };

  const [createdVirtualContributorUrl, setCreatedVirtualContributorUrl] = useState<string | undefined>(undefined);
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });
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
      // await addVirtualContributorToSubspace({
      //   variables: {
      //     communityId: selectedSubspace.community.id,
      //     virtualContributorId: data.createVirtualContributor.id,
      //   },
      // });
      notify(
        t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { virtualContributorName }),
        'success'
      );
      setCreatedVirtualContributorUrl(data.createVirtualContributor.profile.url);
      // setStep('step3');
    }
  };

  const NewVirtualContributorWizard = useCallback(
    () => (
      <DialogWithGrid open={dialogOpen} columns={6}>
        {step === 'initial' && (
          <CreateNewVirtualContributor
            onClose={onDialogClose}
            canCreateSubspace={canCreateSubspace}
            canUseExisting={canUseExistingSubspace}
            loading={loading}
            onCreateSubspace={() => setStep('step1')}
            onUseExistingSubspace={() => setStep('step.existing')}
          />
        )}
        {step === 'step1' && (
          <CreateSubspaceStep1
            onClose={onDialogClose}
            onBack={() => setStep('initial')}
            onCreateSubspace={handleCreateSubspace}
            mySpaceName={mySpaceName}
            loading={loading}
          />
        )}
        {step === 'step.existing' && (
          <ExistingSpace
            onClose={onDialogClose}
            onBack={() => setStep('initial')}
            onChooseSubspace={handleChooseSubspace}
            selectedSubspaceId={selectedSubspace?.id}
            subspaces={selectableSpaces}
            loading={loading}
          />
        )}
        {step === 'step2' && (
          <NameVirtualContributorStep2
            onClose={onDialogClose}
            onBack={() => setStep('step.existing')}
            onCreateVirtualContributor={handleCreateVirtualContributor}
          />
        )}
        {step === 'step3' && (
          <WhatsNextStep3
            onClose={onDialogClose}
            updateProfileUrl={createdVirtualContributorUrl}
            addKnowledgeUrl={selectedSubspace?.profile.url}
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
