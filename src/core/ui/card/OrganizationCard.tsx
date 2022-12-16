import { Avatar, Box, CardHeader, Skeleton } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import LinkCard from '../../../common/components/core/LinkCard/LinkCard';
import CircleTag from '../../../common/components/core/CircleTag';
import VerifiedStatus from '../../../common/components/composite/common/VerifiedStatus/VerifiedStatus';
import { LoadingButton } from '@mui/lab';
import { Caption, PageTitle } from '../typography/components';

const LINES_TO_SHOW = 4;

export interface OrganizationCardProps {
  name?: string;
  avatar?: string;
  description?: string;
  role?: string;
  associatesCount?: number;
  verified?: boolean;
  loading?: boolean;
  url?: string;
  transparent?: boolean;
  handleRemoveSelfFromOrganization: () => void;
  removingFromOrganization?: boolean;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.background.default,
    },
    cardHeader: {
      padding: theme.spacing(1),
      alignItems: 'flex-start',
    },
    cardHeaderAction: {
      margin: 0,
      paddingRight: theme.spacing(3),
    },
    multiLineEllipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      '-webkit-line-clamp': LINES_TO_SHOW,
      '-webkit-box-orient': 'vertical',
    },
  })
);

const OrganizationCard: FC<OrganizationCardProps> = ({
  name,
  avatar,
  description,
  role,
  associatesCount,
  verified,
  loading,
  url,
  transparent = false,
  handleRemoveSelfFromOrganization,
  removingFromOrganization = false,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <LinkCard
      to={url}
      aria-label="associated-organization-card"
      classes={{
        root: transparent ? undefined : styles.card,
      }}
      elevationDisabled={transparent}
    >
      <CardHeader
        className={styles.cardHeader}
        classes={{
          action: styles.cardHeaderAction,
        }}
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
            event.preventDefault();
          }}
          loading={removingFromOrganization}
        >
          {t('common.disassociate')}
        </LoadingButton>
      </Box>
    </LinkCard>
  );
};

export default OrganizationCard;
