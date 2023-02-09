import { FC } from 'react';
import { Box, Button, Skeleton, styled, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMessagingUserDetailsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import { UserSelectorView } from './UserSelectorView';
import RemoveIcon from '@mui/icons-material/Remove';
import GridItem from '../../../../../core/ui/grid/GridItem';

interface UserSelectedViewProps {
  userId: string;
  removable: boolean;
  onRemove: () => void;
}

const UserChip = styled(Box)(({ theme }) => ({
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: theme.palette.grey.main,
  borderRadius: theme.shape.borderRadius,
  paddingLeft: gutters(0.5)(theme),
  paddingRight: gutters(0.5)(theme),
}));

const RemoveButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  width: gutters(1.5)(theme),
  height: gutters(1.5)(theme),
  padding: 0,
  color: theme.palette.grey.dark,
  // Put the button on the right of the flex
  marginLeft: 'auto',
}));

/**
 * Just a wrapper border around UserSelectorView to reuse the same styles and to add a RemoveButton if needed
 * @param param0
 * @returns
 */
export const UserSelectedView: FC<UserSelectedViewProps> = ({ userId, removable, onRemove }) => {
  const { t } = useTranslation();

  const { data, loading } = useMessagingUserDetailsQuery({
    variables: { id: userId },
  });

  const user = data?.user;

  return (
    <GridItem columns={3}>
      <UserChip>
        {(!user || loading) && (
          <Box display="flex" flexDirection="row" alignItems="center" height={gutters(3)} gap={gutters(1)}>
            <Skeleton variant="circular" sx={{ height: gutters(2), width: gutters(2) }} />
            <Box flex="1">
              <Skeleton />
              <Skeleton />
            </Box>
          </Box>
        )}
        {user && !loading && (
          <UserSelectorView
            id={user.id}
            displayName={user.displayName}
            city={user.profile?.location?.city}
            country={user.profile?.location?.country}
            avatarUrl={user.profile?.avatar?.uri}
          >
            {removable && (
              <Tooltip title={t('common.remove')} arrow>
                <RemoveButton onClick={onRemove}>
                  <RemoveIcon />
                </RemoveButton>
              </Tooltip>
            )}
          </UserSelectorView>
        )}
      </UserChip>
    </GridItem>
  );
};
