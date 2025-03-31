import { useTranslation } from 'react-i18next';
import { Button, Link } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useConfig } from '@/domain/platform/config/useConfig';

type ContributeCreationBlockProps = {
  canCreate: boolean;
  handleCreate: () => void;
  tabDescription: string;
};

export const ContributeCreationBlock = ({ tabDescription, canCreate, handleCreate }: ContributeCreationBlockProps) => {
  const { t } = useTranslation();

  const { locations } = useConfig();

  if (!tabDescription && !canCreate) {
    return null;
  }
  return (
    <PageContentBlock accent>
      {tabDescription && <WrapperMarkdown>{tabDescription}</WrapperMarkdown>}
      {canCreate && (
        <Actions justifyContent="end">
          {locations?.inspiration && (
            <Button
              variant="text"
              startIcon={<TipsAndUpdatesOutlinedIcon />}
              target="_blank"
              rel="noopener noreferrer"
              component={Link}
              href={locations.inspiration}
            >
              {t('common.inspiration')}
            </Button>
          )}
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleCreate}>
            {t('common.create')}
          </Button>
        </Actions>
      )}
    </PageContentBlock>
  );
};
