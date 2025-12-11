import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';

type ContributeCreationBlockProps = {
  canCreate: boolean;
  handleCreate: () => void;
  tabDescription: string;
};

export const ContributeCreationBlock = ({ tabDescription, canCreate, handleCreate }: ContributeCreationBlockProps) => {
  const { t } = useTranslation();

  if (!tabDescription && !canCreate) {
    return null;
  }

  return (
    <PageContentBlock accent>
      {tabDescription && <WrapperMarkdown>{tabDescription}</WrapperMarkdown>}
      {canCreate && (
        <Actions justifyContent="end">
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleCreate}>
            {t('common.post')}
          </Button>
        </Actions>
      )}
    </PageContentBlock>
  );
};
