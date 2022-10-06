import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, IconButton, Skeleton, styled, TextField, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import CopyIcon from '@mui/icons-material/ContentCopy';

interface ShareDialogProps {
  url: string | undefined;
  loading?: boolean;
  open: boolean;
  onClose: () => void;
  entityTypeName: 'hub' | 'challenge' | 'opportunity' | 'user' | 'organization' | 'callout' | 'card' | 'canvas';
}

const FIELD_WIDTH = 100;

const ShareForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
}));

export const ShareDialog: FC<ShareDialogProps> = ({ url, loading, open, onClose, entityTypeName }) => {
  const { t } = useTranslation();
  const textField = useRef<HTMLInputElement>(null);
  const [copied, setAlreadyCopied] = useState(false);
  const fullUrl = window.location.protocol + '//' + window.location.host + url;

  const copy = () => {
    if (textField.current && typeof textField.current?.select === 'function') {
      textField.current.select();
    }
    if (url) {
      navigator.clipboard.writeText(fullUrl);

      setAlreadyCopied(true);
      window.setTimeout(() => setAlreadyCopied(false), 2000);
    }
  };

  const handleClick = e => {
    e.target.select();
  };

  return (
    <Dialog open={open}>
      <DialogTitle onClose={onClose}>
        <Box display="flex" gap={1}>
          <Typography variant="h5">{t('share-dialog.title', { entity: entityTypeName })}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading || !url ? (
          <Skeleton variant="rectangular">
            <TextField sx={{ width: theme => theme.spacing(FIELD_WIDTH) }} />
          </Skeleton>
        ) : (
          <ShareForm>
            <TextField
              inputRef={textField}
              InputProps={{
                readOnly: true,
                onClick: handleClick,
                sx: { color: theme => theme.palette.neutralMedium.dark },
              }}
              label={t('share-dialog.url')}
              value={fullUrl}
              sx={{ flexGrow: 1, width: theme => theme.spacing(FIELD_WIDTH) }}
            />
            <Tooltip title={copied ? t('share-dialog.copied') : t('share-dialog.copy')} arrow>
              <IconButton color="primary" onClick={() => copy()}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </ShareForm>
        )}
      </DialogContent>
    </Dialog>
  );
};
