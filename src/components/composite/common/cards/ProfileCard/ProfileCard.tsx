import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, forwardRef } from 'react';
import HelpButton from '../../../../core/HelpButton';

export interface ProfileCardProps {
  title: string;
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

export const ProfileCard: FC<ProfileCardProps> = forwardRef<HTMLDivElement | null, ProfileCardProps>(
  ({ title, helpText, children }, ref) => {
    const styles = useStyles();

    return (
      <Card ref={ref} elevation={0} className={styles.card} square aria-label="profile-card">
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
        />
        <CardContent className={styles.cardContent}>{children}</CardContent>
      </Card>
    );
  }
);
export default ProfileCard;
