import TopLevelLayout from '../../main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import PageContent from '../../core/ui/content/PageContent';
import PageContentBlock from '../../core/ui/content/PageContentBlock';
import SpacePageBanner from '../journey/space/layout/SpacePageBanner';
import { useLocation } from 'react-router-dom';

const DocumentationPage = () => {
  const location = useLocation();
  const pathAfterDocs = location.pathname.split('/docs/')[1] || '';

  let src = `http://v-insight.gitbook.io/v-insight-1/${pathAfterDocs}`;

  return (
    <TopLevelLayout
      header={<SpacePageBanner title="Documentation" journeyTypeName="admin" />}
      breadcrumbs={<TopLevelPageBreadcrumbs />}
    >
      <PageContent>
        <PageContentBlock fullHeight>
          <iframe src={src} title="Documentation" style={{ width: '100%', height: '100%', border: 'none' }} />
        </PageContentBlock>
      </PageContent>
    </TopLevelLayout>
  );
};

export default DocumentationPage;
