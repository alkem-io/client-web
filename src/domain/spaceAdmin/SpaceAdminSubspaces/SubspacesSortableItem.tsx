import { useSortable } from '@dnd-kit/sortable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, IconButton } from '@mui/material';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { SearchableListItem } from '@/domain/platformAdmin/components/SearchableList';
import SpaceCardHorizontal from '@/domain/space/components/cards/SpaceCardHorizontal';

type SubspacesSortableItemProps = {
  item: SearchableListItem;
  disabled?: boolean;
  actions?: ReactNode;
  indicator?: ReactNode;
};

const SubspacesSortableItem: FC<SubspacesSortableItemProps> = ({ item, disabled = false, actions, indicator }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {!disabled && (
        <IconButton
          aria-label={t('pages.admin.space.sections.subspaces.reorderSubspaces')}
          {...listeners}
          {...attributes}
          sx={{ cursor: 'grab', touchAction: 'none', flexShrink: 0 }}
        >
          <DragIndicatorIcon />
        </IconButton>
      )}
      {disabled && <Box sx={{ width: 40, flexShrink: 0 }} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <SpaceCardHorizontal
          size="medium"
          space={{ id: item.id, about: { profile: item.profile }, level: item.level }}
          deepness={0}
          seamless={true}
          sx={{ maxWidth: '100%', padding: 0 }}
          actions={actions}
          indicator={indicator}
          disableHoverState={true}
        />
      </Box>
    </Box>
  );
};

export default SubspacesSortableItem;
