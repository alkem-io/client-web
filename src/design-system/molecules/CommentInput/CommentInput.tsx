import React from 'react';
import { Box, TextField, Button, Avatar, Stack } from '@mui/material';

export interface CommentInputProps {
  userAvatarSrc?: string;
  userAvatarAlt?: string;
  placeholder?: string;
  onSubmit: (text: string) => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  userAvatarSrc,
  userAvatarAlt = 'User',
  placeholder = 'Add a comment...',
  onSubmit,
}) => {
  const [text, setText] = React.useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Avatar src={userAvatarSrc} alt={userAvatarAlt} />
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder={placeholder}
          value={text}
          onChange={e => setText(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSubmit} disabled={!text.trim()}>
            Post
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
