import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import DialogWithGrid from '@core/ui/dialog/DialogWithGrid';
import { BlockSectionTitle, BlockTitle, CardText } from '@core/ui/typography';
import { AnyTemplateWithInnovationPack } from '../../../models/TemplateBase';
import TemplatePreview from '../../Previews/TemplatePreview';
import { Avatar, Button, DialogContent } from '@mui/material';
import PageContentColumn from '@core/ui/content/PageContentColumn';
import TemplateCard from '../../cards/TemplateCard';
import PageContentBlockSeamless from '@core/ui/content/PageContentBlockSeamless';
import { Actions } from '@core/ui/actions/Actions';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '@core/ui/grid/utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeCardView from '@core/ui/list/BadgeCardView';
import LinkNoUnderline from '../../../../shared/components/LinkNoUnderline';
import PageContentBlockGrid from '@core/ui/content/PageContentBlockGrid';

export interface PreviewTemplateDialogProps extends AnyTemplateWithInnovationPack {
  open?: boolean;
  onClose: () => void;
  templateInfo?: ReactNode; // Extra information about the template, like why I can't import it (see DisabledTemplateInfo)
  actions?: ReactNode;
}

const PreviewTemplateDialog: FC<PreviewTemplateDialogProps> = ({
  open = false,
  template,
  innovationPack,
  templateInfo,
  onClose,
  actions,
}) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          {t('common.preview')} — {template.profile.displayName}
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <PageContentBlockGrid disablePadding>
          <PageContentColumn columns={3}>
            <TemplateCard template={template} />
            {templateInfo}
            <PageContentBlockSeamless disablePadding>
              <Actions justifyContent="end">
                <Button
                  startIcon={<ArrowBackIcon />}
                  variant="text"
                  onClick={() => onClose()}
                  sx={{ marginRight: gutters() }}
                >
                  {t('buttons.back')}
                </Button>
                {actions}
              </Actions>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding disableGap>
              <BlockSectionTitle>{t('common.title')}</BlockSectionTitle>
              <CardText>{template?.profile.displayName}</CardText>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding disableGap>
              <BlockSectionTitle>{t('common.description')}</BlockSectionTitle>
              <WrapperMarkdown card>{template?.profile.description ?? ''}</WrapperMarkdown>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding disableGap>
              <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
              <TagsComponent tags={template?.profile.defaultTagset?.tags ?? []} height={gutters()} />
            </PageContentBlockSeamless>
            {innovationPack?.provider && (
              <PageContentBlockSeamless disablePadding disableGap>
                <BlockSectionTitle>{t('common.createdBy')}</BlockSectionTitle>
                <BadgeCardView
                  visual={
                    <Avatar
                      src={innovationPack.provider.profile.avatar?.uri}
                      aria-label="User avatar"
                      alt={t('common.avatar-of', { user: innovationPack.provider.profile.displayName })}
                    >
                      {innovationPack.provider.profile.displayName[0]}
                    </Avatar>
                  }
                  component={LinkNoUnderline}
                  to={innovationPack.provider.profile.url}
                >
                  <BlockSectionTitle>{innovationPack.provider.profile.displayName}</BlockSectionTitle>
                </BadgeCardView>
              </PageContentBlockSeamless>
            )}
          </PageContentColumn>
          <PageContentColumn columns={9} alignSelf="stretch" flexDirection="column">
            <BlockSectionTitle>{t('common.preview')}</BlockSectionTitle>
            <TemplatePreview template={template} />
          </PageContentColumn>
        </PageContentBlockGrid>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default PreviewTemplateDialog;
