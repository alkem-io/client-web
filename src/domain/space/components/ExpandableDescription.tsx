import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import AutomaticOverflowGradient from '@/core/ui/overflow/AutomaticOverflowGradient';
import SeeMore from '@/core/ui/content/SeeMore';
import { gutters } from '@/core/ui/grid/utils';

export interface ExpandableDescriptionProps {
  description: string | undefined;
  editPath?: string;
  canEdit?: boolean;
  disableParagraphPadding?: boolean;
  headerSlot?: ReactNode;
  /** Tab index (0-based) to auto-open the edit dialog on the settings page */
  tabIndex?: number;
}

const ExpandableDescription = ({
  description,
  editPath,
  canEdit = false,
  disableParagraphPadding = false,
  headerSlot,
  tabIndex,
}: ExpandableDescriptionProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!description) {
    return null;
  }

  const handleEditClick = () => {
    if (editPath) {
      const pathWithEditTab = tabIndex !== undefined ? `${editPath}?editTab=${tabIndex}` : editPath;
      navigate(pathWithEditTab);
    }
  };

  const handleExpandToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Box onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <AutomaticOverflowGradient
        maxHeight={isExpanded ? undefined : gutters(4)}
        overflowMarker={<SeeMore label="buttons.readMore" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
      >
        {headerSlot}
        {canEdit && editPath && isHovered && (
          <Box
            sx={{
              position: 'absolute',
              top: gutters(0.2),
              right: gutters(0.5),
              zIndex: 1,
            }}
          >
            <IconButton onClick={handleEditClick} size="small" sx={{ color: 'primary.main' }}>
              <EditOutlined />
            </IconButton>
          </Box>
        )}
        <WrapperMarkdown disableParagraphPadding={disableParagraphPadding}>{description}</WrapperMarkdown>
      </AutomaticOverflowGradient>
      {isExpanded && <SeeMore label="buttons.showLess" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
    </Box>
  );
};

export default ExpandableDescription;
