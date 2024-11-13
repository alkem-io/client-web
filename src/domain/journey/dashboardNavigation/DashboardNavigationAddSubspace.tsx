import React, { MouseEventHandler } from 'react';
import BadgeCardView from '@core/ui/list/BadgeCardView';
import RouterLink from '@core/ui/link/RouterLink';
import Avatar from '@core/ui/avatar/Avatar';
import { AddCircleOutlineOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CaptionSmall } from '@core/ui/typography';
import { getIndentStyle } from './utils';
import { ButtonBase } from '@mui/material';

interface DashboardNavigationAddSubspaceProps {
  url?: string;
  onClick?: MouseEventHandler;
  level?: number;
  compact?: boolean;
}

const DashboardNavigationAddSubspace = ({ url, level = 0, onClick }: DashboardNavigationAddSubspaceProps) => {
  const { t } = useTranslation();

  return (
    <BadgeCardView
      component={url ? RouterLink : ButtonBase}
      to={url ?? ''}
      onClick={onClick}
      visual={
        <Avatar size="medium" sx={{ backgroundColor: 'primary.main' }}>
          <AddCircleOutlineOutlined />
        </Avatar>
      }
      padding
      square
      sx={getIndentStyle(level)}
    >
      <CaptionSmall>{t('buttons.addSubject', { subject: t('common.subspace') })}</CaptionSmall>
    </BadgeCardView>
  );
};

export default DashboardNavigationAddSubspace;
