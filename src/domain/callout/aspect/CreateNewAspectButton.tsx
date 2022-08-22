import { styled } from '@mui/material';
import { FC } from 'react';
import LinkCard from '../../../components/core/LinkCard/LinkCard';
import Typography from '../../../components/core/Typography';
import {
  CONTRIBUTION_CARD_THEME_HEIGHT,
  CONTRIBUTION_CARD_THEME_WIDTH,
} from '../../shared/components/ContributionCard/ContributionCardV2';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CreateButtonProps } from '../../shared/layout/CardsLayout/CardsLayout';

const ButtonElement = styled(LinkCard)(({ theme }) => ({
  width: theme.spacing(CONTRIBUTION_CARD_THEME_WIDTH),
  minHeight: theme.spacing(CONTRIBUTION_CARD_THEME_HEIGHT),
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

export const CreateNewAspectButton: FC<CreateButtonProps> = ({ onClick }) => {
  return (
    <ButtonElement onClick={onClick}>
      <Typography variant="h1" weight="bold" color="primary">
        <AddCircleOutlineIcon width={20} />
      </Typography>
    </ButtonElement>
  );
};
