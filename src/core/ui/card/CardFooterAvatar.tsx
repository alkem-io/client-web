import { AvatarProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import Avatar from '../avatar/Avatar';

const size = (theme: Theme) => theme.spacing(2.5);

const CardFooterAvatar = ({ sx, ...props }: AvatarProps) => (
  <Avatar {...props} sx={{ width: size, height: size, ...sx }} />
);

export default CardFooterAvatar;
