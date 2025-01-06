import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

type DescriptionViewProps = {
  description: string | undefined;
  canEdit?: boolean;
  onEditClick?: () => void;
};

export const DescriptionView = ({ description, canEdit = false, onEditClick = noop }: DescriptionViewProps) => {
  const { t } = useTranslation();

  return (
    <Gutters row alignItems="center">
      <Box flex={1} sx={{ wordWrap: 'break-word' }}>
        <WrapperMarkdown disableParagraphPadding>{description ?? ''}</WrapperMarkdown>
      </Box>
      {canEdit && onEditClick && (
        <IconButton
          size="small"
          onClick={onEditClick}
          disabled={!canEdit}
          className="only-on-hover"
          aria-label={t('buttons.edit')}
        >
          <EditIcon />
        </IconButton>
      )}
    </Gutters>
  );
};
