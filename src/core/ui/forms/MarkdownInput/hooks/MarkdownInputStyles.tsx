import { GlobalStyles } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

export const MarkdownInputStyles = (
  <GlobalStyles
    styles={theme => ({
      '.tiptap': {
        '& :first-child': {
          marginTop: 0,
        },
        // Restore browser-default list rendering that Tailwind v4 preflight strips globally.
        'ul, ol': {
          paddingInlineStart: '2rem',
          marginBlock: '0.5rem',
        },
        ul: { listStyleType: 'disc' },
        ol: { listStyleType: 'decimal' },
        'ul ul, ol ul': { listStyleType: 'circle' },
        'ul ul ul, ol ol ul': { listStyleType: 'square' },
        li: { display: 'list-item' },
        blockquote: {
          borderLeft: '3px solid gray',
          margin: '1.5rem 0',
          paddingLeft: '1rem',
        },
        pre: {
          background: 'gray',
          borderRadius: '0.5rem',
          color: 'white',
          margin: '1.5rem 0',
          padding: '0.75rem 1rem',
          code: {
            background: 'none',
            color: 'inherit',
            fontSize: '0.8rem',
            padding: 0,
          },
        },
        table: {
          borderCollapse: theme.palette.markdownTable.borderCollapse,
          margin: 0,
          overflow: 'hidden',
          tableLayout: 'fixed',
          tr: {
            '&:nth-of-type(odd)': {
              backgroundColor: theme.palette.markdownTable.rowBackgroundOdd,
            },
            '&:nth-of-type(even)': {
              backgroundColor: theme.palette.markdownTable.rowBackgroundEven,
            },
          },
          td: {
            border: `1px solid ${theme.palette.markdownTable.border}`,
            minWidth: '3em',
            padding: gutters(0.5)(theme),
            verticalAlign: 'top',
          },
          th: {
            border: `1px solid ${theme.palette.markdownTable.border}`,
            minWidth: '3em',
            padding: gutters(0.5)(theme),
          },
          '.tableWrapper': {
            margin: '1.5rem 0',
            overflowX: 'auto',
          },
          '&.resize-cursor': {
            cursor: 'ew-resize',
          },
        },
      },
    })}
  />
);
