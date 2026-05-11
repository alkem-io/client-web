import { type RefObject, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

const DEFAULT_HEIGHT = '100vh';

const SupportedMessageTypes = {
  PageHeight: 'PAGE_HEIGHT',
  PageChange: 'PAGE_CHANGE',
} as const;

const getCurrentOriginWithoutPort = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}`;
};

type DocumentationFrameHookResult = {
  src: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  initialHeight: string;
};

export function useDocumentationFrame(): DocumentationFrameHookResult {
  const { locations } = useConfig();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const docsInternalPath = pathname.split(`/${TopLevelRoutePath.Docs}/`)[1] ?? '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState('');

  const srcIndex = locations?.documentation ? `${locations.documentation}/` : '';

  useEffect(() => {
    if (srcIndex) {
      setSrc(`${srcIndex}${docsInternalPath ?? ''}`);
    }

    const handleMessage = (event: MessageEvent) => {
      // Compare protocol + hostname exactly (port intentionally ignored —
      // the docs iframe runs on a different port locally). A `startsWith`
      // check is dangerous because e.g. `https://evil.com.example.com`
      // starts with `https://evil.com`; explicit parsing rejects that.
      const expected = getCurrentOriginWithoutPort();
      try {
        const incoming = new URL(event.origin);
        if (`${incoming.protocol}//${incoming.hostname}` !== expected) return;
      } catch {
        return;
      }

      switch (event.data?.type) {
        case SupportedMessageTypes.PageHeight: {
          if (event.data.height && iframeRef.current) {
            iframeRef.current.style.height = `${event.data.height}px`;
          }
          break;
        }
        case SupportedMessageTypes.PageChange: {
          const newPath = `/${TopLevelRoutePath.Docs}${event.data.url}`;
          navigate(newPath, { replace: true });
          scrollToTop();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [srcIndex, docsInternalPath, navigate]);

  return { src, iframeRef, initialHeight: DEFAULT_HEIGHT };
}
