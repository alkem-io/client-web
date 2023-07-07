import React, { FC, useCallback, useState } from 'react';
import { Link, useTheme } from '@mui/material';
import UpdatesContainer from './Components/UpdatesContainer';
import CloseButton from './Components/CloseButton';
import { useConfig } from '../../config/useConfig';
import { Caption } from '../../../../core/ui/typography';
import { TranslateWithElements } from '../../../shared/i18n/TranslateWithElements';
import CelebrationIcon from '@mui/icons-material/Celebration';

interface ReleaseNotificationData {
  prevClientVersion: string;
}

const PlatformUpdates: FC = () => {
  const clientVersion = import.meta.env.VITE_VERSION || '';
  const theme = useTheme();
  const { platform } = useConfig();
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);

  const handleCloseNotification = useCallback(() => {
    const updatedReleaseNotificationData: ReleaseNotificationData = {
      prevClientVersion: clientVersion,
    };

    setIsNotificationVisible(false);
    localStorage.setItem('releaseNotification', JSON.stringify(updatedReleaseNotificationData));
  }, [setIsNotificationVisible, clientVersion]);

  const tLinks = TranslateWithElements(
    <Link underline="always" target="_blank" rel="noopener noreferrer" color={theme.palette.background.default} />
  );

  return (
    <>
      {isNotificationVisible && (
        <UpdatesContainer>
          <Caption flexGrow={1} textAlign="center">
            <CelebrationIcon fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: theme.spacing(0.5) }} />
            {tLinks('notifications.release-updates.text', {
              clickhere: {
                href: platform?.releases ?? '',
              },
            })}
          </Caption>
          <CloseButton
            sx={{
              color: theme.palette.background.default,
            }}
            onClick={handleCloseNotification}
          />
        </UpdatesContainer>
      )}
    </>
  );
};

export default PlatformUpdates;
