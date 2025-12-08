import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import AutomaticOverflowGradient from '@/core/ui/overflow/AutomaticOverflowGradient';
import SeeMore from '@/core/ui/content/SeeMore';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import useCurrentTabPosition from '../layout/tabbedLayout/useCurrentTabPosition';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const tabPosition = useCurrentTabPosition();

  if (!description) {
    return null;
  }

  const handleEditClick = () => {
    if (editPath) {
      if (useEditTab) {
        // Convert to 0-based index for editTab, ensuring it's never negative
        const editTabIndex = Math.max(0, tabPosition - 1);
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
    <Box
      sx={{
        position: 'relative',
        '&:hover .edit-button': {
          opacity: 1,
        },
      }}
    >
      <AutomaticOverflowGradient
        maxHeight={isExpanded ? undefined : gutters(4)}
        overflowMarker={<SeeMore label="buttons.readMore" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
      >
        {headerSlot}
        {canEdit && editPath && (
          <Box
            sx={{
              position: 'absolute',
              top: gutters(0.05),
              right: gutters(0.4),
              zIndex: 1,
            }}
          >
            <IconButton
              className="edit-button"
              onClick={handleEditClick}
              size="small"
              sx={{
                color: 'primary.main',
                opacity: 0,
                '&:focus-visible, &:hover': {
                  color: 'highlight.dark',

                  opacity: 1,
                  backgroundColor: 'highlight.main',
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
