import { useEffect, useRef, useState } from 'react';
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
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
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
      if (!event.origin.startsWith(getCurrentOriginWithoutPort())) {
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
