import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import SpaceAvatar from '@/domain/space/components/SpaceAvatar';

const StackedAvatar = ({ avatarUris }: { avatarUris: string[] }) => (
  <Box sx={{ width: gutters(2), height: gutters(2), position: 'relative', flex: '0 0 15%' }}>
    {avatarUris.map((avatarUri, index) => {
      return (
        <SpaceAvatar
          key={index}
          sx={{
            width: gutters(1.5),
            height: gutters(1.5),
            zIndex: index,
            position: 'absolute',
            top: theme => `${theme.spacing(index * 0.5)}`,
            left: theme => `${theme.spacing(index * 0.5)}`,
            border: theme => `${theme.spacing(0.2)} solid #FFFFFF`,
            borderRadius: theme => theme.spacing(0.6),
          }}
          src={avatarUri}
        />
      );
    })}
  </Box>
);

export default StackedAvatar;
