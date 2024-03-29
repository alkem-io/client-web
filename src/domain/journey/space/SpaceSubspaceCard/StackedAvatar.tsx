import { useTranslation } from 'react-i18next';
import { Box, styled } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';

interface StackedAvatarProps {
  uri: string[];
}

const Avatar = styled(Box)(({ theme }) => ({
  width: theme.spacing(2),
  height: theme.spacing(2),
  position: 'absolute',
  borderRadius: 4,
  border: '1px solid #FFFFFF',
  '& > img': {
    width: theme.spacing(2),
    height: theme.spacing(2),
    objectFit: 'cover',
  },
}));

const StackedAvatar = ({ uri }: StackedAvatarProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: gutters(1.5), height: gutters(1.5), position: 'relative', flex: '0 0 10%' }}>
      {uri.map((u, index) => {
        return (
          <Avatar sx={{ zIndex: index, top: `${index * 4}px`, left: `${index * 4}px` }}>
            <img src={u ? u : '/src/domain/journey/defaultVisuals/Card.jpg'} alt={t('visuals-alt-text.avatar.name')} />
          </Avatar>
        );
      })}
    </Box>
  );
};

export default StackedAvatar;
