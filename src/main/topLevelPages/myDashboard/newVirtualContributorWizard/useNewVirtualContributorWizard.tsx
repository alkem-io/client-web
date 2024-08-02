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
import ExistingSpace, { SelectableKnowledgeProps } from './ExistingSpace';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUserContext } from '../../../../domain/community/user';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import useNavigate from '../../../../core/routing/useNavigate';
import { usePlanAvailability } from '../../../../domain/journey/space/createSpace/plansTable/usePlanAvailability';
import { addVCCreationCache } from './vcCreationUtil';

const SPACE_LABEL = '(space)';

type Step = 'initial' | 'create_VC' | 'add_knowledge' | 'existingKnowledge';

interface useNewVirtualContributorWizardProvided {
  startWizard: () => void;
  NewVirtualContributorWizard: ComponentType<NewVirtualContributorWizardProps>;
}

interface NewVirtualContributorWizardProps {}

const useNewVirtualContributorWizard = (): useNewVirtualContributorWizardProvided => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>('initial');
  const [spaceId, setSpaceId] = useState<string>();
  const [virtualContributorId, setVirtualContributorId] = useState<string>();
  const [virtualContributorInput, setVirtualContributorInput] = useState<VirtualContributorFromProps | undefined>(
    undefined
  );

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

  // note, selectableSpaces are space and subspaces
  const { mySpaceId, myAccountId, selectableSpaces } = useMemo(() => {
    const mySpaces = findMySpaces(user?.user.id, data?.me.myCreatedSpaces);
    let selectableSpaces: SelectableKnowledgeProps[] = [];

    mySpaces?.forEach(space => {
      if (space) {
        selectableSpaces.push({
          id: space.id,
          name: `${space.profile.displayName} ${SPACE_LABEL}`,
          accountId: space.account.id,
          url: space.profile.url,
        });
        selectableSpaces = selectableSpaces.concat(
          space.subspaces?.map(subspace => ({
            id: subspace.id,
            name: subspace.profile.displayName,
            accountId: space.account.id,
            url: space.profile.url,
          })) ?? []
        );
      }
    });

    return {
      mySpaceId: mySpaces?.[0]?.id,
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

  const onStepSelection = (step: Step, values: VirtualContributorFromProps) => {
    setVirtualContributorInput(values);
    setStep(step);
  };

  const handleCreateVCWithExistingKnowledge = async (selectedKnowledge: SelectableKnowledgeProps) => {
    if (selectedKnowledge && virtualContributorInput) {
      await handleCreateVirtualContributor(virtualContributorInput, selectedKnowledge.accountId, selectedKnowledge.id);
      addVCCreationCache(virtualContributorInput.name);
      navigate(selectedKnowledge.url ?? '');
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
            onUseExistingKnowledge={values => onStepSelection('existingKnowledge', values)}
          />
        )}
        {step === 'create_VC' && (
          <LoadingState
            onClose={handleCancel} // TODO: Cancel NOT WORKING
          />
        )}
        {step === 'add_knowledge' && <AddContent onClose={handleCancel} onCreateBoK={handleAddContent} />}
        {step === 'existingKnowledge' && (
          <ExistingSpace
            onClose={onDialogClose}
            onBack={() => setStep('initial')}
            onSubmit={handleCreateVCWithExistingKnowledge}
            availableSpaces={selectableSpaces}
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
