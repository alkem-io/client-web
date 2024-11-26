import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import CardFooterAvatar from './CardFooterAvatar';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';
import { useTranslation } from 'react-i18next';

type CardFooterBadgeProps = {
  avatarUri?: string;
  avatarDisplayName?: string;
};

const CardFooterBadge = ({ avatarUri, avatarDisplayName, children }: PropsWithChildren<CardFooterBadgeProps>) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" gap={gutters()} alignItems="center" height={gutters(2)}>
      {avatarUri && (
        <CardFooterAvatar src={avatarUri} aria-label={t('common.avatar-of', { user: avatarDisplayName })} />
      )}
      <Caption noWrap>{children}</Caption>
    </Box>
  );
};

export default CardFooterBadge;
