import { FC } from 'react';
import { Box, BoxProps, Button, Skeleton } from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import { useMessagingUserDetailsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { BlockSectionTitle } from '../../../../../core/ui/typography';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';

interface UserSelectorViewProps extends BoxProps {
  id: string;
  displayName: string;
  city: string | undefined;
  country: string | undefined;
  avatarUrl: string | undefined;
}

export const UserSelectorView: FC<UserSelectorViewProps> = ({
  id,
  displayName,
  city,
  country,
  avatarUrl,
  ...containerProps
}) => {
  const { t } = useTranslation();

  return (
    <Box {...containerProps}>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: gutters(3), alignItems: 'center' }}>
        <Box
          component="img"
          width={gutters(2)}
          height={gutters(2)}
          mr={gutters(1)}
          src={avatarUrl}
          loading="lazy"
          alt={t('common.avatar-of', { user: displayName })}
        />
        <Box>
          <BlockSectionTitle>{displayName}</BlockSectionTitle>
          <BlockSectionTitle>
            {city && country ? `${city}, ` : city}
            {country}
          </BlockSectionTitle>
        </Box>
      </Box>
    </Box>
  );
};

interface UserSelectedViewProps {
  id: string;
  removable: boolean;
  onRemove: () => void;
}

export const UserSelectedView: FC<UserSelectedViewProps> = ({ id, removable, onRemove }) => {
  const { data, loading } = useMessagingUserDetailsQuery({
    variables: { id },
  });

  const user = data?.user;

  return (
    <PageContentBlock accent>
      {(!user || loading) && <Skeleton />}
      {user && !loading && (
        <UserSelectorView
          id={user.id}
          displayName={user.displayName}
          city={user.profile?.location?.city}
          country={user.profile?.location?.country}
          avatarUrl={user.profile?.avatar?.uri}
        />
      )}
      {removable && <Button onClick={onRemove}>-</Button>}
    </PageContentBlock>
  );
};
