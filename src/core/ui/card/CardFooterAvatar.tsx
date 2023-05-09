import { Avatar, AvatarProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const size = (theme: Theme) => theme.spacing(2.5);

const CardFooterAvatar = ({ sx, ...props }: AvatarProps) => {
  return <Avatar {...props} sx={{ width: size, height: size, ...sx }} />;
};

export default CardFooterAvatar;
