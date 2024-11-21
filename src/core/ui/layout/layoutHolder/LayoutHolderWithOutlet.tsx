import createLayoutHolder from './LayoutHolder';
import { Outlet } from 'react-router-dom';

const createLayoutHolderWithOutlet = () => {
  const { LayoutHolder, RenderPoint, createLayout } = createLayoutHolder();

  const LayoutHolderWithOutlet = () => (
    <LayoutHolder>
      <RenderPoint />
      <Outlet />
    </LayoutHolder>
  );

  return {
    LayoutHolder,
    RenderPoint,
    createLayout,
    LayoutHolderWithOutlet,
  };
};

export default createLayoutHolderWithOutlet;
