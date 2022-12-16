import React, { FC } from 'react';
import { Avatar, Box, CardHeader, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Caption, PageTitle } from '../../../../../core/ui/typography/components';
import CircleTag from '../../../../../common/components/core/CircleTag';
import { VerifiedStatus } from '../../../../../common/components/composite/common/VerifiedStatus/VerifiedStatus';
import OrganizationCardContainer from './OrganizationCardContainer';

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
}

const OrganizationCard: FC<OrganizationCardProps> = ({
  name,
  avatar,
  description,
  role,
  associatesCount,
  verified,
  loading,
  url,
  handleRemoveSelfFromOrganization,
  removingFromOrganization = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigateToOrganization = () => {
    if (url) navigate(url);
  };
  return (
    <OrganizationCardContainer onClick={navigateToOrganization}>
      <CardHeader
        title={<PageTitle>{loading ? <Skeleton width="80%" /> : name}</PageTitle>}
        subheader={
          <>
            <Caption>{loading ? <Skeleton width="80%" /> : description}</Caption>
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
                <VerifiedStatus verified={Boolean(verified)} />
              </Skeleton>
            ) : (
              <VerifiedStatus verified={Boolean(verified)} />
            )}
          </Box>
        }
      />
      <Box display="flex" justifyContent="flex-end" paddingY={1} paddingX={1.5}>
        <LoadingButton
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={event => {
            handleRemoveSelfFromOrganization();
            event.stopPropagation();
          }}
          loading={removingFromOrganization}
        >
          {t('common.disassociate')}
        </LoadingButton>
      </Box>
    </OrganizationCardContainer>
  );
};

export default OrganizationCard;
