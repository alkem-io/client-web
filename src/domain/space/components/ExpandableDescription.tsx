import { useState, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import AutomaticOverflowGradient from '@/core/ui/overflow/AutomaticOverflowGradient';
import SeeMore from '@/core/ui/content/SeeMore';
import { gutters } from '@/core/ui/grid/utils';
import { TabbedLayoutParams } from '@/main/routing/urlBuilders';
import { useTranslation } from 'react-i18next';

export interface ExpandableDescriptionProps {
  description: string | undefined;
  editPath?: string;
  canEdit?: boolean;
  disableParagraphPadding?: boolean;
  headerSlot?: ReactNode;
  /** If true, appends editTab param based on current tab URL param (for L0 tabbed layout only) */
  useEditTab?: boolean;
}

const ExpandableDescription = ({
  description,
  editPath,
  canEdit = false,
  disableParagraphPadding = false,
  headerSlot,
  useEditTab = true,
}: ExpandableDescriptionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!description) {
    return null;
  }

  const handleEditClick = () => {
    if (editPath) {
      if (useEditTab) {
        // Get current tab from URL (1-based), default to 1 if not present
        const currentTab = parseInt(searchParams.get(TabbedLayoutParams.Section) ?? '1', 10);
        // Convert to 0-based index for editTab
        const editTabIndex = currentTab - 1;
        navigate(`${editPath}?editTab=${editTabIndex}`);
      } else {
        navigate(editPath);
      }
    }
  };

  const handleExpandToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Box onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} sx={{ position: 'relative' }}>
      <AutomaticOverflowGradient
        maxHeight={isExpanded ? undefined : gutters(4)}
        overflowMarker={<SeeMore label="buttons.readMore" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
      >
        {headerSlot}
        {canEdit && editPath && (
          <Box
            sx={{
              position: 'absolute',
              top: gutters(0.2),
              right: gutters(0.5),
              zIndex: 1,
            }}
          >
            <IconButton
              onClick={handleEditClick}
              size="small"
              sx={{
                color: 'primary.main',
                opacity: isHovered ? 1 : 0,
                '&:focus': {
                  opacity: 1,
                },
              }}
              aria-label={`${t('common.enums.edit-mode.edit')} ${t('common.description')}`}
            >
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
