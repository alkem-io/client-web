import AddIcon from '@mui/icons-material/Add';
import { Box, type BoxProps, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import Loading from '../loading/Loading';
import { BlockSectionTitle } from '../typography';

type AddButtonProps = {
  caption?: string;
  onClick: () => unknown | Promise<unknown>;
  disabled?: boolean;
} & BoxProps;

const AddButton = ({ onClick, caption, disabled, ...props }: AddButtonProps) => {
  const { t } = useTranslation();
  const [handleClick, loading] = useLoadingState(async () => await onClick());
  return (
    <Box
      display="flex"
      alignItems="center"
      role="button"
      aria-label={caption ?? t('buttons.add')}
      {...(disabled ? undefined : { sx: { cursor: 'pointer' }, onClick: handleClick })}
      {...props}
    >
      <IconButton color="primary" disabled={disabled}>
        {loading ? <Loading /> : <AddIcon />}
      </IconButton>
      <BlockSectionTitle color={disabled ? 'textDisabled' : undefined}>{caption ?? t('buttons.add')}</BlockSectionTitle>
    </Box>
  );
};

export default AddButton;
