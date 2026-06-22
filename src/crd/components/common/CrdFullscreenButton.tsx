import { Maximize, Minimize } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/crd/primitives/button';

export type CrdFullscreenButtonProps = {
  /** Element to take fullscreen. Defaults to the document root. */
  element?: HTMLElement;
  /** Notified after the fullscreen state is toggled by the button. */
  onChange?: (fullscreen: boolean) => void;
  /** Declaratively force an exit from fullscreen (e.g. when a dialog closes). */
  forceExit?: boolean;
  /** Accessible label / tooltip for the icon-only button. */
  label: string;
};

/**
 * CRD fullscreen toggle — Tailwind/lucide replacement for the legacy MUI
 * `FullscreenButton`. The fullscreen DOM logic is inlined so this component has
 * no dependency on the MUI `@/core/ui` layer. Behaviour matches the legacy
 * button: clicking toggles `requestFullscreen` / `exitFullscreen` on `element`
 * (default: the document root) and calls `onChange` with the new state;
 * `forceExit` declaratively exits fullscreen.
 */
export function CrdFullscreenButton({ element, onChange, forceExit = false, label }: CrdFullscreenButtonProps) {
  const [fullscreen, setFullscreenState] = useState(() => Boolean(document.fullscreenElement));

  useEffect(() => {
    const handleChange = () => {
      const next = Boolean(document.fullscreenElement);
      setFullscreenState(next);
      onChange?.(next);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, [onChange]);

  const setFullscreen = async (next: boolean) => {
    const target = element ?? document.documentElement;
    if (next) {
      try {
        await target.requestFullscreen?.();
      } catch (_error) {}
    } else if (document.fullscreenElement) {
      try {
        await document.exitFullscreen?.();
      } catch (_error) {}
    }
  };

  useEffect(() => {
    if (forceExit && fullscreen) {
      void setFullscreen(false);
    }
  }, [forceExit, fullscreen, element]);

  const handleClick = () => {
    void setFullscreen(!fullscreen);
  };

  return (
    <Button type="button" variant="ghost" size="icon" onClick={handleClick} title={label} aria-label={label}>
      {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
    </Button>
  );
}
