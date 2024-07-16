import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import ContributorCardHorizontal, {
  SpaceWelcomeSectionContributorProps,
} from '../../../../../core/ui/card/ContributorCardHorizontal';
import { Caption } from '../../../../../core/ui/typography';
import CircleTag from '../../../../../core/ui/tags/CircleTag';
import OrganizationVerifiedStatus from '../../../organization/organizationVerifiedStatus/OrganizationVerifiedStatus';

export interface AssociatedOrganizationCardProps extends SpaceWelcomeSectionContributorProps {
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
              <DialogTitle>
                {t('components.associated-organization.confirmation-dialog.title', {
                  organization: profile?.displayName,
                })}
              </DialogTitle>
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
      index={
        associatesCount && (
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box display="flex">
              <Caption sx={{ marginRight: 1, flexGrow: 1 }}>{loading ? <Skeleton /> : 'Associates'}</Caption>
              {loading ? (
                <Skeleton variant="circular">
                  <CircleTag text={`${associatesCount}`} color="primary" size="small" />
                </Skeleton>
              ) : (
                <CircleTag text={`${associatesCount}`} color="primary" size="small" />
              )}
            </Box>
            {loading ? (
              <Skeleton>
                <OrganizationVerifiedStatus verified={Boolean(verified)} />
              </Skeleton>
            ) : (
              <OrganizationVerifiedStatus verified={Boolean(verified)} />
            )}
          </Box>
        )
      }
      {...props}
    />
  );
};

export default AssociatedOrganizationCard;
