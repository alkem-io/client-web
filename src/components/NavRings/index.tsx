import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';

import { createStyles } from '../../hooks/useTheme';

import { Path } from '../../context/NavigationProvider';

const useNavRingsStyles = createStyles(theme => ({
  navRingsContainer: {
    position: 'relative',
    height: `${theme.shape.spacing(20)}px`,
    width: `${theme.shape.spacing(20)}px`,
    top: `-${theme.shape.spacing(10)}px`,
    left: `-${theme.shape.spacing(10)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '& > a': {
      border: '1px solid #e5e5e5',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      transition: 'border 0.2s ease-in-out',
      position: 'absolute',

      '&:hover': {
        border: '1px solid #58bfd5',
      },
    },

    '& > p': {
      position: 'relative',
      top: `${theme.shape.spacing(50)}`,
      left: `${theme.shape.spacing(25)}`,
      color: '#58bfd5',
      textTransform: 'capitalize',
    },
  },
}));

interface NavRings {
  paths: Path[];
}

const NavRings: FC<NavRings> = ({ paths }) => {
  const styles = useNavRingsStyles();

  const [activeElement, setActiveElement] = useState<string>('');
  const nav: Array<string> = ['/', 'admin', 'connect', 'messages', 'explore', 'challenge'];
  return (
    <div className={styles.navRingsContainer}>
      {nav.map((el, index) => (
        <Link
          style={{ width: (index + 1) * 50 + 120, height: (index + 1) * 50 + 120, zIndex: 10 - (index + 1) }}
          key={index}
          to={el}
          onMouseEnter={() => setActiveElement(el)}
          onMouseLeave={() => setActiveElement('')}
        />
      ))}
      <p>{activeElement}</p>
    </div>
  );
};

export default NavRings;
