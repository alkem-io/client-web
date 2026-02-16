import { Box } from '@mui/material';
import { gutters } from '../grid/utils';

interface ImagePlaceholderProps {
  text: string;
}

export const createPlaceholderImageDataUri = (text: string): string => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='#f5f5f5'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='16' fill='#666'>${escaped}</text></svg>`;
  const bytes = new TextEncoder().encode(svg);
  const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
  return `data:image/svg+xml;base64,${btoa(binary)}`;
};

const ImagePlaceholder = ({ text }: ImagePlaceholderProps) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        fontSize: '0.875rem',
        textAlign: 'center',
        padding: gutters(),
        backgroundColor: theme => theme.palette.grey[100],
      }}
    >
      {text}
    </Box>
  );
};

export default ImagePlaceholder;
