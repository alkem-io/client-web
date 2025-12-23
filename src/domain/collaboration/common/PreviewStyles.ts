import { Theme } from '@mui/material/styles';
import { gutters } from '@/core/ui/grid/utils';

// Common styles for buttons shown in previews (both memo and whiteboard)
export const previewButtonStyles = (theme: Theme) => ({
  position: 'absolute' as const,
  borderColor: theme.palette.divider,
  borderRadius: `${theme.shape.borderRadiusSquare}px`,
  zIndex: 2,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
});

// Common hover overlay effect (20% black transparency)
export const hoverOverlayStyles = (theme: Theme) => ({
  content: '""',
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  boxShadow: '0 0 3px rgba(0, 0, 0, 0.8)', // fill some gaps around the edges
  zIndex: 1,
});

// Common container base styles for both memo and whiteboard previews
export const previewContainerStyles = (theme: Theme, onClick?: unknown) => ({
  position: 'relative' as const,
  display: 'flex',
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  border: onClick ? '1px solid' : 'none',
  borderColor: theme.palette.divider,
  margin: gutters(1)(theme),
  overflow: 'hidden' as const,
  cursor: onClick ? ('pointer' as const) : ('default' as const),
  borderRadius: theme.shape.borderRadius,
  // Button appearing only on hover:
  '& .only-on-hover': {
    display: 'none',
  },
  '&:hover .only-on-hover': {
    display: 'block',
  },
  [theme.breakpoints.down('sm')]: {
    // But always on small screens:
    '& .only-on-hover': {
      display: 'block',
    },
  },
  // Background overlay on hover
  '&:hover::before': onClick ? hoverOverlayStyles(theme) : undefined,
});

// Common chip button positioning styles
export const chipButtonPositionStyles = (theme: Theme) => ({
  top: gutters(1)(theme),
  right: gutters(1)(theme),
  textTransform: 'none' as const,
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
});
