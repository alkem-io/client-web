import { useState } from 'react';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import { ProfileChip } from '@/domain/community/contributor/ProfileChip/ProfileChip';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import { Button, Checkbox, FormControlLabel, Link } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { Actions } from '@/core/ui/actions/Actions';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import Gutters from '@/core/ui/grid/Gutters';

interface CommunityMemberSettingsDialogProps {
  member: {
    id: string;
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city?: string;
        country?: string;
      };
    };
    firstName?: string;
    email?: string;
    isLead: boolean;
    isAdmin?: boolean;
  };
  onClose?: () => void;
  onLeadChange: (memberId: string, isLead: boolean) => Promise<unknown> | void;
  canAddLead?: boolean;
  canRemoveLead?: boolean;
  onAdminChange?: (memberId: string, isAdmin: boolean) => Promise<unknown> | void;
  onRemoveMember?: (memberId: string) => void;
}

const CommunityMemberSettingsDialog = ({
  onClose,
  member,
  onLeadChange,
  canAddLead = true,
  canRemoveLead = true,
  onAdminChange,
  onRemoveMember,
}: CommunityMemberSettingsDialogProps) => {
  const { t } = useTranslation();
  const [isLead, setIsLead] = useState(member.isLead);
  const [isAdmin, setIsAdmin] = useState(member.isAdmin);
  const [removingMember, setRemovingMember] = useState(false);

  const [handleSave, isLoading] = useLoadingState(async () => {
    if (isLead !== member.isLead) {
      await onLeadChange(member.id, isLead);
    }
    if (typeof isAdmin !== 'undefined' && isAdmin !== member.isAdmin) {
      await onAdminChange?.(member.id, isAdmin);
    }
    onClose?.();
  });

  const [handleRemoveMember, removingMemberLoading] = useLoadingState(async (memberId: string) => {
    await onRemoveMember?.(memberId);
    onClose?.();
  });

  return (
    <>
      <DialogWithGrid open columns={12} onClose={onClose} aria-labelledby="community-member-settings-dialog">
        <DialogHeader id="community-member-settings-dialog" onClose={onClose}>
          {t('community.memberSettings.title')}
        </DialogHeader>
        <Gutters>
          <ProfileChip
            key={member.id}
            displayName={member.profile.displayName}
            avatarUrl={member.profile.avatar?.uri}
            city={member.profile.location?.city}
            country={member.profile.location?.country}
          />
          <BlockSectionTitle>{t('common.role')}</BlockSectionTitle>
          <FormControlLabel
            control={
              <Checkbox
                checked={isLead}
                onChange={(event, newValue) => setIsLead(newValue)}
                disabled={(!canAddLead && !member.isLead) || (!canRemoveLead && member.isLead)}
              />
            }
            label={<Trans i18nKey="community.memberSettings.lead" components={{ b: <strong /> }} />}
          />
          <Caption>
            <Trans i18nKey="community.memberSettings.maxLeadsWarning" components={{ b: <strong /> }} />
          </Caption>

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
              <Link onClick={() => setRemovingMember(true)} sx={{ cursor: 'pointer' }}>
                <DeleteOutlineIcon color="error" sx={{ verticalAlign: 'bottom', marginRight: 1 }} />
                {t('community.memberSettings.removeMember.remove')}
              </Link>
            </>
          )}

          <Actions justifyContent="end">
            <Button variant="text" onClick={onClose}>
              {t('buttons.cancel')}
            </Button>
            <Button loading={isLoading} variant="contained" onClick={handleSave}>
              {t('buttons.save')}
            </Button>
          </Actions>
        </Gutters>
      </DialogWithGrid>
      {removingMember && onRemoveMember && (
        <ConfirmationDialog
          actions={{
            onConfirm: () => handleRemoveMember(member.id),
            onCancel: () => setRemovingMember(false),
          }}
          options={{
            show: Boolean(removingMember),
          }}
          entities={{
            title: t('community.memberSettings.removeMember.dialogTitle'),
            content: t('community.memberSettings.removeMember.dialogContent', {
              member: member.profile.displayName,
              memberFirstName: member.firstName,
              // TODO: Add Space name to this message
            }),
            confirmButtonTextId: 'buttons.confirm',
          }}
          state={{
            isLoading: removingMemberLoading,
          }}
        />
      )}
    </>
  );
};

export default CommunityMemberSettingsDialog;
