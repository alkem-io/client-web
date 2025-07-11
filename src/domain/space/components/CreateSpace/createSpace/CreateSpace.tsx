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

  const handleCreate = useCallback(
    async (value: SpaceFormValues) => {
      const accountId = ensurePresence(destinationAccountId);

      const result = await createSpace({
        accountId,
        nameId: value.nameId!, // ensured by form validation
        licensePlanId: undefined,
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
      onClose?.();
      if (onSpaceCreated && result) {
        onSpaceCreated(result);
      } else {
        navigate(spaceUrl);
      }
    },
    [navigate, createSpace, destinationAccountId, onSpaceCreated, onClose]
  );

  return (
    <SpaceCreationDialog
      icon={<SpaceL0Icon fill="primary" />}
      open={open}
      entityName={t('common.space')}
      onClose={onClose}
      onCreate={handleCreate}
      formComponent={CreateSpaceForm}
    />
  );
};

export default CreateSpace;
