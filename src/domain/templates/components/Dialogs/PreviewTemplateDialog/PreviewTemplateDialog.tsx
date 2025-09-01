import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { BlockSectionTitle, BlockTitle, CardText } from '@/core/ui/typography';
import { AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';
import TemplateContentPreview from '@/domain/templates/components/Previews/TemplateContentPreview';
import { Avatar, Button, DialogContent, styled } from '@mui/material';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { Actions } from '@/core/ui/actions/Actions';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { gutters } from '@/core/ui/grid/utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';

export interface PreviewTemplateDialogProps extends AnyTemplateWithInnovationPack {
  open?: boolean;
  onClose: () => void;
  templateInfo?: ReactNode; // Extra information about the template, like why I can't import it (see DisabledTemplateInfo)
  actions?: ReactNode;
}

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
});

const PreviewTemplateDialog = ({
  open = false,
  template,
  innovationPack,
  templateInfo,
  onClose,
  actions,
}: PreviewTemplateDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose} aria-labelledby="preview-template-dialog">
      <DialogHeader id="preview-template-dialog" onClose={onClose}>
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
                      alt={
                        innovationPack.provider.profile.displayName
                          ? t('common.avatar-of', { user: innovationPack.provider.profile.displayName })
                          : t('common.avatar')
                      }
                    >
                      {innovationPack.provider.profile.displayName[0]}
                    </Avatar>
                  }
                  component={StyledLink}
                  to={innovationPack.provider.profile.url}
                >
                  <BlockSectionTitle>{innovationPack.provider.profile.displayName}</BlockSectionTitle>
                </BadgeCardView>
              </PageContentBlockSeamless>
            )}
          </PageContentColumn>
          <PageContentColumn columns={9} alignSelf="stretch" flexDirection="column">
            <BlockSectionTitle>{t('common.preview')}</BlockSectionTitle>
            <TemplateContentPreview template={template} />
          </PageContentColumn>
        </PageContentBlockGrid>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default PreviewTemplateDialog;
