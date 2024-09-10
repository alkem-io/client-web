import TopLevelLayout from '../../main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import PageContent from '../../core/ui/content/PageContent';
import PageContentBlock from '../../core/ui/content/PageContentBlock';
import SpacePageBanner from '../journey/space/layout/SpacePageBanner';
import { useLocation } from 'react-router-dom';
import Gutters from '../../core/ui/grid/Gutters';

// todo: use locations from useConfig()
const getDocumentationUrl = () => {
  const { protocol, hostname, port } = window.location;

  return `${protocol}//${hostname}${port ? ':3010' : ''}/documentation`;
};

const DocumentationPage = () => {
  const { pathname } = useLocation();
  const pathAfterDocs = pathname.split('/docs/')[1] ?? '';

  let src = `${getDocumentationUrl()}/${pathAfterDocs}`;

  return (
    <TopLevelLayout
      header={<SpacePageBanner title="Documentation" journeyTypeName="admin" />}
      breadcrumbs={<TopLevelPageBreadcrumbs />}
    >
      <PageContent>
        <PageContentBlock fullHeight>
          <Gutters height={'100vh'}>
            <iframe src={src} title="Documentation" style={{ width: '100%', height: '100%', border: 'none' }} />
          </Gutters>
        </PageContentBlock>
      </PageContent>
    </TopLevelLayout>
  );
};

export default DocumentationPage;
