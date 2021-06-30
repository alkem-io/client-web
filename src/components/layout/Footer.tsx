import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Toolbar from '../core/Toolbar';
import Typography from '../core/Typography';
import { ReactComponent as ImageSvg } from 'bootstrap-icons/icons/image.svg';
import { usePlatformConfigurationQuery } from '../../generated/graphql';

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
  const { data } = usePlatformConfigurationQuery();
  const platform = data?.configuration.platform;

  return (
    <Toolbar classes={clsx(styles.footer, '')} dense={true}>
      <div className="d-flex container-xl flex-lg-wrap justify-content-between">
        <div className={clsx('d-flex col-xl-5 align-items-center', styles.column)}>
          <Typography variant="caption" color="neutralMedium" weight="boldLight">
            © 2021 Cherrytwist Foundation
          </Typography>

          <a href={platform?.terms || ''} target={'_blank'} rel="noopener noreferrer">
            Terms
          </a>
          <a href={platform?.privacy || ''} target={'_blank'} rel="noopener noreferrer">
            Privacy
          </a>
        </div>

        <div className="d-none d-xl-block mx-xl-3">
          <ImageSvg />
          Public preview
        </div>

        <div className={clsx('d-flex col-xl-5', styles.column)}>
          <a href={platform?.security || ''} target={'_blank'} rel="noopener noreferrer">
            Security
          </a>
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
      {children}
    </Toolbar>
  );
};

export default Footer;
