import { styled } from '@mui/styles';

const HeaderLink = styled('a')(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  textDecoration: 'none',
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  '&:after': {
    content: "' • '",
    marginLeft: theme.spacing(1.5),
    pointerEvents: 'none',
    cursor: 'default',
    position: 'absolute',
  },
  marginRight: theme.spacing(4),
  '&:last-child': {
    marginRight: 0,
    '&:after': {
      content: "''",
    },
  },
}));

export default HeaderLink;
