import Avatar from '@/core/ui/avatar/Avatar';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { Box, Button, DialogActions, DialogContent, Divider, Grid, Typography, styled } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTranslation } from 'react-i18next';
import { useUserMetadata } from '../index';
import useUserContributionDisplayNames from '../userContributions/useUserContributionDisplayNames';

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',

  [theme.breakpoints.down('lg')]: {
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
}));

const Profile = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),

  [theme.breakpoints.down('lg')]: {
    gap: 0,
    flexGrow: 1,
  },
}));

const UserName = styled('div')(({ theme }) => ({
  whiteSpace: 'nowrap',
  display: 'flex',

  [theme.breakpoints.down('lg')]: {
    flexGrow: 1,
    justifyContent: 'center',
  },
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& > thead > tr > th': {
    background: theme.palette.primary.main,
    color: theme.palette.background.paper,
  },
  '& td': {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  },
}));

type UserPopUpProps = {
  id: string;
  onHide: () => void;
};

const getStringOfNames = (arr: string[]) => arr.join(', ');

const UserPopUp = ({ id, onHide }: UserPopUpProps) => {
  const { t } = useTranslation();

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
        <Header>
          <Profile>
            <Avatar
              src={user?.profile.avatar?.uri}
              sx={{ borderRadius: 1 }}
              size="large"
              aria-label={t('common.avatar-of', { user: user?.profile.displayName })}
            />
            <UserName>
              <Typography variant="h3">{user?.profile.displayName}</Typography>
            </UserName>
          </Profile>
          {user?.profile.description && (
            <Box display="flex" flexGrow={1}>
              <p>{user?.profile.description}</p>
            </Box>
          )}
        </Header>
      </DialogHeader>
      <DialogContent
        dividers
        sx={{
          maxHeight: 600,
          overflow: 'auto',
        }}
      >
        {loading ? (
          <Loading text={'Loading user'} />
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" justifyContent="center">
              <TagsComponent tags={tags} size="medium" variant="filled" />
            </Box>
            <div>
              <StyledTable size="small">
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
                      <TableCell align="center">Groups</TableCell>
                      <TableCell align="center">{getStringOfNames(spaces)}</TableCell>
                    </TableRow>
                  )}
                  {challenges && challenges.length > 0 && (
                    <TableRow>
                      <TableCell align="center">Challenges</TableCell>
                      <TableCell align="center">{getStringOfNames(challenges)}</TableCell>
                    </TableRow>
                  )}
                  {organizations && organizations.length > 0 && (
                    <TableRow>
                      <TableCell align="center">Organizations</TableCell>
                      <TableCell align="center">{getStringOfNames(organizations)}</TableCell>
                    </TableRow>
                  )}
                  {opportunities && opportunities.length > 0 && (
                    <TableRow>
                      <TableCell align="center">Opportunities</TableCell>
                      <TableCell align="center">{getStringOfNames(opportunities)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </StyledTable>
              {noMembership && (
                <Box display="flex" justifyContent="center">
                  User has no memberships
                </Box>
              )}
            </div>
            {refs.length > 0 && (
              <>
                <Divider />
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
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Link href={user?.profile?.url ?? ''} underline="none">
          <Button variant="outlined" aria-label="user-profile-button">
            {t('buttons.view-profile')}
          </Button>
        </Link>
      </DialogActions>
    </Dialog>
  );
};

export default UserPopUp;
