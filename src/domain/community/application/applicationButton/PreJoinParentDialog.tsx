import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';

export interface PreJoinParentDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => void;
}

const PreJoinParentDialog: FC<PreJoinParentDialogProps> = ({ open, onClose, onJoin }) => {
  const { t } = useTranslation();
  const { profile: spaceProfile } = useSpace();
  const { profile: challengeProfile } = useChallenge();
  const { opportunityId } = useOpportunity();

  const parentCommunityName = opportunityId ? challengeProfile.displayName : spaceProfile.displayName;
  const buttonText = t(`components.application-button.go-to-${opportunityId ? 'challenge' : 'space'}` as const);
  const title = t('components.application-button.dialog-join-parent.title', { parentCommunityName });

  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          <Typography
            variant="h3"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          />
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: t('components.application-button.dialog-join-parent.body'),
          }}
        />
      </DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'end' }}>
        <Button onClick={onJoin} variant="contained" aria-label="dialog-join-parent">
          {buttonText}
        </Button>
      </Actions>
    </Dialog>
  );
};

export default PreJoinParentDialog;
