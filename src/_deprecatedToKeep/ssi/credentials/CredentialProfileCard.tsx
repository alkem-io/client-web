import HelpButton from '@/core/ui/button/HelpButton';
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { PropsWithChildren, forwardRef } from 'react';

export interface ProfileCardProps {
  title: string;
  subtitle?: string;
  helpText?: string;
}

export const CredentialProfileCard = forwardRef<HTMLDivElement | null, ProfileCardProps>(
  ({ title, subtitle, helpText, children }: PropsWithChildren<ProfileCardProps>, ref) => {
    return (
      <Card
        ref={ref}
        sx={{ bgcolor: 'neutralLight.main', width: 1 }}
        square
        aria-label="profile-card"
        elevation={0}
        variant="outlined"
      >
        <CardHeader
          sx={{ pb: 1 }}
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
        <CardContent sx={{ pt: 1 }}>{children}</CardContent>
      </Card>
    );
  }
);
export default CredentialProfileCard;
