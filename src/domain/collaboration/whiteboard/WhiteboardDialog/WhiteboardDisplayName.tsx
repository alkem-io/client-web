import { Box, Button, TextField } from '@mui/material';
import React, { FC, useEffect, useRef, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockTitle } from '../../../../core/ui/typography';

interface WhiteboardDisplayNameProps {
  displayName: string | undefined;
  readOnlyDisplayName?: boolean;
  editDisplayName?: boolean;
  onChangeDisplayName?: (displayName: string) => Promise<void>;
}

const WhiteboardDisplayName: FC<WhiteboardDisplayNameProps> = ({
  displayName = '',
  readOnlyDisplayName,
  editDisplayName = false,
  onChangeDisplayName,
}) => {
  const { t } = useTranslation();
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(editDisplayName);
  const [newDisplayName, setNewDisplayName] = useState(displayName);

  useEffect(() => {
    // Keep the newDisplayName in sync with the displayName
    setNewDisplayName(displayName);
  }, [displayName]);

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  const [handleSave, loading] = useLoadingState(async (newDisplayName: string) => {
    await onChangeDisplayName?.(newDisplayName);
    setIsEditing(false);
  });

  return (
    <>
      {readOnlyDisplayName && <BlockTitle>{displayName}</BlockTitle>}
      {!readOnlyDisplayName && !isEditing && (
        <>
          <BlockTitle>{displayName}</BlockTitle>
          <Box display="flex" alignItems="center" height={gutters()}>
            <Button onClick={handleClickEdit} aria-label={t('pages.whiteboard.editDisplayName')}>
              {t('pages.whiteboard.editDisplayName')}
            </Button>
          </Box>
        </>
      )}
      {!readOnlyDisplayName && isEditing && (
        <Box display="flex" alignItems="center" height={gutters()}>
          <TextField
            inputRef={textFieldRef}
            value={newDisplayName}
            onChange={e => setNewDisplayName(e.target.value)}
            size="small"
            autoFocus
          />
          <Box sx={{ marginX: 1 }}>
            <LoadingButton
              aria-label={t('buttons.save')}
              loading={loading}
              onClick={() => handleSave(newDisplayName)}
              sx={{ minWidth: 0, marginRight: 0, paddingX: 1 }}
            >
              <CheckIcon fontSize="small" />
            </LoadingButton>
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

export default WhiteboardDisplayName;
