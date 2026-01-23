import React from 'react';
import { GlobalStyles } from '@mui/material';

export const CollaborativeMarkdownInputStyles = (
  <GlobalStyles
    styles={{
      '.tiptap.ProseMirror': {
        height: '100%',
      },
      '.tiptap': {
        /* Give a remote user a caret */
        '.collaboration-carets__caret': {
          borderLeft: '1px solid #0d0d0d',
          borderRight: '1px solid #0d0d0d',
          marginLeft: '-1px',
          marginRight: '-1px',
          pointerEvents: 'none',
          position: 'relative',
          wordBreak: 'normal',
        },
        /* Render the username above the caret */
        '.collaboration-carets__label': {
          borderRadius: '3px 3px 3px 0',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: '600',
          left: '-1px',
          lineHeight: 'normal',
          padding: '0.1rem 0.3rem',
          position: 'absolute',
          top: '-1.4em',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        },
      },
    }}
  />
);
