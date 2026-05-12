import type { RefObject } from 'react';

export type DocumentationFrameProps = {
  src: string | undefined;
  title: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  initialHeight?: string;
};
