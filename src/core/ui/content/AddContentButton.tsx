import { AddCircleOutlineOutlined } from '@mui/icons-material';
import { Button, type ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GridItem from '../grid/GridItem';

const AddContentButton = ({ sx, children, ...props }: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <GridItem>
      <Button
        startIcon={<AddCircleOutlineOutlined />}
        variant="outlined"
        {...props}
        sx={{ backgroundColor: 'background.paper', ...sx }}
      >
        {children ?? t('common.add')}
      </Button>
    </GridItem>
  );
};

export default AddContentButton;
