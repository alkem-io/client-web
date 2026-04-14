import { createContext, type ReactNode, useContext, useState } from 'react';

type GridOverlayContextValue = {
  isVisible: boolean;
  toggle: () => void;
};

const GridOverlayContext = createContext<GridOverlayContextValue>({
  isVisible: false,
  toggle: () => {},
});

export function useGridOverlay() {
  return useContext(GridOverlayContext);
}

export function GridOverlayProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <GridOverlayContext.Provider value={{ isVisible, toggle: () => setIsVisible(v => !v) }}>
      {children}
    </GridOverlayContext.Provider>
  );
}
