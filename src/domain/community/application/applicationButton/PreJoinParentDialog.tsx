import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent } from '@mui/material';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { useSpace } from '@/domain/space/SpaceContext/useSpace';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { gutters } from '@/core/ui/grid/utils';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface PreJoinParentDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => void;
}

const PreJoinParentDialog = ({ open, onClose, onJoin }: PreJoinParentDialogProps) => {
  const { t } = useTranslation();
  const { spaceId, spaceLevel } = useUrlResolver();

  const { space } = useSpace();
  const spaceAbout = space?.about;
  const { subspace } = useSubSpace();
  const subspaceAbout = subspace?.about;

  const parentCommunityName = spaceId ? subspaceAbout.profile.displayName : spaceAbout.profile.displayName;
  const buttonText = t(
    `components.application-button.goTo${spaceLevel === SpaceLevel.L0 ? 'Space' : 'Subspace'}` as const
  );

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
