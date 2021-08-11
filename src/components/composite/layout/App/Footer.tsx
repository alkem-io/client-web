import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core';
import { createStyles } from '../../../../hooks/useTheme';
import Toolbar from '../../../core/Toolbar';
import Typography from '../../../core/Typography';
import Image from '../../../core/Image';
import { useConfig } from '../../../../hooks';

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
            <div className="d-flex container-xl justify-content-center flex-wrap flex-lg-nowrap">
              <div className={styles.column}>
                <a href={platform?.terms || ''} target={'_blank'} rel="noopener noreferrer">
                  Terms
                </a>
                <a href={platform?.privacy || ''} target={'_blank'} rel="noopener noreferrer">
                  Privacy
                </a>
                <a href={platform?.security || ''} target={'_blank'} rel="noopener noreferrer">
                  Security
                </a>
              </div>

              <div className="d-none d-lg-block mx-xl-1">
                <Link to={'/about'}>
                  <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
                </Link>
              </div>

              <div className={styles.column}>
                <a href={platform?.feedback || ''} target={'_blank'} rel="noopener noreferrer">
                  Feedback
                </a>
                <a href={platform?.support || ''} target={'_blank'} rel="noopener noreferrer">
                  Support
                </a>
                <a href={platform?.about || ''} target={'_blank'} rel="noopener noreferrer">
                  About
                </a>
              </div>
            </div>
          </Toolbar>
        </Grid>
        <Grid item xs={12}>
          <Toolbar dense className={styles.footerSecondary}>
            <Typography variant="caption" color="neutralMedium" weight="boldLight">
              © 2021 Cherrytwist Foundation
            </Typography>
            <div className="d-flex justify-content-end">{children}</div>
          </Toolbar>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Footer;
