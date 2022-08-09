import createLayout from './LayoutHolder';
import { ComponentType } from 'react';
import { Outlet } from 'react-router-dom';

const createLayoutWithOutlet = <P extends {}>(Component: ComponentType<P>) => {
  const { LayoutHolder, Layout } = createLayout(Component);

  const LayoutHolderWithOutlet = () => {
    return (
      <LayoutHolder>
        <Outlet />
      </LayoutHolder>
    );
  };

  return {
    LayoutHolder: LayoutHolderWithOutlet,
    Layout,
  };
};

export default createLayoutWithOutlet;
