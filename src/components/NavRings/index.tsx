import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';

import { createStyles } from '../../hooks';

import { Path } from '../../context/NavigationProvider';
import hexToRGBA from '../../utils/hexToRGBA';
import Typography from '../core/Typography';

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
  hoveredRoute: {
    position: 'fixed',
    top: `${theme.shape.spacing(1)}px`,
    zIndex: 120,
  },
}));

interface NavRingsProps {
  paths: Path[];
}

const NavRings: FC<NavRingsProps> = ({ paths }) => {
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const styles = useNavRingsStyles();
  const realPaths = paths.filter(p => p.real)?.length;

  if (paths.length < 2) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.navRingsContainer}>
        {paths.map((el, index) => {
          if (!el.real) return null;
          return (
            <Link
              style={{ width: index * 40 + 80, height: index * 40 + 80, zIndex: 111 - (index + 1) }}
              key={index}
              to={el.value}
              onMouseEnter={() => setHoveredRoute(el.name)}
              onMouseLeave={() => setHoveredRoute(null)}
            />
          );
        })}
      </div>
      {hoveredRoute && (
        <span
          className={styles.hoveredRoute}
          style={{
            left: `${realPaths * 40}px`,
          }}
        >
          <Typography variant={'caption'} color={'primary'} weight={'regular'}>
            {hoveredRoute}
          </Typography>
        </span>
      )}
    </div>
  );
};

export default NavRings;
