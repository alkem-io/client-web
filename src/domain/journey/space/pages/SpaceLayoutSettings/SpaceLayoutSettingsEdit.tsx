import { useNotification } from '@/core/ui/notifications/useNotification';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';

type Props = {
  spaceId: string | undefined;
};

export const SpaceLayoutSettingsEdit = ({ spaceId = '' }: Props) => {
  const { t } = useTranslation();
  const notify = useNotification();


  return (
    <PageContentColumn columns={12}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('components.editSpaceForm.about')} />
        <p>Layout</p>
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default SpaceLayoutSettingsEdit;
