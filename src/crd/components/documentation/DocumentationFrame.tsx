import type { DocumentationFrameProps } from '@/crd/components/documentation/documentationTypes';

export function DocumentationFrame({ src, title, iframeRef, initialHeight }: DocumentationFrameProps) {
  if (!src) {
    return null;
  }

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ width: '100%', height: initialHeight ?? '100vh', border: 'none' }}
    />
  );
}
