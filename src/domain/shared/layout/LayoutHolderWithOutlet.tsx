import createLayoutHolder from './LayoutHolder';
import { Outlet } from 'react-router-dom';

const createLayoutHolderWithOutlet = () => {
  const { LayoutHolder, createLayout } = createLayoutHolder();

  const LayoutHolderWithOutlet = () => {
    return (
      <LayoutHolder>
        <Outlet />
      </LayoutHolder>
    );
  };

  return {
    LayoutHolder: LayoutHolderWithOutlet,
    createLayout,
  };
};

export default createLayoutHolderWithOutlet;
