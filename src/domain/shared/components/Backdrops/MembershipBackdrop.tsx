import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import { Box } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import WrapperBackdrop from './WrapperBackdrop';

interface BackdropProps {
  show?: boolean;
  blockName?: React.ReactNode;
  message?: string;
}

/**
 * @deprecated figure out whether it's still needed
 */
const MembershipBackdrop: FC<BackdropProps> = ({ children, blockName, show = false }) => {
  const { t } = useTranslation();

  if (!show) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <WrapperBackdrop>{children}</WrapperBackdrop>
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'column',
          placeContent: 'center',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <WrapperTypography variant="h3">{t('components.backdrop.private', { blockName })}</WrapperTypography>
      </Box>
    </div>
  );
};

export default MembershipBackdrop;
