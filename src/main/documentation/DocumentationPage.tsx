import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Gutters from '@/core/ui/grid/Gutters';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import TopLevelPageBanner from '@/main/ui/layout/topLevelPageLayout/TopLevelPageBanner';

const DEFAULT_HEIGHT = '100vh';
enum SupportedMessageTypes {
  PageHeight = 'PAGE_HEIGHT',
  PageChange = 'PAGE_CHANGE',
}

const getCurrentOriginWithoutPort = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}`;
};

const DocumentationPage = () => {
  const { t } = useTranslation();

  // Set browser tab title to "Documentation | Alkemio"
  usePageTitle(t('pages.titles.documentation'));

  const { locations } = useConfig();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // used only for the initial loading
  const docsInternalPath = pathname.split(`/${TopLevelRoutePath.Docs}/`)[1] ?? '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState('');

  const srcIndex = `${locations?.documentation}/`;

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
      header={
        <TopLevelPageBanner title={t('pages.documentation.title')} subtitle={t('pages.documentation.subtitle')} />
      }
      breadcrumbs={<TopLevelPageBreadcrumbs />}
    >
      <PageContent>
        <PageContentBlock fullHeight={true}>
          <Gutters
            disablePadding={true}
            sx={{
              overflow: 'hidden',
            }}
          >
            {src && (
              <iframe
                src={src}
                ref={iframeRef}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
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
