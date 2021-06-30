import clsx from 'clsx';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Typography from '../core/Typography';
import { ReactComponent as ImageSvg } from 'bootstrap-icons/icons/image.svg';

const useFooterStyles = createStyles(theme => ({
  footer: {
    position: 'relative',
    alignItems: 'center',
    display: 'flex',
  },
  column: {
    [theme.media.up('xl')]: {
      justifyContent: 'space-between',
    },
    [theme.media.down('xl')]: {
      gap: theme.shape.spacing(1),
      justifyContent: 'center',
    },
  },
}));

const Footer: FC = ({ children }) => {
  const styles = useFooterStyles();

  return (
    <Toolbar classes={clsx(styles.footer, '')} dense={true}>
      <div className="d-flex container-xl flex-lg-wrap justify-content-between">
        <div className={clsx('d-flex col-xl-5 align-items-center', styles.column)}>
          <Typography variant="caption" color="neutralMedium" weight="boldLight">
            © 2021 Cherrytwist Foundation
          </Typography>
          <Link to={'/about'} href="https://alkem.io/about/">
            Terms
          </Link>
          <Link to={'/about'} href="https://alkem.io/about/">
            Privacy
          </Link>
          <Link to={'/about'} href="https://alkem.io/about/">
            Security
          </Link>
        </div>

        <div className="d-none d-xl-block mx-xl-4">
          <ImageSvg />
        </div>

        <div className={clsx('d-flex col-xl-5', styles.column)}>
          <Link to={'/about'} href="https://alkem.io/about/">
            Public preview
          </Link>
          <Link to={'/about'} href="https://alkem.io/about/">
            Feedback
          </Link>
          <Link to={'/about'} href="https://alkem.io/about/">
            Support
          </Link>
          <Link to={'/about'} href="https://alkem.io/about/">
            About
          </Link>
        </div>
      </div>
      {children}
    </Toolbar>
  );
};

export default Footer;
