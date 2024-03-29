import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import JourneyAvatar from '../../common/JourneyAvatar/JourneyAvatar';

interface StackedAvatarProps {
  avatarUris: string[];
}

const StackedAvatar = ({ avatarUris }: StackedAvatarProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: gutters(2), height: gutters(2), position: 'relative', flex: '0 0 15%' }}>
      {avatarUris.map((avatarUri, index) => {
        return (
          <JourneyAvatar
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
            alt={t('visuals-alt-text.avatar.name')}
          />
        );
      })}
    </Box>
  );
};

export default StackedAvatar;
