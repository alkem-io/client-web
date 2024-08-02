import { ComponentType, useCallback, useMemo, useState } from 'react';
import {
  refetchMyAccountQuery,
  useAllSpacesQuery,
  useCreateNewSpaceMutation,
  useCreateVirtualContributorOnAccountMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
  useNewVirtualContributorMySpacesQuery,
  usePlansTableQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { LicensePlanType, NewVirtualContributorMySpacesQuery } from '../../../../core/apollo/generated/graphql-schema';
import CreateNewVirtualContributor, { VirtualContributorFromProps } from './CreateNewVirtualContributor';
import LoadingState from './LoadingState';
import AddContent from './AddContent';
import ExistingSpace from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUserContext } from '../../../../domain/community/user';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
// import { addVCCreationCache } from './vcCreationUtil';
// import useNavigate from '../../../../core/routing/useNavigate';
import { usePlanAvailability } from '../../../../domain/journey/space/createSpace/plansTable/usePlanAvailability';

type Step = 'initial' | 'create_VC' | 'add_knowledge' | 'step.existing';

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
  // const navigate = useNavigate();

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

  const { mySpaceId, allMySpaces, myAccountId, selectableSpaces } = useMemo(() => {
    const mySpaces = findMySpaces(user?.user.id, data?.me.myCreatedSpaces);
    const allMySpaces: NewVirtualContributorMySpacesQuery['me']['myCreatedSpaces'] = [];
    let selectableSpaces: { id: string; name: string }[] = [];

    mySpaces?.forEach(space => {
      if (space) {
        allMySpaces.push(space);
        selectableSpaces.push({ id: space.id, name: `${space.profile.displayName} (space)` });
        selectableSpaces = selectableSpaces.concat(
          space.subspaces?.map(subspace => ({ id: subspace.id, name: subspace.profile.displayName }))
        );
      }
    });

    return {
      mySpaceId: mySpaces?.[0]?.id,
      allMySpaces: allMySpaces,
      myAccountId: mySpaces?.[0]?.account.id,
      selectableSpaces,
    };
  }, [data, user]);

  const { data: plansData } = usePlansTableQuery({
    skip: !!mySpaceId,
  });

  const { isPlanAvailable } = usePlanAvailability({ skip: !!mySpaceId });

  const plans = useMemo(
    () =>
      plansData?.platform.licensing.plans
        .filter(plan => plan.enabled)
        .filter(plan => plan.type === LicensePlanType.SpacePlan)
        .filter(plan => isPlanAvailable(plan))
        .sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [plansData, isPlanAvailable]
  );

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
    debugger;
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
        licensePlanId: plans[0].id,
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
    console.log('Not implemented');
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
    const selectedBoK = allMySpaces.find(space => space?.id === subspaceId);

    if (selectedBoK) {
      setSelectedSubspace({
        id: selectedBoK?.id,
        profile: {
          displayName: selectedBoK?.profile.displayName,
          url: selectedBoK?.profile.url,
        },
        community: {
          id: selectedBoK?.community?.id,
        },
      });
      // TODO: #6604
      // save the VC name in the state (after choosing a step in 'initial')
      // handleCreateVirtualContributor(virtualContributorName);
      // addVCCreationCache(virtualContributorName);
      // navigate(mySpace?.profile.url);
    }
  };

  const [createVirtualContributor] = useCreateVirtualContributorOnAccountMutation({
    refetchQueries: [refetchMyAccountQuery()],
  });

  const handleCreateVirtualContributor = async (
    values: VirtualContributorFromProps,
    accountId: string,
    spaceId: string
  ) => {
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
            description:
              values.description ?? t('createVirtualContributorWizard.createdVirtualContributor.description'),
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
            onUseExistingSubspace={() => setStep('step.existing')}
          />
        )}
        {step === 'create_VC' && (
          <LoadingState
            onClose={handleCancel} // TODO: Cancel NOT WORKING
          />
        )}
        {step === 'add_knowledge' && <AddContent onClose={handleCancel} onCreateBoK={handleAddContent} />}
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
