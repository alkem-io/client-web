import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { PropsWithChildren, forwardRef } from 'react';
import HelpButton from '@/core/ui/button/HelpButton';

export interface ProfileCardProps {
  title: string;
  subtitle?: string;
  helpText?: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
      width: '100%',
    },
    cardHeader: {
      paddingBottom: theme.spacing(1),
    },
    cardContent: {
      paddingTop: theme.spacing(1),
    },
  })
);

export const CredentialProfileCard = forwardRef<HTMLDivElement | null, ProfileCardProps>(
  ({ title, subtitle, helpText, children }: PropsWithChildren<ProfileCardProps>, ref) => {
    const styles = useStyles();

    return (
      <Card ref={ref} className={styles.card} square aria-label="profile-card" elevation={0} variant="outlined">
        <CardHeader
          className={styles.cardHeader}
          title={
            <Typography variant="h4" alignItems="center" display="flex">
              <Box component="span" fontWeight="bold">
                {title}
              </Box>
              {helpText && <HelpButton helpText={helpText} />}
            </Typography>
          }
          subheader={subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
        />
        <CardContent className={styles.cardContent}>{children}</CardContent>
      </Card>
    );
  }
);
export default CredentialProfileCard;
