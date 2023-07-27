import React, { FC, useCallback, useState } from 'react';
import { Box, Dialog, DialogContent, Link, useTheme } from '@mui/material';
import { BlockTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Trans, useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';

interface ReleaseNotificationData {
  prevClientVersion: string;
}
const Icon = props => <Box sx={{ display: 'inline', fontSize: '1.5em', marginRight: gutters(0.5) }} {...props} />;

const PlatformUpdates: FC = () => {
  const { t } = useTranslation();
  const clientVersion = process.env.REACT_APP_VERSION || '';
  const theme = useTheme();
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);

  const handleCloseNotification = useCallback(() => {
    const updatedReleaseNotificationData: ReleaseNotificationData = {
      prevClientVersion: clientVersion,
    };

    setIsNotificationVisible(false);
    localStorage.setItem('releaseNotification', JSON.stringify(updatedReleaseNotificationData));
  }, [setIsNotificationVisible, clientVersion]);

  return (
    <>
      {isNotificationVisible && (
        <Dialog open={isNotificationVisible} maxWidth="lg">
          <DialogHeader onClose={handleCloseNotification}>
            <BlockTitle>
              <Icon>{t('notifications.releaseUpdates.icon')}</Icon>
              {t('notifications.releaseUpdates.title')}
            </BlockTitle>
          </DialogHeader>
          <DialogContent>
            <Trans
              i18nKey="notifications.releaseUpdates.content"
              components={{
                br: <br />,
                b: <strong />,
                i: <em />,
                ul: <ul />,
                li: <li />,
                clickhere: (
                  <Link
                    underline="always"
                    target="_blank"
                    rel="noopener noreferrer"
                    color={theme.palette.primary.main}
                    href={t('notifications.releaseUpdates.url')}
                  />
                ),
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PlatformUpdates;
