import { Button, Dialog, DialogContent } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import isApplicationPending from './isApplicationPending';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { useOpportunity } from '@/domain/journey/opportunity/hooks/useOpportunity';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { Actions } from '@/core/ui/actions/Actions';

export interface PreApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  dialogVariant: 'dialog-parent-app-pending' | 'dialog-apply-parent';
  spaceName?: string;
  challengeName?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
}

const PreApplicationDialog = ({
  open,
  onClose,
  dialogVariant,
  spaceName,
  challengeName,
  parentApplicationState,
  applyUrl,
  parentApplyUrl,
}: PreApplicationDialogProps) => {
  const { t } = useTranslation();
  const { profile: spaceProfile } = useSpace();
  const { profile: challengeProfile } = useSubSpace();
  const { opportunityId } = useOpportunity();
  const parentCommunityName = opportunityId ? challengeProfile.displayName : spaceProfile.displayName;
  const buttonText = t(`components.application-button.goTo${opportunityId ? 'Subspace' : 'Space'}` as const);

  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          <Trans
            i18nKey={`components.application-button.${dialogVariant}.title` as const}
            values={{ parentCommunityName }}
            components={{ strong: <strong /> }}
            t={t}
          />
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Trans
          i18nKey={`components.application-button.${dialogVariant}.body` as const}
          values={{ spaceName, challengeName }}
          components={{
            strong: <strong />,
          }}
        />
      </DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'end' }}>
        <Button
          component={RouterLink}
          to={(isApplicationPending(parentApplicationState) ? applyUrl : parentApplyUrl) ?? ''}
          variant="contained"
          aria-label="dialog-apply"
        >
          {isApplicationPending(parentApplicationState) ? t('buttons.apply') : buttonText}
        </Button>
      </Actions>
    </Dialog>
  );
};

export default PreApplicationDialog;
