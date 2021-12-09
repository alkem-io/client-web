import { Box, styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React, { forwardRef } from 'react';

const PREFIX = 'User';

const classes = {
  cursorPointer: `${PREFIX}-cursorPointer`,
  nameStyle: `${PREFIX}-nameStyle`,
  titleStyle: `${PREFIX}-titleStyle`,
  textStyle: `${PREFIX}-textStyle`,
};

const Root = styled('div')(({ theme }) => ({
  cursor: 'pointer',
  [`& .${classes.cursorPointer}`]: {
    cursor: 'pointer',
  },
  [`& .${classes.nameStyle}`]: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  [`& .${classes.titleStyle}`]: {
    fontWeight: 'medium',
    textTransform: 'uppercase',
  },
  [`& .${classes.textStyle}`]: {
    paddingRight: theme.spacing(1),
    textAlign: 'end',
  },
}));

interface UserProps {
  name: string;
  title: string;
  src: string | undefined;
  onClick?: () => void;
}

const User = forwardRef<HTMLDivElement, UserProps>(({ name, title, src, onClick }, ref) => {
  return (
    <Root ref={ref}>
      <Box display="flex" onClick={onClick}>
        <Box display="flex" flexDirection="column" flexWrap="nowrap">
          <Typography
            variant="caption"
            color="neutral.main"
            noWrap
            className={clsx(classes.nameStyle, classes.textStyle)}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="neutralMedium.main"
            noWrap
            className={clsx(classes.titleStyle, classes.textStyle)}
          >
            {title}
          </Typography>
        </Box>
        <Avatar src={src} />
      </Box>
    </Root>
  );
});

export default User;
