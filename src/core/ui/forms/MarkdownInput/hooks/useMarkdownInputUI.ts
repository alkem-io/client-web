import { useCallback, useState } from 'react';
import { useTheme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

interface UseMarkdownInputUIProps {
  controlsVisible?: 'always' | 'focused';
  disabled?: boolean;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export const useMarkdownInputUI = ({
  controlsVisible = 'focused',
  disabled = false,
  toolbarRef,
  containerRef,
  onFocus,
  onBlur,
}: UseMarkdownInputUIProps) => {
  const theme = useTheme();

  const [hasFocus, setHasFocus] = useState(false);
  const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
  const [prevEditorHeight, setPrevEditorHeight] = useState(0);

  const isInteractingWithInput = hasFocus || isControlsDialogOpen;

  const areControlsVisible = useCallback(() => {
    if (disabled) {
      return false;
    }
    if (controlsVisible === 'always') {
      return true;
    }
    if (controlsVisible === 'focused') {
      return isInteractingWithInput;
    }
    return false;
  }, [controlsVisible, disabled, isInteractingWithInput]);

  const getLabelOffset = useCallback(() => {
    const offsetY = areControlsVisible()
      ? toolbarRef.current
        ? `${toolbarRef.current.clientHeight + 20}px`
        : gutters(3)(theme)
      : gutters(1)(theme);

    return {
      x: gutters()(theme),
      y: offsetY,
    };
  }, [areControlsVisible, toolbarRef, theme]);

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      setHasFocus(true);
      onFocus?.(event as React.FocusEvent<HTMLInputElement>);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (containerRef.current?.contains(event.relatedTarget)) {
        return;
      }
      setHasFocus(false);
      onBlur?.(event as React.FocusEvent<HTMLInputElement>);
    },
    [containerRef, onBlur]
  );

  const handleDialogOpen = useCallback(() => setIsControlsDialogOpen(true), []);
  const handleDialogClose = useCallback(() => setIsControlsDialogOpen(false), []);

  return {
    hasFocus,
    isControlsDialogOpen,
    isInteractingWithInput,
    prevEditorHeight,
    setPrevEditorHeight,
    areControlsVisible,
    getLabelOffset,
    handleFocus,
    handleBlur,
    handleDialogOpen,
    handleDialogClose,
  };
};
