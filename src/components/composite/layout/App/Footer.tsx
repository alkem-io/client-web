import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import { Box, Container, Link } from '@material-ui/core';
import { createStyles } from '../../../../hooks/useTheme';
import Toolbar from '../../../core/Toolbar';
import Typography from '../../../core/Typography';
import Image from '../../../core/Image';
import { useConfig } from '../../../../hooks';
import { RouterLink } from '../../../core/RouterLink';

const useFooterStyles = createStyles(theme => ({
  footer: {
    maxWidth: 1380,
    width: '100%',
    margin: 'auto',
  },
  column: {
    display: 'flex',
    gap: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('xl')]: {
      justifyContent: 'center',
    },
  },
  logo: {
    height: theme.spacing(2),
  },
  footerSecondary: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    display: 'flex',
    justifyContent: 'start',
    position: 'relative',
  },
}));

const Footer: FC = ({ children }) => {
  const styles = useFooterStyles();
  const { platform } = useConfig();

  return (
    <Container className={styles.footer}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Toolbar dense>
            <Grid container justifyContent={'center'} wrap={'nowrap'} spacing={2}>
              <Grid container item justifyContent={'center'} spacing={2} wrap={'nowrap'}>
                <Grid item>
                  <Link href={platform?.terms || ''} target={'_blank'} rel="noopener noreferrer">
                    Terms
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={platform?.privacy || ''} target={'_blank'} rel="noopener noreferrer">
                    Privacy
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={platform?.security || ''} target={'_blank'} rel="noopener noreferrer">
                    Security
                  </Link>
                </Grid>
                <Grid item component={Box} display={{ xs: 'none', lg: 'block' }}>
                  <Link component={RouterLink} to={'/about'}>
                    <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={platform?.feedback || ''} target={'_blank'} rel="noopener noreferrer">
                    Feedback
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={platform?.support || ''} target={'_blank'} rel="noopener noreferrer">
                    Support
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={platform?.about || ''} target={'_blank'} rel="noopener noreferrer">
                    About
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </Grid>
        <Grid item xs={12}>
          <Toolbar dense className={styles.footerSecondary}>
            <Grid container justifyContent={'flex-start'}>
              <Typography variant="caption" color="neutralMedium" weight="boldLight">
                © 2021 Cherrytwist Foundation
              </Typography>
            </Grid>
            <Grid container justifyContent={'flex-end'}>
              {children}
            </Grid>
          </Toolbar>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Footer;
