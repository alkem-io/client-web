import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { PageTitle } from '@/core/ui/typography';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import NonPlatformAdminRedirect from '@/main/admin/NonPlatformAdminRedirect';
import EmailChangeHistoryList from '../emailChange/EmailChangeHistoryList';
import useUserEmailChangeHistory from '../emailChange/useUserEmailChangeHistory';

const UserEmailChangeHistoryPage = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const history = useUserEmailChangeHistory(userId);

  return (
    <NonPlatformAdminRedirect>
      <AdminLayout currentTab={AdminSection.User}>
        <PageContent>
          <PageContentBlock>
            <PageTitle>{t('pages.admin.users.emailChange.history.title')}</PageTitle>
            <EmailChangeHistoryList {...history} />
          </PageContentBlock>
        </PageContent>
      </AdminLayout>
    </NonPlatformAdminRedirect>
  );
};

export default UserEmailChangeHistoryPage;
