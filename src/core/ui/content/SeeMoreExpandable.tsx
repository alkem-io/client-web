import { Button } from '@mui/material';
import { ReactNode, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

type SeeMoreExpandableProps = {
  label?: ReactNode;
  labelExpanded?: ReactNode;
  labelCollapsed?: ReactNode;
  onExpand?: () => void;
  onCollapse?: () => void;
};

const SeeMoreExpandable = ({
  label,
  labelExpanded = label,
  labelCollapsed = label,
  onExpand,
  onCollapse,
}: SeeMoreExpandableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(wasExpanded => {
      if (wasExpanded) {
        onCollapse?.();
      } else {
        onExpand?.();
      }
      return !wasExpanded;
    });
  };

  return (
    <Button
      startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
      onClick={handleClick}
      sx={{ textTransform: 'none' }}
    >
      {isExpanded ? labelExpanded : labelCollapsed}
    </Button>
  );
};

export default SeeMoreExpandable;
