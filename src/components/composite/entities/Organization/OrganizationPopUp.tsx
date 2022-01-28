import clsx from 'clsx';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import { useMembershipOrganizationQuery, useOrganizationDetailsQuery } from '../../../../hooks/generated/graphql';
import { makeStyles } from '@mui/styles';
import Avatar from '../../../core/Avatar';
import { Loading } from '../../../core';
import Typography from '../../../core/Typography';
import TagContainer from '../../../core/TagContainer';
import Tag from '../../../core/Tag';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import Button from '../../../core/Button';
import { Link } from 'react-router-dom';
import { buildOrganizationUrl } from '../../../../utils/urlBuilders';

const groupPopUpStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'center',

    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    [theme.breakpoints.down('lg')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.breakpoints.down('lg')]: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  },
  description: {
    display: 'flex',
    flexGrow: 1,
  },
  centeredText: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  table: {
    '& > thead > tr > th': {
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      textAlign: 'center',
    },
    '& td': {
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    },
  },
  tableScrollable: {
    height: '217px' /* 35px table header + 45px row * 4 rows + 1px line * 2 */,
    overflowY: 'auto',

    '& > table': {
      marginBottom: 0,
    },
  },
  tablesDiv: {
    display: 'flex',
    gap: theme.spacing(2),
    flexDirection: 'column',
  },
  italic: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
}));

interface OrganizationPopUpProps {
  id: string;
  onHide: () => void;
}

const OrganizationPopUp: FC<OrganizationPopUpProps> = ({ onHide, id }) => {
  const { t } = useTranslation();
  const styles = groupPopUpStyles();

  const { data, loading: loadingOrg } = useOrganizationDetailsQuery({ variables: { id } });
  const profile = data?.organization?.profile;
  const name = data?.organization?.displayName;
  const nameID = data?.organization?.nameID;
  const tags = profile?.tagsets?.reduce((acc, curr) => acc.concat(curr.tags), [] as string[]) || [];

  const { data: membership, loading: loadingMembership } = useMembershipOrganizationQuery({
    variables: {
      input: {
        organizationID: id,
      },
    },
  });

  const ecoversesHosting = membership?.membershipOrganization?.ecoversesHosting || [];
  const challengesLeading = membership?.membershipOrganization?.challengesLeading || [];

  return (
    <Dialog open={true} maxWidth="md" fullWidth aria-labelledby="org-dialog-title">
      <DialogTitle id="org-dialog-title" onClose={onHide}>
        <div className={styles.header}>
          <div className={styles.profile}>
            <Avatar src={profile?.avatar?.uri} size={'lg'} />
            <div className={styles.userName}>
              <Typography variant={'h3'}>{name}</Typography>
            </div>
          </div>
          {profile?.description && (
            <div className={styles.description}>
              <Typography weight={'medium'} color={'neutral'} as={'p'} clamp={3}>
                {profile?.description}
              </Typography>
            </div>
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {loadingOrg || loadingMembership ? (
          <Loading text={'Loading the organization'} />
        ) : (
          <div className={styles.tablesDiv}>
            <div className={styles.centeredText}>
              {tags.length > 0 ? (
                <TagContainer>
                  {tags.map((t, i) => (
                    <Tag key={i} text={t} color="neutralMedium" />
                  ))}
                </TagContainer>
              ) : (
                <span>{t('common.no-tags')}</span>
              )}
            </div>
            <div className={clsx({ [styles.tableScrollable]: ecoversesHosting.length > 0 })}>
              <Table size="small" className={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell component="th">Ecoverses hosted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ecoversesHosting.length > 0 &&
                    ecoversesHosting.map(x => (
                      <TableRow key={`tr-${x.id}`}>
                        <TableCell key={`td-${x.id}`}>{x.displayName}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {ecoversesHosting.length === 0 && (
                <div className={styles.centeredText}>{t('pages.search.organization.no-hosted')}</div>
              )}
            </div>
            <div className={clsx({ [styles.tableScrollable]: challengesLeading.length > 0 })}>
              <Table size="small" className={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Challenges being lead</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {challengesLeading.length > 0 &&
                    challengesLeading.map(x => (
                      <TableRow key={`tr-${x.id}`}>
                        <TableCell key={`td-${x.id}`}>{x.displayName}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {challengesLeading.length === 0 && (
                <div className={styles.centeredText}>{t('pages.search.organization.no-leading')}</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
      {nameID && (
        <DialogActions>
          <Button variant="primary" text={t('buttons.explore')} as={Link} to={buildOrganizationUrl(nameID)} />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OrganizationPopUp;
