import React, { FC } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from 'bootstrap-icons/icons/caret-left.svg';

import { createStyles } from '../../hooks/useTheme';

import { Path } from '../../context/NavigationProvider';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';
import hexToRGBA from '../../utils/hexToRGBA';

const useNavRingsStyles = createStyles(theme => ({
  wrapper: {
    [theme.media.down('lg')]: {
      display: 'none',
      visibility: 'hidden',
    },
  },
  navRingsContainer: {
    position: 'fixed',
    height: `${theme.shape.spacing(36)}px`,
    width: `${theme.shape.spacing(36)}px`,
    top: `-${theme.shape.spacing(18)}px`,
    left: `-${theme.shape.spacing(18)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,

    '& > a': {
      border: `1px solid ${hexToRGBA(theme.palette.primary, 0.5)}`,
      borderRadius: '50%',
      backgroundColor: `${theme.palette.background}`,
      transition: 'border 0.2s ease-in-out',
      position: 'absolute',

      '&:last-of-type': {
        backgroundColor: hexToRGBA(theme.palette.background, 0.8),
      },

      '&:hover': {
        border: `1px solid ${theme.palette.primary}`,
      },
    },
  },
  arrowLeft: {
    position: 'fixed',
    top: `${theme.shape.spacing(4)}px`,
    left: `${theme.shape.spacing(6)}px`,
    zIndex: 120,
  },
}));

interface NavRings {
  paths: Path[];
}

const NavRings: FC<NavRings> = ({ paths }) => {
  const styles = useNavRingsStyles();
  const history = useHistory();

  /**
   * @summary looking for previous and real path
   */
  const backPath = () => {
    for (let i = paths.length - 2; i >= 1; i--) {
      if (paths[i].real) return paths[i].value;
    }
    return '';
  };

  if (paths.length < 2) return null;

  return (
    <div className={styles.wrapper}>
      {backPath() && paths.length > 1 && (
        <IconButton
          className={styles.arrowLeft}
          onClick={() => backPath() && history.push(backPath())}
          hoverIcon={<Icon component={ArrowLeft} color="inherit" size={'lg'} />}
        >
          <Icon component={ArrowLeft} color="inherit" size={'lg'} />
        </IconButton>
      )}
      <div className={styles.navRingsContainer}>
        {paths.map((el, index) => {
          if (!el.real) return null;
          return (
            <Link
              style={{ width: index * 40 + 360, height: index * 40 + 360, zIndex: 111 - (index + 1) }}
              key={index}
              to={el.value}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NavRings;
