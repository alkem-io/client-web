import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import { Box, Button, Skeleton, styled, Tooltip } from '@mui/material';
import { ProfileChipView, ProfileChipViewProps } from './ProfileChipView';
import RemoveIcon from '@mui/icons-material/Remove';
import GridItem from '@/core/ui/grid/GridItem';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';

export interface ProfileChipProps extends ProfileChipViewProps {
  loading?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Root = styled(Box)(({ theme }) => ({
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
}));

export const ProfileChip = ({ loading, removable = false, onRemove, ...props }: ProfileChipProps) => {
  const { t } = useTranslation();

  return (
    <GridItem columns={3}>
      <Root>
        {loading && (
          <Box display="flex" flexDirection="row" alignItems="center" height={gutters(3)} gap={gutters(1)}>
            <Skeleton variant="circular" sx={{ height: gutters(2), width: gutters(2) }} />
            <Box flex="1">
              <Skeleton />
              <Skeleton />
            </Box>
          </Box>
        )}
        {!loading && (
          <ProfileChipView {...props}>
            {removable && (
              <>
                <FlexSpacer />
                <Tooltip title={t('common.remove')} arrow>
                  <RemoveButton onClick={onRemove}>
                    <RemoveIcon />
                  </RemoveButton>
                </Tooltip>
              </>
            )}
          </ProfileChipView>
        )}
      </Root>
    </GridItem>
  );
};
