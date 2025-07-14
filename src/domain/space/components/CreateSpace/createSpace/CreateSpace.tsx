import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { SpaceCreationDialog } from '../common/SpaceCreationDialog';
import { SpaceFormValues } from '@/domain/space/components/CreateSpace/common/SpaceCreationDialog.models';
import { CreateSpaceForm } from './CreateSpaceForm';
import { useSpaceCreation } from '../hooks/useSpaceCreation/useSpaceCreation';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { Identifiable } from '@/core/utils/Identifiable';
import { useDashboardSpaces } from '@/main/topLevelPages/myDashboard/DashboardWithMemberships/DashboardSpaces/useDashboardSpaces';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpacePlans } from '../hooks/spacePlans/useSpacePlans';
import { TagCategoryValues, info } from '@/core/logging/sentry/log';
import { addSpaceWelcomeCache } from '../utils';

type SpaceCreatedResult = Identifiable & {
  about: {
    profile: {
      url: string;
    };
  };
};

export interface CreateSpaceProps {
  open?: boolean;
  onClose?: () => void;
  /**
   * If not provided, the space will be created in the current user's account.
   */
  accountId?: string;
  onSpaceCreated?: (subspace: SpaceCreatedResult) => void;
}

export const CreateSpace = ({ open = false, onClose, accountId, onSpaceCreated }: CreateSpaceProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ensurePresence = useEnsurePresence();

  const { refetchSpaces } = useDashboardSpaces();

  const { createSpace } = useSpaceCreation({
    refetchQueries: ['AccountInformation'],
    onCompleted: () => {
      refetchSpaces();
    },
    awaitRefetchQueries: true,
  });

  const { accountId: currentUserAccountId } = useCurrentUserContext();
  // either the account is passed in or we pick it up from the user context
  const destinationAccountId = accountId ?? currentUserAccountId;
  const { availablePlans } = useSpacePlans({
    accountId: destinationAccountId,
    skip: !open || !destinationAccountId,
  });

  const handleCreate = useCallback(
    async (value: SpaceFormValues) => {
      const accountId = ensurePresence(destinationAccountId, 'Account ID');
      const licensePlanId = ensurePresence(availablePlans[0]?.id, '', t('createSpace.license.noPlansError'));

      const result = await createSpace({
        accountId,
        nameId: value.nameId!, // ensured by form validation
        licensePlanId,
        about: {
          profile: {
            displayName: value.displayName,
            tagline: value.tagline,
            description: value.description,
            visuals: value.visuals,
            tags: value.tags,
          },
          why: value.why,
        },
        addTutorialCallouts: value.addTutorialCallouts,
        addCallouts: value.addCallouts,
        spaceTemplateId: value.spaceTemplateId,
      });

      const spaceUrl = ensurePresence(result?.about?.profile?.url, 'Space URL');
      const spaceId = ensurePresence(result?.id, 'Space ID');

      onClose?.();

      addSpaceWelcomeCache(spaceId);

      // Log Created new Space to sentry
      info(`Space Created SpaceId:${spaceId}`, {
        category: TagCategoryValues.SPACE_CREATION,
        label: 'Space Created',
      });
      if (onSpaceCreated && result) {
        onSpaceCreated(result);
      } else {
        navigate(spaceUrl);
      }
    },
    [navigate, createSpace, destinationAccountId, onSpaceCreated, onClose, availablePlans]
  );

  if (!destinationAccountId) {
    // If no account we cannot create a space anywhere, so just return null
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="account" accountId={destinationAccountId} skip={!open}>
      <SpaceCreationDialog
        icon={<SpaceL0Icon fill="primary" />}
        open={open}
        entityName={t('common.space')}
        onClose={onClose}
        onCreate={handleCreate}
        formComponent={CreateSpaceForm}
      />
    </StorageConfigContextProvider>
  );
};

export default CreateSpace;
