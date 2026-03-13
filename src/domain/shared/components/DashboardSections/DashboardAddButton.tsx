import { AddCircleOutlineOutlined } from '@mui/icons-material';
import { ButtonBase, type SxProps, type Theme } from '@mui/material';
import type { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import Avatar from '@/core/ui/avatar/Avatar';
import RouterLink from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { CaptionSmall } from '@/core/ui/typography';
import { getIndentStyle } from '../../../space/components/spaceDashboardNavigation/dashboardNavigation/utils';

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
        <Avatar size="medium" sx={{ backgroundColor: 'primary.main' }} alt={t('common.add')}>
          <AddCircleOutlineOutlined />
        </Avatar>
      }
      square={true}
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
