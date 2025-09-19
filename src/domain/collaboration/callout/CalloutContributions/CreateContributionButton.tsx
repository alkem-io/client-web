import { IconButton, IconButtonProps } from '@mui/material';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

const CreateContributionButton = (props: IconButtonProps) => {
  const { t } = useTranslation();
  return (
    <IconButton aria-label={t('common.add')} size="small" {...props}>
      <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
    </IconButton>
  );
};

export default CreateContributionButton;
