import { useEffect, useRef, useState } from 'react';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SpacePageBanner from '../journey/space/layout/SpacePageBanner';
import { useLocation } from 'react-router-dom';
import Gutters from '@/core/ui/grid/Gutters';
import { useConfig } from '../platform/config/useConfig';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { useTranslation } from 'react-i18next';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import useNavigate from '@/core/routing/useNavigate';

const DEFAULT_HEIGHT = '100vh';
const enum SupportedMessageTypes {
  PageHeight = 'PAGE_HEIGHT',
  PageChange = 'PAGE_CHANGE',
}

const getCurrentOriginWithoutPort = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}`;
};

const DocumentationPage = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // used only for the initial loading
  const docsInternalPath = pathname.split(`/${TopLevelRoutePath.Docs}/`)[1] ?? '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState('');

  let srcIndex = `${locations?.documentation}/`;
  // use for local development
  // let srcIndex = `http://localhost:3010/documentation/`;

  const handleMessage = (event: MessageEvent) => {
    if (!event.origin.startsWith(getCurrentOriginWithoutPort())) {
      return;
    }

    switch (event.data.type) {
      case SupportedMessageTypes.PageHeight: {
        if (event.data.height) {
          if (iframeRef.current) {
            iframeRef.current.style.height = `${event.data.height}px`; // Dynamically update the iframe height
          }
        }
        break;
      }
      case SupportedMessageTypes.PageChange: {
        // on page change just replace the path (used for sharing)
        // the actual navigation is internal in the iframe
        const newPath = `/${TopLevelRoutePath.Docs}${event.data.url}`;
        navigate(newPath, { replace: true });
        scrollToTop();
        break;
      }
    }
  };

  useEffect(() => {
    // set the source once, and then listen for messages
    setSrc(`${srcIndex}${docsInternalPath ?? ''}`);

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <TopLevelLayout
      header={<SpacePageBanner title={t('pages.documentation.title')} journeyTypeName="admin" />}
      breadcrumbs={<TopLevelPageBreadcrumbs />}
    >
      <PageContent>
        <PageContentBlock fullHeight>
          <Gutters
            disablePadding
            sx={{
              overflow: 'hidden',
            }}
          >
            {src && (
              <iframe
                src={src}
                ref={iframeRef}
                title={t('pages.documentation.title')}
                style={{ width: '100%', height: DEFAULT_HEIGHT, border: 'none' }}
              />
            )}
          </Gutters>
        </PageContentBlock>
      </PageContent>
    </TopLevelLayout>
  );
};

export default DocumentationPage;
