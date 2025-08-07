import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';

type Props = {
  typing: boolean;
};

// Animation using Emotion's keyframes
const bounce = keyframes`
  0%   { transform: translateY(0px); }
  100% { transform: translateY(5px); }
`;

function Loader({ typing }: Props) {
  if (!typing) return null; // Don't render if not active

  return (
    <Box
      sx={{
        margin: '10px',
        display: 'flex',
      }}
    >
      <Box
        sx={{
          bgcolor: theme => theme.palette.grey[200],
          borderRadius: '10px',
          padding: '15px',
          maxWidth: 215,
          textAlign: 'left',
        }}
      >
        {[0.2, 0.3, 0.4].map((delay, i) => (
          <Box
            key={i}
            sx={{
              display: 'inline-block',
              height: 4,
              width: 4,
              borderRadius: '50%',
              bgcolor: theme => theme.palette.grey[50],
              marginRight: 0.25,
              animation: `${bounce} 0.5s ease infinite alternate`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default Loader;
