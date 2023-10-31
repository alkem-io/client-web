import React, { FC, useCallback, useState } from 'react';
import { Box, Dialog, DialogContent, Link, useTheme } from '@mui/material';
import { BlockTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Trans, useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import useVersionControl from '../../metadata/useVersionControl';

const SKIP_THIS_VERSION = false; // if true the dialog is never shown
const Icon = props => <Box sx={{ display: 'inline', fontSize: '1.5em', marginRight: gutters(0.5) }} {...props} />;

const ReleaseUpdatesDialog: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);
  const { isCurrentVersionViewed, saveCurrentVersionViewed } = useVersionControl();

  const handleCloseNotification = useCallback(() => {
    setIsNotificationVisible(false);
    saveCurrentVersionViewed();
  }, [setIsNotificationVisible]);

  return !SKIP_THIS_VERSION && !isCurrentVersionViewed ? (
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
  ) : null;
};

export default ReleaseUpdatesDialog;
