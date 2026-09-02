import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

type FullscreenEditorContextValue = {
  /** True while at least one immersive editor (whiteboard, memo, …) is open. */
  isFullscreenEditorOpen: boolean;
  /** Registers an open editor; the returned cleanup unregisters it. */
  registerEditor: () => () => void;
};

const FullscreenEditorContext = createContext<FullscreenEditorContextValue>({
  isFullscreenEditorOpen: false,
  registerEditor: () => () => {},
});

export const FullscreenEditorProvider = ({ children }: { children: ReactNode }) => {
  const [openCount, setOpenCount] = useState(0);

  const value: FullscreenEditorContextValue = {
    isFullscreenEditorOpen: openCount > 0,
    registerEditor: () => {
      setOpenCount(count => count + 1);
      return () => setOpenCount(count => count - 1);
    },
  };

  return <FullscreenEditorContext value={value}>{children}</FullscreenEditorContext>;
};

/** Marks an immersive editor as open while `open` is true (e.g. whiteboard/memo dialogs). */
export const useRegisterFullscreenEditor = (open: boolean) => {
  const { registerEditor } = useContext(FullscreenEditorContext);

  useEffect(() => {
    if (!open) return;
    return registerEditor();
  }, [open]);
};

/** Reads whether any immersive editor is currently open. */
export const useIsFullscreenEditorOpen = () => useContext(FullscreenEditorContext).isFullscreenEditorOpen;
