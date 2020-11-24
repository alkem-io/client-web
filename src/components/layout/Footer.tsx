import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Typography from '../core/Typography';

const useFooterStyles = createStyles(theme => ({
  footerSpacing: {
    display: 'flex',
    padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(2)}px`,
  },
  footer: {
    position: 'relative',
    alignItems: 'center',
    flexGrow: 1,
    padding: theme.shape.spacing(4),
  },
  poweredBy: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    transform: 'translate3d(-50%, 0, 0)',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  logo: {
    height: theme.shape.spacing(8),
  },
  // should take this out to utils
  spacer: {
    flexGrow: 1,
  },
}));

const Footer: FC = ({ children }) => {
  const styles = useFooterStyles();

  return (
    <div className={styles.footerSpacing}>
      <Toolbar paddingClass={styles.footer}>
        <Link to={'/about'} href="https://cherrytwist.org/about/" className={styles.poweredBy}>
          <Typography variant="caption" color="neutralMedium" weight="boldLight">
            Powered by
          </Typography>
          <img src="/logo.png" className={styles.logo} alt="Cherrytwist" />
        </Link>
        <div className={styles.spacer} />
        {children}
      </Toolbar>
    </div>
  );
};

export default Footer;
