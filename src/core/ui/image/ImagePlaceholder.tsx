import { Box } from '@mui/material';
import { gutters } from '../grid/utils';

interface ImagePlaceholderProps {
  text: string;
}

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
