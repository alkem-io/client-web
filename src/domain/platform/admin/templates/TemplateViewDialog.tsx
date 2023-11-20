import { Box, Button, DialogActions, DialogContent, DialogProps, Typography } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DialogWhiteBg from '../../../shared/components/DialogWhiteBg';
import { Template } from './AdminTemplatesSection';
import Image from '../../../../core/ui/image/Image';

interface TemplateViewDialogProps<T extends Template> {
  template: T;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl?: string;
  editLinkState?: Record<string, unknown>;
}

const TemplateViewDialog = <T extends Template>({
  template,
  open,
  onClose,
  editUrl,
  editLinkState,
  children,
}: PropsWithChildren<TemplateViewDialogProps<T>>) => {
  const { t } = useTranslation();

  const {
    profile: { displayName, visual, description },
  } = template;

  return (
    <DialogWhiteBg open={open} onClose={onClose}>
      {visual?.uri && <Image src={visual.uri} alt={description} />}
      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box display="flex" minWidth={theme => theme.spacing(46)} justifyContent="space-between" alignItems="center">
          <Typography variant="h5" color="primary" fontWeight="bold">
            {displayName}
          </Typography>
          <DialogActions sx={{ p: 0 }}>
            {editUrl && (
              <Button component={Link} variant="contained" to={editUrl} state={editLinkState}>
                {t('common.update')}
              </Button>
            )}
          </DialogActions>
        </Box>
        {children}
      </DialogContent>
    </DialogWhiteBg>
  );
};

export default TemplateViewDialog;
