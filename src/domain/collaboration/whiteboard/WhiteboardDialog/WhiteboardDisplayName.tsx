import { Button, TextField } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { Cancel, Edit, Save } from '@mui/icons-material';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { LoadingButton } from '@mui/lab';

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
  const [isEditing, setIsEditing] = useState(editDisplayName);
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  useEffect(() => {
    // Keep the newDisplayName in sync with the displayName
    setNewDisplayName(displayName);
  }, [displayName]);

  const [handleSave, loading] = useLoadingState(async (newDisplayName: string) => {
    await onChangeDisplayName?.(newDisplayName);
    setIsEditing(false);
  });

  return (
    <>
      {readOnlyDisplayName && displayName}
      {!readOnlyDisplayName && !isEditing && (
        <>
          {displayName}
          <Button onClick={() => setIsEditing(true)}>
            <Edit />
          </Button>
        </>
      )}
      {!readOnlyDisplayName && isEditing && (
        <>
          <TextField value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} size="small" />
          <LoadingButton loading={loading} onClick={() => handleSave(newDisplayName)}>
            <Save />
          </LoadingButton>
          <Button
            onClick={() => {
              setIsEditing(false);
              setNewDisplayName(displayName);
            }}
          >
            <Cancel />
          </Button>
        </>
      )}
    </>
  );
};

export default WhiteboardDisplayName;
