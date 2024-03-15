import React, { FC, useState } from 'react';
import { Avatar, Box, Button, CardHeader, Dialog, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Caption, PageTitle } from '../../../../../core/ui/typography/components';
import CircleTag from '../../../../../core/ui/tags/CircleTag';
import { OrganizationVerifiedStatus } from '../../../organization/organizationVerifiedStatus/OrganizationVerifiedStatus';
import OrganizationCardContainer from './OrganizationCardContainer';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../core/ui/dialog/deprecated';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';

interface OrganizationCardProps {
  name?: string;
  avatar?: string;
  description?: string;
  role?: string;
  associatesCount?: number;
  verified?: boolean;
  loading?: boolean;
  url?: string;
  handleRemoveSelfFromOrganization: () => void;
  removingFromOrganization?: boolean;
  enableLeave?: boolean;
}

const OrganizationCard: FC<OrganizationCardProps> = ({
  name,
  avatar,
  description = '',
  role,
  associatesCount,
  verified,
  loading,
  url,
  handleRemoveSelfFromOrganization,
  removingFromOrganization = false,
  enableLeave,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  const navigateToOrganization = () => {
    if (url) navigate(url);
  };

  const handleSubmit = () => {
    handleRemoveSelfFromOrganization();
    handleClose();
  };

  const handleOpenModal = () => {
    setIsDialogOpened(true);
  };

  const handleClose = () => {
    setIsDialogOpened(false);
  };

  return (
    <OrganizationCardContainer onClick={navigateToOrganization}>
      <CardHeader
        title={<PageTitle>{loading ? <Skeleton width="80%" /> : name}</PageTitle>}
        subheader={
          <>
            <Caption>{loading ? <Skeleton width="80%" /> : <OneLineMarkdown>{description}</OneLineMarkdown>}</Caption>
            <Caption variant="body2" color="primary">
              {loading ? <Skeleton width="30%" /> : role}
            </Caption>
          </>
        }
        avatar={
          loading ? (
            <Skeleton variant="rectangular">
              <Avatar variant="rounded" src={avatar} sx={{ width: '64px', height: '64px' }} />
            </Skeleton>
          ) : (
            <Avatar variant="rounded" src={avatar} sx={{ width: '64px', height: '64px' }}>
              {name && name[0]}
            </Avatar>
          )
        }
        action={
          <Box display="flex" flexDirection="column" justifyContent="space-between">
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
        }
      />
      {enableLeave && (
        <Box display="flex" justifyContent="flex-end" paddingY={1} paddingX={1.5}>
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
      )}
      {enableLeave && (
        <Dialog open={isDialogOpened} maxWidth="xs" aria-labelledby="confirm-leave-organization">
          <DialogTitle>
            {t('components.associated-organization.confirmation-dialog.title', { organization: name })}
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
      )}
    </OrganizationCardContainer>
  );
};

export default OrganizationCard;
