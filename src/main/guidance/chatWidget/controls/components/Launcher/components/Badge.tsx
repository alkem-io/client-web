import Box from '@mui/material/Box';

type Props = {
  badge: number;
};

function Badge({ badge }: Props) {
  if (badge > 0) {
    return (
      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: -10,
          right: -5,
          bgcolor: 'error.main',
          color: 'common.white',
          width: 25,
          height: 25,
          textAlign: 'center',
          lineHeight: '25px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          zIndex: 2,
        }}
      >
        {badge}
      </Box>
    );
  }
  return null;
}

export default Badge;
