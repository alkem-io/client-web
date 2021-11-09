import { Card, CardContent, CardHeader, createStyles, makeStyles, Typography } from '@material-ui/core';
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

export const ProfileCard: FC<ProfileCardProps> = forwardRef(({ title, helpText, children }, ref) => {
  const styles = useStyles();

  return (
    <Card ref={ref} elevation={0} className={styles.card} square aria-label="profile-card">
      <CardHeader
        className={styles.cardHeader}
        title={
          <Typography variant="h3">
            {title}
            {helpText && <HelpButton helpText={helpText} />}
          </Typography>
        }
      />
      <CardContent className={styles.cardContent}>{children}</CardContent>
    </Card>
  );
});
export default ProfileCard;
