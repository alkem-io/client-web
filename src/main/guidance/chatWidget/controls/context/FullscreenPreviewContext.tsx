import { createContext, useContext, useState, ReactNode } from 'react';

export interface FullscreenPreviewState {
  src: string;
  alt: string;
  width: number;
  height: number;
  visible: boolean;
}

interface FullscreenPreviewContextProps {
  state: FullscreenPreviewState;
  openPreview: (src: string, alt: string, width: number, height: number) => void;
  closePreview: () => void;
}

const initialState: FullscreenPreviewState = {
  src: '',
  alt: '',
  width: 0,
  height: 0,
  visible: false,
};

const FullscreenPreviewContext = createContext<FullscreenPreviewContextProps | undefined>(undefined);

export const FullscreenPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<FullscreenPreviewState>(initialState);

  const openPreview = (src: string, alt: string, width: number, height: number) => {
    setState({
      src,
      alt,
      width,
      height,
      visible: true,
    });
  };

  const closePreview = () => {
    setState(initialState);
  };

  return (
    <FullscreenPreviewContext
      value={{
        state,
        openPreview,
        closePreview,
      }}
    >
      {children}
    </FullscreenPreviewContext>
  );
};

export const useFullscreenPreview = () => {
  const context = useContext(FullscreenPreviewContext);
  if (!context) {
    throw new Error('useFullscreenPreview must be used within a FullscreenPreviewProvider');
  }
  return context;
};
