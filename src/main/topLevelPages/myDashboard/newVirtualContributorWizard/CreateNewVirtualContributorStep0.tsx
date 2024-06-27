import React from 'react';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Box, Button, ButtonProps, DialogContent, Theme, Tooltip, useMediaQuery } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { gutters } from '../../../../core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import Loading from '../../../../core/ui/loading/Loading';

type CreateNewVirtualContributorStep0Props = {
  canUseExisting?: boolean;
  onClose: () => void;
  onCreateSubspace: () => void;
  onUseExistingSubspace: () => void;
  loading?: boolean;
};

const BigButton = ({ tooltipDisabled, ...props }: ButtonProps & { tooltipDisabled?: string }) => {
  const button = (
    <Box flexBasis="50%">
      <Button
        variant="outlined"
        startIcon={<BookOutlinedIcon />}
        sx={{
          flexDirection: 'column',
          gap: gutters(1),
          padding: gutters(1),
          textTransform: 'none',
        }}
        {...props}
      />
    </Box>
  );

  return tooltipDisabled && props.disabled ? <Tooltip title={tooltipDisabled}>{button}</Tooltip> : button;
};

const CreateNewVirtualContributorStep0 = ({
  canUseExisting,
  onClose,
  onCreateSubspace,
  onUseExistingSubspace,
  loading,
}: CreateNewVirtualContributorStep0Props) => {
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  return (
    <>
      <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.step0.title')}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding maxWidth={gutters(15)}>
          <Caption>{t('createVirtualContributorWizard.step0.description')}</Caption>
          {loading && <Loading />}
          {!loading && (
            <Box display="flex" flexDirection={isSmallScreen ? 'column' : 'row'} width="100%" gap={gutters()}>
              <BigButton onClick={onCreateSubspace}>
                {t('createVirtualContributorWizard.step0.createSubspace')}
              </BigButton>
              <BigButton
                onClick={onUseExistingSubspace}
                tooltipDisabled={t('createVirtualContributorWizard.step0.cannotUseExisting')}
                disabled={!canUseExisting}
              >
                {t('createVirtualContributorWizard.step0.useExistingSubspace')}
              </BigButton>
            </Box>
          )}
        </Gutters>
      </DialogContent>
    </>
  );
};

export default CreateNewVirtualContributorStep0;
