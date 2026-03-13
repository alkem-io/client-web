import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';
import CardFooterAvatar from './CardFooterAvatar';

type CardFooterBadgeProps = {
  avatarUri?: string;
  avatarDisplayName?: string;
};

const CardFooterBadge = ({ avatarUri, avatarDisplayName, children }: PropsWithChildren<CardFooterBadgeProps>) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" gap={gutters()} alignItems="center" height={gutters(2)}>
      {avatarUri && (
        <CardFooterAvatar
          src={avatarUri}
          alt={avatarDisplayName ? t('common.avatar-of', { user: avatarDisplayName }) : t('common.avatar')}
        />
      )}
      <Caption noWrap={true}>{children}</Caption>
    </Box>
  );
};

export default CardFooterBadge;
