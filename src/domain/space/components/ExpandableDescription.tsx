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
}

const ExpandableDescription = ({
  description,
  editPath,
  canEdit = false,
  disableParagraphPadding = false,
  headerSlot,
}: ExpandableDescriptionProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return null;
  }

  const handleEditClick = () => {
    if (editPath) {
      navigate(editPath);
    }
  };

  const handleExpandToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <>
      <AutomaticOverflowGradient
        maxHeight={isExpanded ? undefined : gutters(4)}
        overflowMarker={<SeeMore label="buttons.readMore" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
      >
        {headerSlot}
        {canEdit && editPath && (
          <Box paddingLeft={0.5} paddingBottom={1} sx={{ float: 'right' }}>
            <IconButton onClick={handleEditClick} size="small" sx={{ color: 'primary.main' }}>
              <EditOutlined />
            </IconButton>
          </Box>
        )}
        <WrapperMarkdown disableParagraphPadding={disableParagraphPadding}>{description}</WrapperMarkdown>
      </AutomaticOverflowGradient>
      {isExpanded && <SeeMore label="buttons.showLess" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
    </>
  );
};

export default ExpandableDescription;
