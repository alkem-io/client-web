import { FC, useState } from 'react';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import { ProfileChip } from '../../contributor/ProfileChip/ProfileChip';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { Button, Checkbox, FormControlLabel, Link } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { Actions } from '../../../../core/ui/actions/Actions';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { LoadingButton } from '@mui/lab';
import Gutters from '../../../../core/ui/grid/Gutters';

interface CommunityMemberSettingsDialogProps {
  user: {
    id: string;
    profile: {
      displayName: string;
      visual?: {
        uri: string;
      };
      location?: {
        city: string;
        country: string;
      };
    };
    firstName: string;
    email: string;
    isLead: boolean;
    isAdmin: boolean;
  };
  onClose?: () => void;
  onLeadChange: (userId: string, isLead: boolean) => Promise<unknown> | void;
  onAdminChange?: (userId: string, isAdmin: boolean) => Promise<unknown> | void;
  onRemoveMember?: (userId: string) => void;
}

const CommunityMemberSettingsDialog: FC<CommunityMemberSettingsDialogProps> = ({
  onClose,
  user,
  onLeadChange,
  onAdminChange,
  onRemoveMember,
}) => {
  const { t } = useTranslation();
  const [isLead, setIsLead] = useState(user.isLead);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [removingMember, setRemovingMember] = useState(false);

  const [handleSave, isLoading] = useLoadingState(async () => {
    if (isLead !== user.isLead) {
      await onLeadChange(user.id, isLead);
    }
    if (isAdmin !== user.isAdmin) {
      await onAdminChange?.(user.id, isLead);
    }
    onClose?.();
  });

  return (
    <>
      <DialogWithGrid open columns={12} onClose={onClose}>
        <DialogHeader onClose={onClose}>{t('community.memberSettings.title')}</DialogHeader>
        <Gutters>
          <ProfileChip
            key={user.id}
            displayName={user.profile.displayName}
            avatarUrl={user.profile.visual?.uri}
            city={user.profile.location?.city}
            country={user.profile.location?.country}
          />
          <BlockSectionTitle>{t('common.role')}</BlockSectionTitle>
          <FormControlLabel
            control={<Checkbox checked={isLead} onChange={(event, newValue) => setIsLead(newValue)} />}
            label={<Trans i18nKey="community.memberSettings.lead" components={{ b: <strong /> }} />}
          />
          {onAdminChange && (
            <>
              <BlockSectionTitle>{t('common.authorization')}</BlockSectionTitle>
              <FormControlLabel
                control={<Checkbox checked={isAdmin} onChange={(event, newValue) => setIsAdmin(newValue)} />}
                label={<Trans i18nKey="community.memberSettings.admin" components={{ b: <strong /> }} />}
              />
            </>
          )}
          {onRemoveMember && (
            <>
              <BlockSectionTitle>{t('community.memberSettings.removeMember.sectionTitle')}</BlockSectionTitle>
              <Link onClick={() => setRemovingMember(true)}>
                <DeleteIcon color="error" sx={{ textAlign: 'bottom' }} />
                {t('community.memberSettings.removeMember.remove')}
              </Link>
            </>
          )}

          <Actions>
            <Button variant="text" onClick={onClose}>
              {t('buttons.cancel')}
            </Button>
            <LoadingButton loading={isLoading} variant="contained" onClick={handleSave}>
              {t('buttons.save')}
            </LoadingButton>
          </Actions>
        </Gutters>
      </DialogWithGrid>
      {removingMember && onRemoveMember && (
        <ConfirmationDialog
          actions={{
            onConfirm: () => onRemoveMember(user.id),
            onCancel: () => setRemovingMember(false),
          }}
          options={{
            show: Boolean(removingMember),
          }}
          entities={{
            title: t('community.memberSettings.removeMember.dialogTitle'),
            content: t('community.memberSettings.removeMember.dialogContent', {
              member: user.profile.displayName,
              memberFirstName: user.firstName,
              // TODO: Add Space name to this message
            }),
            confirmButtonTextId: 'buttons.confirm',
          }}
        />
      )}
    </>
  );
};

export default CommunityMemberSettingsDialog;
