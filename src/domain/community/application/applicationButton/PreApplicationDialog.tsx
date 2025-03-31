import { Button, Dialog, DialogContent } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import isApplicationPending from './isApplicationPending';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { Actions } from '@/core/ui/actions/Actions';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface PreApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  dialogVariant: 'dialog-parent-app-pending' | 'dialog-apply-parent';
  parentCommunitySpaceLevel?: SpaceLevel;
  parentCommunityName?: string;
  subspaceName?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
}

const PreApplicationDialog = ({
  open,
  onClose,
  dialogVariant,
  parentCommunitySpaceLevel,
  parentCommunityName,
  subspaceName,
  parentApplicationState,
  applyUrl,
  parentApplyUrl,
}: PreApplicationDialogProps) => {
  const { t } = useTranslation();
  const buttonText = t(
    `components.application-button.goTo${parentCommunitySpaceLevel === SpaceLevel.L0 ? 'Space' : 'Subspace'}` as const
  );

  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          <Trans
            i18nKey={`components.application-button.${dialogVariant}.title` as const}
            values={{ parentCommunityName: parentCommunityName }}
            components={{ strong: <strong /> }}
            t={t}
          />
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Trans
          i18nKey={`components.application-button.${dialogVariant}.body` as const}
          values={{ spaceName: parentCommunityName, subspaceName }}
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
