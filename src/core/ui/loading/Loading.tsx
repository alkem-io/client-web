import { CircularProgress } from '@mui/material';
import WrapperTypography from '../typography/deprecated/WrapperTypography';
import { useLoadingStyles } from './Loading.styles';

export const Loading = ({ text = 'Loading' }: { text?: string }) => {
  const styles = useLoadingStyles();

  return (
    <div className={styles.container}>
      <CircularProgress className={styles.spinner} />
      <WrapperTypography variant="caption" color="primary" className={styles.text}>
        {text}
      </WrapperTypography>
    </div>
  );
};

export default Loading;
