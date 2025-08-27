import { Theme } from '@mui/material/styles';
import Avatar, { CustomAvatarProps } from '../avatar/Avatar';

const size = (theme: Theme) => theme.spacing(2.5);

const CardFooterAvatar = ({ sx, src, alt }: CustomAvatarProps) => (
  <Avatar src={src} alt={alt} sx={{ width: size, height: size, ...sx }} />
);

export default CardFooterAvatar;
