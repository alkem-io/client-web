import React, { forwardRef } from 'react';
import { Grid, styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

const PREFIX = 'User';

const classes = {
  textPaddingRight: `${PREFIX}-textPaddingRight`,
  cursorPointer: `${PREFIX}-cursorPointer`,
  nameStyle: `${PREFIX}-nameStyle`,
  titleStyle: `${PREFIX}-titleStyle`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.textPaddingRight}`]: {
    paddingRight: theme.spacing(1.5),
  },
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
}));

interface UserProps {
  name: string;
  title: string;
  src: string | undefined;
  onClick?: () => void;
}

const User = forwardRef<unknown, UserProps>(({ name, title, src, onClick }, ref) => {
  return (
    <Root>
      <Grid container alignItems="center">
        <Grid container item direction="column" flexWrap="nowrap" alignItems="end" xs={6}>
          <Grid item className={classes.textPaddingRight}>
            <Typography variant="caption" color="neutral.main" noWrap className={classes.nameStyle}>
              {name}
            </Typography>
          </Grid>
          <Grid item className={classes.textPaddingRight}>
            <Typography variant="caption" color="neutralMedium.main" noWrap className={classes.titleStyle}>
              {title}
            </Typography>
          </Grid>
        </Grid>
        <Grid item onClick={onClick}>
          <Avatar src={src} className={classes.cursorPointer} ref={ref as any} />
        </Grid>
      </Grid>
    </Root>
  );
});

export default User;
