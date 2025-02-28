import { useEffect, useState } from 'react';

import { Trans, useTranslation } from 'react-i18next';
import { CloudOff, CloudDone } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Theme, Tooltip, IconButton, useMediaQuery, Dialog, DialogContent, DialogContentText } from '@mui/material';

import Gutters from '@/core/ui/grid/Gutters';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';

type SaveRequestIndicatorIconProps = {
  isSaved: boolean;
  date: Date | undefined;
};

export const SaveRequestIndicatorIcon = ({ date, isSaved }: SaveRequestIndicatorIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formattedTime, setFormattedTime] = useState<string>();

  const { t } = useTranslation();

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  const handleMessageOpen = () => setIsOpen(true);
  const handleMessageClose = () => setIsOpen(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(date && formatTimeElapsed(date, t, 'long'));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [date]);

  const savedText = t('pages.whiteboard.last-saved', { datetime: formattedTime });
  const unsavedText = (
    <Trans
      i18nKey="pages.whiteboard.unsuccessful-save"
      components={{ p: <p />, strong: <strong /> }}
      values={{ datetime: formattedTime, warningMessage: isOpen ? '' : t('common.warning') + ':' }}
    />
  );

  if (!date) {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <IconButton>
          <ClickAwayListener onClickAway={handleMessageClose}>
            {isSaved ? (
              <Tooltip
                title={savedText}
                disableFocusListener
                disableHoverListener
                slotProps={{ popper: { disablePortal: true } }}
                onClose={handleMessageClose}
              >
                <CloudDone onClick={handleMessageOpen} />
              </Tooltip>
            ) : (
              <Tooltip
                title={unsavedText}
                disableFocusListener
                disableHoverListener
                slotProps={{ popper: { disablePortal: true } }}
                onClose={handleMessageClose}
              >
                <CloudOff sx={theme => ({ color: theme.palette.error.main })} onClick={handleMessageOpen} />
              </Tooltip>
            )}
          </ClickAwayListener>
        </IconButton>
      ) : (
        <IconButton>
          {isSaved ? (
            <Tooltip placement="bottom" title={savedText} onClick={handleMessageOpen}>
              <CloudDone />
            </Tooltip>
          ) : (
            <Tooltip placement="bottom" title={unsavedText} onClick={handleMessageOpen}>
              <CloudOff sx={theme => ({ color: theme.palette.error.main })} />
            </Tooltip>
          )}
        </IconButton>
      )}

      <Dialog open={isOpen} onClose={handleMessageClose}>
        <DialogContent>
          {!isSaved && <DialogHeader title={t('common.warning')} onClose={handleMessageClose} />}

          <Gutters sx={{ display: 'grid', placeItems: 'center' }}>
            <DialogContentText sx={{ textAlign: isSaved ? 'center' : 'left' }}>
              {isSaved ? savedText : unsavedText}
            </DialogContentText>
          </Gutters>
        </DialogContent>
      </Dialog>
    </>
  );
};
