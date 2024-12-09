import React, { MouseEventHandler } from 'react';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import RouterLink from '@/core/ui/link/RouterLink';
import Avatar from '@/core/ui/avatar/Avatar';
import { AddCircleOutlineOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CaptionSmall } from '@/core/ui/typography';
import { getIndentStyle } from '../../../journey/dashboardNavigation/utils';
import { ButtonBase, SxProps, Theme } from '@mui/material';

interface DashboardAddButtonProps {
  url?: string;
  onClick?: MouseEventHandler;
  level?: number;
  compact?: boolean;
  translationKey?: TranslationKey;
  sx?: SxProps<Theme>;
}

export const DashboardAddButton = ({ url, level = 0, onClick, translationKey, sx }: DashboardAddButtonProps) => {
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
      square
      sx={{ ...getIndentStyle(level), ...sx }}
    >
      <CaptionSmall>
        {translationKey
          ? t(translationKey, { defaultValue: t('common.add') })
          : t('buttons.addSubject', { subject: t('common.subspace') })}
      </CaptionSmall>
    </BadgeCardView>
  );
};
