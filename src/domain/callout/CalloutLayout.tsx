import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Card } from '@mui/material';
import Heading from '../shared/components/Heading';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export interface CalloutLayoutProps {
  callout: {
    id: string;
    displayName: string;
    description?: string;
    draft?: boolean;
    editable?: boolean;
  };
  maxHeight?: number;
}

const CalloutLayout = ({ callout, children, maxHeight }: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();

  return (
    <Card key={callout.id}>
      {callout.draft && (
        <Box padding={1.5} sx={{ color: 'neutralLight.main', backgroundColor: 'primary.main' }}>
          <Heading textAlign="center">{t('callout.draftNotice')}</Heading>
        </Box>
      )}
      <Box m={3} position="relative">
        {callout.editable && (
          <Link to={''}>
            <SettingsOutlinedIcon
              sx={theme => ({ position: 'absolute', right: theme.spacing(-1.5), top: theme.spacing(-1.5) })}
            />
          </Link>
        )}
        <Heading sx={{ display: 'flex', gap: 2.5 }}>
          <CampaignOutlinedIcon sx={{ fontSize: theme => theme.spacing(3) }} /> {callout.displayName}
        </Heading>
        <Typography sx={{ marginY: 2 }}>{callout.description}</Typography>
        {/* Padding are set to prevent cutting Paper shadow by overflow: scroll. Margins are compensating the visual shift. */}
        <Box
          maxHeight={maxHeight && (theme => theme.spacing(maxHeight + 4))}
          overflow={typeof maxHeight === 'undefined' ? undefined : 'auto'}
          padding={2}
          margin={-2}
        >
          {children}
        </Box>
      </Box>
    </Card>
  );
};

export default CalloutLayout;
