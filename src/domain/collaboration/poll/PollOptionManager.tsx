import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import type { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';
import PollOptionManagerRow from '@/domain/collaboration/poll/PollOptionManagerRow';

type PollOptionManagerProps = {
  poll: PollDetailsModel;
  pollId: string;
};

type ConfirmAction = {
  type: 'edit' | 'remove';
  optionId: string;
  text?: string;
};

const MIN_OPTIONS = 2;

const PollOptionManager = ({ poll, pollId }: PollOptionManagerProps) => {
  const { t } = useTranslation();
  const { addOption, updateOption, removeOption, reorderOptions, loading } = usePollOptionManagement({ pollId });

  const [newOptionText, setNewOptionText] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const sortedOptions = [...poll.options].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      addOption(newOptionText.trim());
      setNewOptionText('');
    }
  };

  const handleEdit = (optionId: string, text: string) => {
    const option = poll.options.find(o => o.id === optionId);
    if (option?.voteCount && option.voteCount > 0) {
      setConfirmAction({ type: 'edit', optionId, text });
    } else {
      updateOption(optionId, text);
    }
  };

  const handleRemove = (optionId: string) => {
    const option = poll.options.find(o => o.id === optionId);
    if (option?.voteCount && option.voteCount > 0) {
      setConfirmAction({ type: 'remove', optionId });
    } else {
      removeOption(optionId);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'edit' && confirmAction.text) {
      updateOption(confirmAction.optionId, confirmAction.text);
    } else if (confirmAction.type === 'remove') {
      removeOption(confirmAction.optionId);
    }
    setConfirmAction(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...sortedOptions];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderOptions(newOrder.map(o => o.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedOptions.length - 1) return;
    const newOrder = [...sortedOptions];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderOptions(newOrder.map(o => o.id));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {sortedOptions.map((option, index) => (
        <PollOptionManagerRow
          key={option.id}
          option={option}
          onEdit={text => handleEdit(option.id, text)}
          onRemove={() => handleRemove(option.id)}
          canRemove={sortedOptions.length > MIN_OPTIONS}
          canMoveUp={index > 0}
          canMoveDown={index < sortedOptions.length - 1}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          disabled={loading}
        />
      ))}

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          value={newOptionText}
          onChange={e => setNewOptionText(e.target.value)}
          size="small"
          placeholder={t('poll.options.add')}
          fullWidth={true}
          inputProps={{ maxLength: 512 }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddOption();
          }}
        />
        <Button size="small" onClick={handleAddOption} disabled={loading || !newOptionText.trim()}>
          {t('poll.options.add')}
        </Button>
      </Box>

      <Dialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        aria-labelledby="poll-confirmation-title"
        aria-describedby="poll-confirmation-description"
      >
        <DialogTitle id="poll-confirmation-title">{t('buttons.confirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="poll-confirmation-description">
            {confirmAction?.type === 'edit' ? t('poll.options.confirmEdit') : t('poll.options.confirmRemove')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>{t('poll.vote.cancelButton')}</Button>
          <Button onClick={handleConfirmAction} color="error" autoFocus={true}>
            {t('buttons.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PollOptionManager;
