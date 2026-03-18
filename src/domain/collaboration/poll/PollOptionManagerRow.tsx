import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';

type PollOptionManagerRowProps = {
  option: PollOptionModel;
  onEdit: (text: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled?: boolean;
};

const PollOptionManagerRow = ({
  option,
  onEdit,
  onRemove,
  canRemove,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  disabled = false,
}: PollOptionManagerRowProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(option.text);

  // Reset edit state when the option changes (e.g. parent reorders or replaces the option)
  useEffect(() => {
    setEditText(option.text);
    setIsEditing(false);
  }, [option.id]);

  const handleConfirmEdit = () => {
    if (editText.trim() && editText !== option.text) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(option.text);
    setIsEditing(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton size="small" onClick={onMoveUp} disabled={!canMoveUp || disabled} aria-label="Move up">
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onMoveDown} disabled={!canMoveDown || disabled} aria-label="Move down">
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Box>

      {isEditing ? (
        <TextField
          value={editText}
          onChange={e => setEditText(e.target.value)}
          size="small"
          fullWidth={true}
          autoFocus={true}
          inputProps={{ maxLength: 512 }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleConfirmEdit();
            if (e.key === 'Escape') handleCancelEdit();
          }}
        />
      ) : (
        <Typography variant="body2" sx={{ flex: 1 }}>
          {option.text}
        </Typography>
      )}

      {isEditing ? (
        <>
          <IconButton size="small" onClick={handleConfirmEdit} disabled={disabled}>
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelEdit} disabled={disabled}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            aria-label={t('poll.options.edit')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <Tooltip title={canRemove ? '' : t('poll.options.minRequired')}>
            <span>
              <IconButton
                size="small"
                onClick={onRemove}
                disabled={!canRemove || disabled}
                aria-label={t('poll.options.remove')}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default PollOptionManagerRow;
