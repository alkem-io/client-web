import { styled } from '@mui/material';
import { FC } from 'react';
import LinkCard from '../../../components/core/LinkCard/LinkCard';
import Typography from '../../../components/core/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CreateButtonProps } from '../../shared/layout/CardsLayout/CardsLayout';
import { SIMPLE_CARD_WIDTH } from '../../shared/components/SimpleCard';

const ButtonElement = styled(LinkCard)(({ theme }) => ({
  width: SIMPLE_CARD_WIDTH,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.common.white,
  '& .MuiSvgIcon-root': {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
  },
}));

export const CreateNewCanvasButton: FC<CreateButtonProps> = ({ onClick }) => {
  return (
    <ButtonElement onClick={onClick}>
      <Typography variant="h1" weight="bold" color="primary">
        <AddCircleOutlineIcon width={20} />
      </Typography>
    </ButtonElement>
  );
};
