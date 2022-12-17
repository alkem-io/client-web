import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';
import { PageContentBlockActions } from '../../../../../core/ui/content/PageContentBlockActions';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { RouterLink } from '../../../../../common/components/core/RouterLink';
import { INSPIRATION_ROUTE } from '../../../../../core/routing/route.constants';

interface ContributeCreationBlockProps {
  canCreate: boolean;
  handleCreate: () => void;
}

export const ContributeCreationBlock: FC<ContributeCreationBlockProps> = ({ canCreate, handleCreate }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock accent>
      <WrapperMarkdown>{t('pages.contribute.initial-text')}</WrapperMarkdown>
      {canCreate && (
        <PageContentBlockActions justifyContent="end">
          <Button
            variant="text"
            startIcon={<TipsAndUpdatesOutlinedIcon />}
            target="_blank"
            rel="noopener noreferrer"
            component={RouterLink}
            to={INSPIRATION_ROUTE}
          >
            {t('common.inspiration')}
          </Button>
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleCreate}>
            {t('common.create')}
          </Button>
        </PageContentBlockActions>
      )}
    </PageContentBlock>
  );
};
