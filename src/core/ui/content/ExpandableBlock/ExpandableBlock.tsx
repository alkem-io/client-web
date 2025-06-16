import { useState } from 'react';
import { Box, BoxProps, Collapse, Divider, IconButton, IconButtonProps, styled } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ExpandMoreButtonProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMoreButton = styled((props: ExpandMoreButtonProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

interface ExpandableBlock extends BoxProps {
  title: string;
}

const ExpandableBlock = ({ title, children, ...containerProps }: BoxProps) => {
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => setExpanded(expanded => !expanded);

  return (
    <Box {...containerProps}>
      <Box
        display="flex"
        alignItems="center"
        onClick={handleExpandClick}
        marginBottom={gutters()}
        sx={{ cursor: 'pointer' }}
      >
        <Caption>{title}</Caption>
        <Divider sx={{ flexGrow: 1, marginLeft: gutters(0.5) }} />
        <ExpandMoreButton expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label={title}>
          <ExpandMoreIcon />
        </ExpandMoreButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </Box>
  );
};

export default ExpandableBlock;
