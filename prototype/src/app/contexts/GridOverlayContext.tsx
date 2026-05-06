import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface GridOverlayContextValue {
  isVisible: boolean;
  toggle: () => void;
}

const GridOverlayContext = createContext<GridOverlayContextValue>({
  isVisible: false,
  toggle: () => {},
});

export function GridOverlayProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const toggle = useCallback(() => setIsVisible((v) => !v), []);

  return (
    <GridOverlayContext.Provider value={{ isVisible, toggle }}>
      {children}
    </GridOverlayContext.Provider>
  );
}

export function useGridOverlay() {
  return useContext(GridOverlayContext);
}
