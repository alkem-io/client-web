import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { useMembershipOrganisationQuery, useOrganizationDetailsQuery } from '../../hooks/generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import { Loading } from '../core';
import Typography from '../core/Typography';
import TagContainer from '../core/TagContainer';
import Tag from '../core/Tag';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const groupPopUpStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    [theme.breakpoints.down('sm')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.breakpoints.down('sm')]: {
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
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
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
  const profile = data?.organisation?.profile;
  const name = data?.organisation?.displayName;
  const tags = profile?.tagsets?.reduce((acc, curr) => acc.concat(curr.tags), [] as string[]) || [];

  const { data: membership, loading: loadingMembership } = useMembershipOrganisationQuery({
    variables: {
      input: {
        organisationID: id,
      },
    },
  });

  const ecoversesHosting = membership?.membershipOrganisation?.ecoversesHosting || [];
  const challengesLeading = membership?.membershipOrganisation?.challengesLeading || [];

  return (
    <>
      <Modal show={true} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <div className={styles.header}>
              <div className={styles.profile}>
                <Avatar src={profile?.avatar} size={'lg'} />
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
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  <span>{t('search.organization.no-tags')}</span>
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
                  <div className={styles.centeredText}>{t('search.organization.no-hosted')}</div>
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
                  <div className={styles.centeredText}>{t('search.organization.no-leading')}</div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide} text={t('buttons.close')} />
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrganizationPopUp;
