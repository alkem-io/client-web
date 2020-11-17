import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Typography from '../core/Typography';

const useFooterStyles = createStyles(theme => ({
  footerSpacing: {
    display: 'flex',
    position: 'relative',
    padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(2)}px`,
  },
  footer: {
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
        <div className={styles.poweredBy}>
          <Typography variant="caption" color="neutralMedium" weight="boldLight">
            Powered by
          </Typography>
          <img src="/logo.png" className={styles.logo} alt="Cherrytwist" />
        </div>

        <div className={styles.spacer} />
        {children}
      </Toolbar>
    </div>
  );
};

export default Footer;
