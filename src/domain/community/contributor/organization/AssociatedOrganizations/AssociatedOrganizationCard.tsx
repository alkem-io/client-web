import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import ContributorCardHorizontal, { ContributorCardHorizontalProps } from '@/core/ui/card/ContributorCardHorizontal';
import LabeledCount from '@/core/ui/content/LabeledCount';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

export interface AssociatedOrganizationCardProps extends ContributorCardHorizontalProps {
  enableLeave?: boolean;
  removingFromOrganization?: boolean;
  handleRemoveSelfFromOrganization?: () => void;
  loading?: boolean;
  associatesCount?: number;
  verified?: boolean;
}

const AssociatedOrganizationCard = ({
  profile,
  enableLeave,
  removingFromOrganization = false,
  handleRemoveSelfFromOrganization,
  loading,
  associatesCount,
  verified,
  ...props
}: AssociatedOrganizationCardProps) => {
  const { t } = useTranslation();

  const [isDialogOpened, setIsDialogOpened] = useState(false);

  const handleOpenModal = () => {
    setIsDialogOpened(true);
  };

  const handleClose = () => {
    setIsDialogOpened(false);
  };

  const handleSubmit = () => {
    handleRemoveSelfFromOrganization?.();
    handleClose();
  };

  return (
    <ContributorCardHorizontal
      profile={profile}
      actions={
        enableLeave && (
          <>
            <Box display="flex" justifyContent="flex-end">
              <LoadingButton
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={event => {
                  handleOpenModal();
                  event.stopPropagation();
                }}
                loading={removingFromOrganization}
              >
                {t('common.disassociate')}
              </LoadingButton>
            </Box>
            <Dialog open={isDialogOpened} maxWidth="xs" aria-labelledby="confirm-leave-organization">
              <DialogHeader
                title={t('components.associated-organization.confirmation-dialog.title', {
                  organization: profile?.displayName,
                })}
              />
              <DialogContent sx={{ paddingX: 2 }}>
                {t('components.associated-organization.confirmation-dialog.text')}
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'end' }}>
                {handleClose && (
                  <Button
                    onClick={event => {
                      handleClose();
                      event.stopPropagation();
                    }}
                  >
                    {t('buttons.cancel')}
                  </Button>
                )}
                <Button
                  onClick={event => {
                    handleSubmit();
                    event.stopPropagation();
                  }}
                  disabled={loading}
                >
                  {t('buttons.leave')}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )
      }
      titleEndAmendment={
        associatesCount && (
          <LabeledCount
            label={t('components.associates.name')}
            count={associatesCount}
            loading={loading}
            verified={verified}
          />
        )
      }
      {...props}
    />
  );
};

export default AssociatedOrganizationCard;
