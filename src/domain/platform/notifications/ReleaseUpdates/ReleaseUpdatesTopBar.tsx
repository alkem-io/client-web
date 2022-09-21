import React, { FC, useCallback, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useTheme } from '@mui/material';
import UpdatesContainer from './Components/UpdatesContainer';
import TextContainer from './Components/TextContainer';
import CloseButton from './Components/CloseButton';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../../../../hooks';

interface ReleaseNotificationData {
  prevClientVersion: string;
}
const PlatformUpdates: FC = () => {
  const clientVersion = process.env.REACT_APP_VERSION || '';
  const theme = useTheme();
  const { platform } = useConfig();
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);
  const { t } = useTranslation();

  const updatedReleaseNotificationData: ReleaseNotificationData = {
    prevClientVersion: clientVersion,
  };

  const handleCloseNotification = useCallback(() => {
    setIsNotificationVisible(false);
    localStorage.setItem('releaseNotification', JSON.stringify(updatedReleaseNotificationData));
  }, [setIsNotificationVisible]);

  return (
    <>
      {isNotificationVisible && (
        <UpdatesContainer>
          <TextContainer>
            {t('notifications.release-updates.text')}{' '}
            <Link
              href={platform?.releases || ''}
              underline="always"
              target="_blank"
              rel="noopener noreferrer"
              color={theme.palette.background.default}
            >
              {t('notifications.release-updates.link')}
            </Link>
            ...
          </TextContainer>
          <CloseButton
            sx={{
              color: theme.palette.background.default,
            }}
            onClick={handleCloseNotification}
          >
            <CloseIcon />
          </CloseButton>
        </UpdatesContainer>
      )}
    </>
  );
};

export default PlatformUpdates;
