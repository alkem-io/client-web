import { Box, Typography } from '@mui/material';
import React, { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import WrapperBackdrop from './WrapperBackdrop';

interface BackdropProps extends PropsWithChildren {
  show?: boolean;
  blockName?: React.ReactNode;
}

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
        <Typography variant="h3" mb={1} fontWeight="medium">
          {t('components.backdrop.private', { blockName })}
        </Typography>
      </Box>
    </div>
  );
};

export default MembershipBackdrop;
