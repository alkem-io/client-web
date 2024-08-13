import React from 'react';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Box, Button, DialogContent, Tooltip } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { gutters } from '../../../../core/ui/grid/utils';

import { Actions } from '../../../../core/ui/actions/Actions';

interface TryVCInfoDialogProps {
  spaceId: string;
  vcName: string;
  open: boolean;
  onClose: () => void;
}

const TryVCInfoDialog: React.FC<TryVCInfoDialogProps> = ({ vcName, open, onClose }) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader title={t('createVirtualContributorWizard.trySection.title')} onClose={onClose} />
      <DialogContent>
        <Gutters disablePadding>
          <Box display="flex" gap={gutters(0.5)}>
            <Caption alignSelf="center">
              <Trans
                i18nKey="createVirtualContributorWizard.trySection.subTitle"
                values={{ vcName: vcName }}
                components={{
                  b: <strong />,
                  i: <em />,
                  icon: <InfoOutlinedIcon fontSize="small" color="primary" style={{ verticalAlign: 'bottom' }} />,
                  tooltip: (
                    <Tooltip title={t('createVirtualContributorWizard.trySection.subTitleInfo')} arrow placement="top">
                      <></>
                    </Tooltip>
                  ),
                }}
              />
            </Caption>
          </Box>
          <Box display="flex" gap={gutters(0.5)}>
            <Caption alignSelf="center">
              <Trans
                i18nKey="createVirtualContributorWizard.trySection.lastInfoBox"
                components={{
                  b: <strong />,
                }}
              />
            </Caption>
          </Box>
          <Actions justifyContent="end">
            <Button variant="contained" onClick={onClose}>
              {t('createVirtualContributorWizard.trySection.continueButton')}
            </Button>
          </Actions>
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default TryVCInfoDialog;
