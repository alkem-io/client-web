import { Box, Button, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle } from '@/core/ui/typography';
import { Edit } from '@mui/icons-material';
import { useGlobalGridColumns } from '@/core/ui/grid/constants';

type MemoDisplayNameProps = {
  displayName: string | undefined;
  readOnlyDisplayName?: boolean;
  onChangeDisplayName?: (displayName: string) => Promise<void>;
};

const MemoDisplayName = ({ displayName = '', readOnlyDisplayName, onChangeDisplayName }: MemoDisplayNameProps) => {
  const { t } = useTranslation();
  const columns = useGlobalGridColumns();

  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName);

  useEffect(() => {
    setNewDisplayName(displayName);
  }, [displayName]);

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  const [handleSave, loading] = useLoadingState(async (newDisplayName: string) => {
    await onChangeDisplayName?.(newDisplayName);
    setIsEditing(false);
  });

  const editTitleButton =
    columns <= 4 ? (
      <IconButton onClick={handleClickEdit} aria-label={t('pages.memo.editDisplayName')}>
        <Edit fontSize="small" color="primary" />
      </IconButton>
    ) : (
      <Button onClick={handleClickEdit} aria-label={t('pages.memo.editDisplayName')}>
        {t('pages.memo.editDisplayName')}
      </Button>
    );

  return (
    <>
      {readOnlyDisplayName && <BlockTitle>{displayName}</BlockTitle>}
      {!readOnlyDisplayName && !isEditing && (
        <Box display="flex" minWidth={0}>
          <BlockTitle whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {displayName}
          </BlockTitle>
          <Box display="flex" alignItems="center" height={gutters()}>
            {editTitleButton}
          </Box>
        </Box>
      )}
      {!readOnlyDisplayName && isEditing && (
        <Box display="flex" alignItems="center" height={gutters()}>
          <TextField value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} size="small" autoFocus />
          <Box sx={{ marginX: 1 }}>
            <Button
              aria-label={t('buttons.save')}
              loading={loading}
              onClick={() => handleSave(newDisplayName)}
              sx={{ minWidth: 0, marginRight: 0, paddingX: 1 }}
            >
              <CheckIcon fontSize="small" />
            </Button>
            <Button
              aria-label={t('buttons.cancel')}
              onClick={() => {
                setIsEditing(false);
                setNewDisplayName(displayName);
              }}
              sx={{ minWidth: 0, paddingX: 1 }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MemoDisplayName;
