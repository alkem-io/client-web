import { CircularProgress, IconButton, IconButtonProps } from '@mui/material';

const LoadingIconButton = ({ loading, ...props }: IconButtonProps & { loading?: boolean }) =>
  loading ? <CircularProgress /> : <IconButton {...props} />;

export default LoadingIconButton;
