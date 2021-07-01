import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Typography from '../core/Typography';
import { usePlatformConfigurationQuery } from '../../generated/graphql';
import Image from '../core/Image';
import { Link } from 'react-router-dom';

const useFooterStyles = createStyles(theme => ({
  footer: {
    position: 'relative',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  column: {
    display: 'flex',
    gap: theme.shape.spacing(2),
    marginLeft: theme.shape.spacing(2),
    marginRight: theme.shape.spacing(2),
    [theme.media.down('xl')]: {
      justifyContent: 'center',
    },
  },
  logo: {
    height: theme.shape.spacing(2),
  },
  copyright: {
    display: 'flex',
    justifyContent: 'start',
    position: 'relative',
    left: theme.sidebar.width,
  },
  dividerLeft: {
    marginLeft: theme.sidebar.width + theme.shape.spacing(2),
  },
}));

const Footer: FC = ({ children }) => {
  const styles = useFooterStyles();
  const { data } = usePlatformConfigurationQuery();
  const platform = data?.configuration.platform;

  return (
    <Toolbar classes={styles.footer} dense={true}>
      <div className={styles.copyright}>
        <Typography variant="caption" color="neutralMedium" weight="boldLight">
          © 2021 Cherrytwist Foundation
        </Typography>
      </div>
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
          <Link to={'/about'} href="https://alkem.io/about/">
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
      <div className="d-flex justify-content-start">{children}</div>
    </Toolbar>
  );
};

export default Footer;
