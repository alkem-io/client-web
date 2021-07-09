import React, { FC } from 'react';
import { Modal, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import { useUserMetadata } from '../../hooks/useUserMetadata';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
import Loading from '../core/Loading';
import Typography from '../core/Typography';
import { useTranslation } from 'react-i18next';
import Tag from '../core/Tag';
import TagContainer from '../core/TagContainer';

const useUserPopUpStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    gap: theme.shape.spacing(4),
    alignItems: 'center',

    [theme.media.down('sm')]: {
      flexWrap: 'wrap',
      gap: theme.shape.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.shape.spacing(1),

    [theme.media.down('sm')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.media.down('sm')]: {
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
      gap: theme.shape.spacing(2),
    },
  },
  centeredText: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.shape.spacing(1),
  },
  table: {
    '& > thead > tr > th': {
      background: theme.palette.primary,
      color: theme.palette.background,
      textAlign: 'center',
    },
    '& td': {
      padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(2)}px`,
    },
  },
  marginBottom: {
    marginBottom: theme.shape.spacing(2),
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
    <Modal show={true} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
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
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
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
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <OverlayTrigger placement={'top'} overlay={<Tooltip id={'more-tags'}>Coming soon</Tooltip>}>
          <span>
            <Button variant={'primary'} disabled={true}>
              Send message
            </Button>
          </span>
        </OverlayTrigger>
        <Button onClick={onHide}>{t('buttons.close')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserPopUp;
