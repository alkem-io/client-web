import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import SpaceAvatar from '@/domain/space/components/SpaceAvatar';

const StackedAvatar = ({ avatarUris }: { avatarUris: { src: string; alt: string }[] }) => {
  const isSingleAvatar = avatarUris.length === 1;
  // fix vertical alignment when only one avatar
  const topOffsetCorrection = isSingleAvatar ? 0.5 : 0;

  return (
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
              top: theme => `${theme.spacing(index * 0.5 + topOffsetCorrection)}`,
              left: theme => `${theme.spacing(index * 0.5)}`,
              border: theme => `${theme.spacing(0.2)} solid #FFFFFF`,
              borderRadius: theme => theme.spacing(0.6),
            }}
            src={avatarUri.src}
            alt={avatarUri.alt}
          />
        );
      })}
    </Box>
  );
};

export default StackedAvatar;
