import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent } from '@mui/material';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { gutters } from '@/core/ui/grid/utils';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface PreJoinParentDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => void;
}

const PreJoinParentDialog = ({ open, onClose, onJoin }: PreJoinParentDialogProps) => {
  const { t } = useTranslation();
  const { spaceId, spaceLevel } = useUrlResolver();
  //!! This is all wrong
  const { profile: spaceProfile } = useSpace();
  const { profile: challengeProfile } = useSubSpace();

  const parentCommunityName = spaceId ? challengeProfile.displayName : spaceProfile.displayName;
  const buttonText = t(`components.application-button.goTo${spaceLevel === SpaceLevel.L0 ? 'Space' : 'Subspace'}` as const);

  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          <Trans
            i18nKey="components.application-button.dialog-join-parent.title"
            values={{ parentCommunityName }}
            components={{ strong: <strong /> }}
            t={t}
          />
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Trans
          i18nKey="components.application-button.dialog-join-parent.body"
          values={{ parentCommunityName }}
          components={{ strong: <strong /> }}
          t={t}
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
