import clsx from 'clsx';
import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import { useUserMetadata } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import { Loading } from '../core';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import Delimiter from '../core/Delimiter';
import Tag from '../core/Tag';
import TagContainer from '../core/TagContainer';
import Typography from '../core/Typography';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';

const useUserPopUpStyles = createStyles(theme => ({
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
  body: {
    maxHeight: 600,
    overflow: 'auto',

    '& > div': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
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
  marginBottom: {
    marginBottom: theme.spacing(2),
  },
  refRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  refDiv: {
    marginBottom: theme.spacing(1),
  },
}));

interface UserPopUpProps {
  id: string;
  onHide: () => void;
  terms?: Array<string>;
}

const UserPopUp: FC<UserPopUpProps> = ({ id, onHide }) => {
  const { t } = useTranslation();
  const styles = useUserPopUpStyles();

  const { user: userMetadata, loading } = useUserMetadata(id);
  const user = userMetadata?.user;
  const refs = user?.profile?.references || [];

  const getStringOfNames = arr => arr.join(', ');

  const tags = (userMetadata?.user?.profile?.tagsets || []).flatMap(x => x.tags);
  const groups = userMetadata?.groups || [];
  const challenges = userMetadata?.challenges || [];
  const organizations = userMetadata?.organizations || [];
  const opportunities = userMetadata?.opportunities || [];

  const noMembership =
    !(groups && groups.length > 0) &&
    !(challenges && challenges.length > 0) &&
    !(organizations && organizations.length > 0) &&
    !(opportunities && opportunities.length > 0);

  return (
    <Dialog open={true} maxWidth="md" fullWidth aria-labelledby="user-dialog-title">
      <DialogTitle id="user-dialog-title" onClose={onHide}>
        <div className={styles.header}>
          <div className={styles.profile}>
            <Avatar src={user?.profile?.avatar} size={'lg'} />
            <div className={styles.userName}>
              <Typography variant={'h3'}>{user?.displayName}</Typography>
            </div>
          </div>
          {user?.profile?.description && (
            <div className={styles.description}>
              <Typography weight={'medium'} color={'neutral'} as={'p'} clamp={3}>
                {user?.profile.description}
              </Typography>
            </div>
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers className={styles.body}>
        {loading ? (
          <Loading text={'Loading user'} />
        ) : (
          <div>
            <div className={styles.centeredText}>
              {tags.length > 0 ? (
                <TagContainer>
                  {tags.map((t, i) => (
                    <Tag key={i} text={t} color="neutralMedium" />
                  ))}
                </TagContainer>
              ) : (
                <span>No tags available</span>
              )}
            </div>
            <div>
              <Table striped bordered hover size="sm" className={styles.table}>
                <thead>
                  <tr>
                    <th>Community</th>
                    <th>List</th>
                  </tr>
                </thead>
                <tbody>
                  {groups && groups.length > 0 && (
                    <tr>
                      <td>
                        <Typography weight={'medium'} className={styles.centeredText}>
                          Groups
                        </Typography>
                      </td>
                      <td>
                        <Typography weight={'medium'}>{getStringOfNames(groups)}</Typography>
                      </td>
                    </tr>
                  )}
                  {challenges && challenges.length > 0 && (
                    <tr>
                      <td>
                        <Typography weight={'medium'} className={styles.centeredText}>
                          Challenges
                        </Typography>
                      </td>
                      <td>{getStringOfNames(challenges)}</td>
                    </tr>
                  )}
                  {organizations && organizations.length > 0 && (
                    <tr>
                      <td>
                        <Typography weight={'medium'} className={styles.centeredText}>
                          Organisations
                        </Typography>
                      </td>
                      <td>{getStringOfNames(organizations)}</td>
                    </tr>
                  )}
                  {opportunities && opportunities.length > 0 && (
                    <tr>
                      <td>
                        <Typography weight={'medium'} className={styles.centeredText}>
                          Opportunites
                        </Typography>
                      </td>
                      <td>{getStringOfNames(opportunities)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {noMembership && (
                <div className={styles.centeredText}>
                  <Typography weight={'medium'} className={styles.centeredText}>
                    User has no memberships
                  </Typography>
                </div>
              )}
            </div>
            {refs.length > 0 && (
              <>
                <Delimiter />
                <div className={clsx(styles.refDiv, 'container')}>
                  {refs.map(x => (
                    <div className={styles.refRow}>
                      <span className="col-5">{x.name}</span>
                      <span className="col-5">{x.uri}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Tooltip placement={'top'} title={'Coming soon'} id={'more-tags'}>
          <span>
            <Button variant={'primary'} disabled={true} text={t('buttons.send-message')} />
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default UserPopUp;
