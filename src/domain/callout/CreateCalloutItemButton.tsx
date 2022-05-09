import { styled } from '@mui/material';
import { PropsWithChildren, ReactNode } from 'react';
import LinkCard from '../../common/components/core/LinkCard/LinkCard';
import Typography from '../../common/components/core/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import React from 'react';

const ButtonElement = styled(LinkCard)(() => ({
  cursor: 'pointer',
  position: 'relative',
}));

// SpaceBuffer component will take the dimensions of the children passed and set the width and height of the whole button
const SpaceBuffer = styled('div')(({ theme }) => ({
  visibility: 'hidden',
  minWidth: theme.spacing(10),
  minHeight: theme.spacing(10),
}));

const ButtonContent = styled('div')(({ theme }) => ({
  // Adjust to the children dimensions:
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',

  // Center the + Icon:
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.common.white,
  '& .MuiSvgIcon-root': {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
  },
}));

interface CreateCalloutItemButtonProps {
  onClick: () => void;
  children: ReactNode;
}
const CreateCalloutItemButton = ({ onClick, children }: PropsWithChildren<CreateCalloutItemButtonProps>) => {
  return (
    <ButtonElement onClick={onClick}>
      <SpaceBuffer>{children}</SpaceBuffer>
      <ButtonContent>
        <Typography variant="h1" weight="bold" color="primary">
          <AddCircleOutlineIcon width={20} />
        </Typography>
      </ButtonContent>
    </ButtonElement>
  );
};

export default CreateCalloutItemButton;
