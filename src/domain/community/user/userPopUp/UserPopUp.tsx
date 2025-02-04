import Avatar from '@/core/ui/avatar/Avatar';
import { DialogContent } from '@/core/ui/dialog/deprecated';
import Loading from '@/core/ui/loading/Loading';
import Tag from '@/core/ui/tags/deprecated/Tag';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import { Button, DialogActions, Grid } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { useUserMetadata } from '../index';
import useUserContributionDisplayNames from '../userContributions/useUserContributionDisplayNames';
import UserPopUpDelimiter from './UserPopUpDelimiter';
import UserPopUpTagContainer from './UserPopUpTagContainer';
import RouterLink from '@/core/ui/link/RouterLink';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

const useUserPopUpStyles = makeStyles(theme => ({
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
      // textAlign: 'center',
    },
    '& td': {
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    },
  },
}));

type UserPopUpProps = {
  id: string;
  onHide: () => void;
};

const getStringOfNames = (arr: string[]) => arr.join(', ');

const UserPopUp = ({ id, onHide }: UserPopUpProps) => {
  const { t } = useTranslation();
  const styles = useUserPopUpStyles();

  const { user: userMetadata, loading } = useUserMetadata(id);
  const user = userMetadata?.user;
  const refs = user?.profile.references || [];

  const { spaces, challenges, opportunities, organizations } = useUserContributionDisplayNames();

  const tags = (userMetadata?.user?.profile.tagsets || []).flatMap(x => x.tags);

  const noMembership =
    !(spaces && spaces.length > 0) &&
    !(challenges && challenges.length > 0) &&
    !(organizations && organizations.length > 0) &&
    !(opportunities && opportunities.length > 0);

  return (
    <Dialog open maxWidth="md" fullWidth aria-labelledby="user-dialog-title">
      <DialogHeader onClose={onHide}>
        <div className={styles.header}>
          <div className={styles.profile}>
            <Avatar
              src={user?.profile.avatar?.uri}
              sx={{ borderRadius: 1 }}
              size="large"
              aria-label={t('common.avatar-of', { user: user?.profile.displayName })}
            />
            <div className={styles.userName}>
              <WrapperTypography variant={'h3'}>{user?.profile.displayName}</WrapperTypography>
            </div>
          </div>
          {user?.profile.description && (
            <div className={styles.description}>
              <WrapperTypography weight={'medium'} color={'neutral'} as={'p'}>
                {user?.profile.description}
              </WrapperTypography>
            </div>
          )}
        </div>
      </DialogHeader>
      <DialogContent dividers className={styles.body}>
        {loading ? (
          <Loading text={'Loading user'} />
        ) : (
          <div>
            <div className={styles.centeredText}>
              {tags.length > 0 ? (
                <UserPopUpTagContainer>
                  {tags.map((t, i) => (
                    <Tag key={i} text={t} color="neutralMedium" />
                  ))}
                </UserPopUpTagContainer>
              ) : (
                <span>No tags available</span>
              )}
            </div>
            <div>
              <Table size="small" className={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell component="th" align="center">
                      Community
                    </TableCell>
                    <TableCell component="th" align="center">
                      List
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spaces && spaces.length > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        <WrapperTypography weight={'medium'} className={styles.centeredText}>
                          Groups
                        </WrapperTypography>
                      </TableCell>
                      <TableCell align="center">
                        <WrapperTypography weight={'medium'}>{getStringOfNames(spaces)}</WrapperTypography>
                      </TableCell>
                    </TableRow>
                  )}
                  {challenges && challenges.length > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        <WrapperTypography weight={'medium'} className={styles.centeredText}>
                          Challenges
                        </WrapperTypography>
                      </TableCell>
                      <TableCell align="center">{getStringOfNames(challenges)}</TableCell>
                    </TableRow>
                  )}
                  {organizations && organizations.length > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        <WrapperTypography weight={'medium'} className={styles.centeredText}>
                          Organizations
                        </WrapperTypography>
                      </TableCell>
                      <TableCell align="center">{getStringOfNames(organizations)}</TableCell>
                    </TableRow>
                  )}
                  {opportunities && opportunities.length > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        <WrapperTypography weight={'medium'} className={styles.centeredText}>
                          Opportunites
                        </WrapperTypography>
                      </TableCell>
                      <TableCell align="center">{getStringOfNames(opportunities)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {noMembership && (
                <div className={styles.centeredText}>
                  <WrapperTypography weight={'medium'} className={styles.centeredText}>
                    User has no memberships
                  </WrapperTypography>
                </div>
              )}
            </div>
            {refs.length > 0 && (
              <>
                <UserPopUpDelimiter />
                <Grid container spacing={2}>
                  {refs.map((x, i) => (
                    <Grid key={i} item container justifyContent={'center'}>
                      <Grid item xs={5}>
                        {x.name}
                      </Grid>
                      <Grid item xs={5}>
                        {x.uri}
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {user?.profile.url && (
          <Link component={RouterLink} to={user.profile.url} underline="none">
            <Button variant="outlined" aria-label="user-profile-button">
              {t('buttons.view-profile')}
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserPopUp;
