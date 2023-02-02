import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Skeleton, styled, TextField, Tooltip, Typography } from '@mui/material';
import CopyIcon from '@mui/icons-material/ContentCopy';

export interface ShareComponentProps {
  url: string | undefined;
  loading?: boolean;
  entityTypeName: 'hub' | 'challenge' | 'opportunity' | 'user' | 'organization' | 'callout' | 'card' | 'canvas';
}

const FIELD_WIDTH = 100;

const ShareForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
}));

export const ShareComponent: FC<Pick<ShareComponentProps, 'url' | 'loading'>> = ({ url, loading }) => {
  const { t } = useTranslation();
  const [copied, setAlreadyCopied] = useState(false);
  const fullUrl = window.location.protocol + '//' + window.location.host + url;

  const copy = () => {
    if (url) {
      navigator.clipboard.writeText(fullUrl);

      setAlreadyCopied(true);
    }
  };

  const handleClick = e => {
    e.target.select();
  };

  return (
    <>
      {loading || !url ? (
        <Skeleton variant="rectangular">
          <TextField sx={{ width: theme => theme.spacing(FIELD_WIDTH) }} />
        </Skeleton>
      ) : (
        <ShareForm>
          <TextField
            InputProps={{
              readOnly: true,
              onClick: handleClick,
              sx: { color: theme => theme.palette.neutralMedium.dark },
            }}
            label={t('share-dialog.url')}
            value={fullUrl}
            sx={{ flexGrow: 1, width: theme => theme.spacing(FIELD_WIDTH) }}
          />
          <Tooltip
            title={copied ? t('share-dialog.platforms.clipboard.copied') : t('share-dialog.platforms.clipboard.copy')}
            arrow
            onClose={() => setAlreadyCopied(false)}
          >
            <IconButton color="primary" onClick={() => copy()} sx={{ marginLeft: theme => theme.spacing(1) }}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </ShareForm>
      )}
    </>
  );
};

export const ShareComponentTitle: FC<Pick<ShareComponentProps, 'entityTypeName'>> = ({ entityTypeName }) => {
  const { t } = useTranslation();

  return (
    <Typography variant="h5">{t('share-dialog.title', { entity: t(`common.${entityTypeName}` as const) })}</Typography>
  );
};
