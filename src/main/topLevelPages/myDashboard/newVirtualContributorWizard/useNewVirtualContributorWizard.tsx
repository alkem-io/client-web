import { ComponentType, useCallback, useMemo, useState } from 'react';
import {
  refetchAdminSpacesListQuery,
  refetchMyAccountQuery,
  useAddVirtualContributorToCommunityMutation,
  useAllSpacesQuery,
  useCreateNewSpaceMutation,
  useCreateSubspaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { NewVirtualContributorMySpacesQuery } from '../../../../core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent from './AddContent';
import ChooseSubspaceStep1b from './ChooseSubspace.step1b';
import WhatsNextStep3 from './WhatsNext.step3';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUserContext } from '../../../../domain/community/user';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';

type Step = 'initial' | 'create_VC' | 'add_knowledge' | 'step1b' | 'step3';

const FREE_PLAN_ID = '246c2b8e-033c-40f9-b2ae-0753fe2f4365';

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
  const [step, setStep] = useState<Step>('initial');
  const [spaceId, setSpaceId] = useState<string>();
  const [virtualContributorId, setVirtualContributorId] = useState<string>();

  const onDialogClose = () => {
    setDialogOpen(false);
    setStep('initial');
  };

  const { data, loading } = useNewVirtualContributorMySpacesQuery({
    skip: !dialogOpen,
    fetchPolicy: 'cache-and-network',
  });

  const findMySpace = (
    userId: string | undefined,
    mySpaces: NewVirtualContributorMySpacesQuery['me']['myCreatedSpaces'] | undefined
  ) => {
    if (!userId || !mySpaces) {
      return undefined;
    }
    const spacesHostedByUser = mySpaces.filter(space => space.account.host?.id === userId);
    if (spacesHostedByUser.length > 0) {
      return spacesHostedByUser[0];
    }
  };

  const { mySpaceId, myAccountId, mySpaceName, mySubspaces, selectableSubspaces } = useMemo(() => {
    const mySpace = findMySpace(user?.user.id, data?.me.myCreatedSpaces);
    const mySubspaces = mySpace?.subspaces ?? [];
    const selectableSubspaces = mySubspaces.map(subspace => ({ id: subspace.id, name: subspace.profile.displayName }));

    return {
      mySpaceId: mySpace?.id,
      myAccountId: mySpace?.account.id,
      mySpaceName: mySpace?.profile.displayName,
      mySubspaces,
      selectableSubspaces,
    };
  }, [data, user]);

  const startWizard = () => {
    setStep('initial');
    setDialogOpen(true);
  };

  const { data: allSpaces } = useAllSpacesQuery();
  const allSpacesNameIds = allSpaces?.spaces.map(space => space.nameID) || [];
  const makeUniqueName = (name: string): string => {
    let uniqueName = name;
    let counter = 1;
    while (allSpacesNameIds.includes(uniqueName)) {
      uniqueName = `${name}${counter}`;
      counter++;
    }
    return uniqueName;
  };

  const generateSpaceName = (name: string) => `${name}'s Space`;
  const generateNameId = (name: string) => `${name}s Space`.toLowerCase().replaceAll(' ', '');

  const [CreateNewSpace] = useCreateNewSpaceMutation();
  const handleCreateSpace = async () => {
    if (!user?.user.id) {
      return;
    }
    const { data: newSpace } = await CreateNewSpace({
      variables: {
        hostId: user?.user.id,
        spaceData: {
          nameID: makeUniqueName(generateNameId(user?.user.profile.displayName!)),
          profileData: {
            displayName: generateSpaceName(user?.user.profile.displayName!), // ensured by yup validation
          },
          collaborationData: {},
        },
        licensePlanId: FREE_PLAN_ID,
      },
    });
    setSpaceId(newSpace?.createAccount.spaceID);
    return newSpace;
  };

  const handleSetupVirtualContributor = async (values: VirtualContributorFromProps) => {
    setStep('create_VC');
    if (mySpaceId && myAccountId) {
      await handleCreateVirtualContributor(values, myAccountId, mySpaceId);
    } else {
      const newSpace = await handleCreateSpace();
      await handleCreateVirtualContributor(values, newSpace?.createAccount.id!, newSpace?.createAccount.spaceID!);
    }
    await setStep('add_knowledge');
  };

  const handleAddContent = async () => {
    console.log('Not implemented')
  };

  const [deleteVirtualContributor] = useDeleteVirtualContributorOnAccountMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });
  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });

  const handleCancel = async () => {
    if (virtualContributorId) {
      await deleteVirtualContributor({
        variables: {
          virtualContributorData: {
            ID: virtualContributorId,
          },
        },
      });
    }
    if (spaceId) {
      await deleteSpace({
        variables: {
          input: {
            ID: spaceId,
          },
        },
      });
    }
    notify(t('createVirtualContributorWizard.deleted'), 'success');
    onDialogClose();
  };

  const [selectedSubspace, setSelectedSubspace] = useState<SelectedSubspace | undefined>(undefined);
  const handleChooseSubspace = async (subspaceId: string) => {
    const subspace = mySubspaces.find(subspace => subspace.id === subspaceId);
    if (subspace) {
      setSelectedSubspace(subspace);
    }
  };

  const [createdVirtualContributorUrl, setCreatedVirtualContributorUrl] = useState<string | undefined>(undefined);
  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });

  const handleCreateVirtualContributor = async (values: VirtualContributorFromProps, accountId: string, spaceId: string) => {
    if (!accountId || !spaceId) {
      return;
    }
    const { data } = await createVirtualContributor({
      variables: {
        virtualContributorData: {
          accountID: accountId,
          profileData: {
            displayName: values.name,
            tagline: values.tagline,
            description: values.description ?? t('createVirtualContributorWizard.createdVirtualContributor.description'),
          },
          aiPersona: {
            aiPersonaService: {
              bodyOfKnowledgeID: spaceId,
            },
          },
        },
      },
    });
    if (data?.createVirtualContributor.id) {
      notify(
        t('createVirtualContributorWizard.createdVirtualContributor.successMessage', { values: { name: values.name } }),
        'success'
      );
      setVirtualContributorId(data.createVirtualContributor.id);
      // setCreatedVirtualContributorUrl(data.createVirtualContributor.profile.url);
    }
  };

  const NewVirtualContributorWizard = useCallback(
    () => (
      <DialogWithGrid open={dialogOpen} columns={6}>
        {step === 'initial' && (
          <CreateNewVirtualContributor
            onClose={onDialogClose}
            loading={loading}
            onCreateSpace={handleSetupVirtualContributor}
          />
        )}
        {step === 'create_VC' && (
          <LoadingState
            onClose={handleCancel} // TODO: Cancel NOT WORKING
          />
        )}
        {step === 'add_knowledge' && (
          <AddContent
            onClose={handleCancel}
            onCreateBoK={handleAddContent}
          />
        )}
        {step === 'step1b' && (
          <ChooseSubspaceStep1b
            onClose={onDialogClose}
            onBack={() => setStep('initial')}
            onChooseSubspace={handleChooseSubspace}
            selectedSubspaceId={selectedSubspace?.id}
            mySpaceName={mySpaceName}
            subspaces={selectableSubspaces}
            loading={loading}
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
