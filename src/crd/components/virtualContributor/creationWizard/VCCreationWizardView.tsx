import { BookOpen, Bot, CloudDownload, Library, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ImageCropConfig, ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { RowAttachFileButton } from '@/crd/forms/references/RowAttachFileButton';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import type {
  VCCreationWizardViewProps,
  VcWizardDocument,
  VcWizardPath,
  VcWizardPost,
  VcWizardSelectableSpace,
} from './VCCreationWizardView.types';

export function VCCreationWizardView(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const isLoading = props.step === 'loadingStep' || props.loading;

  return (
    <Dialog
      open={props.open}
      onOpenChange={open => {
        if (!open) props.onClose();
      }}
    >
      <DialogContent
        closeLabel={t('wizard.close')}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-section-title">
            <Bot aria-hidden="true" className="size-5 text-primary" />
            {t('wizard.title')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <output className="flex flex-1 items-center justify-center px-6 py-16" aria-label={t('wizard.loading')}>
            <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground" />
          </output>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
            {props.step === 'initial' ? (
              <InitialStep {...props} />
            ) : props.step === 'addKnowledge' ? (
              <AddKnowledgeStep {...props} />
            ) : props.step === 'existingKnowledge' ? (
              <ExistingSpaceStep {...props} />
            ) : props.step === 'externalProvider' ? (
              <ExternalProviderStep {...props} />
            ) : props.step === 'chooseCommunity' ? (
              <ChooseCommunityStep {...props} />
            ) : props.step === 'tryVcInfo' ? (
              <TryVcInfoStep {...props} />
            ) : null}
          </div>
        )}

        {!isLoading && props.step !== 'tryVcInfo' && (
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <WizardFooter {...props} />
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WizardFooter(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');

  switch (props.step) {
    case 'initial':
      return (
        <Button type="button" onClick={props.onSubmitInitial} disabled={!props.identityValid || !props.selectedPath}>
          {t('wizard.next')}
        </Button>
      );
    case 'addKnowledge': {
      const postsValid = props.posts.length > 0 && props.posts.every(p => p.title.trim().length >= 3);
      return (
        <>
          <Button type="button" variant="ghost" onClick={props.onBack}>
            {t('wizard.back')}
          </Button>
          <Button type="button" onClick={props.onSubmitKnowledge} disabled={!postsValid}>
            {t('wizard.create')}
          </Button>
        </>
      );
    }
    case 'existingKnowledge':
      return (
        <Button type="button" variant="ghost" onClick={props.onBack}>
          {t('wizard.back')}
        </Button>
      );
    case 'externalProvider':
      return (
        <>
          <Button type="button" variant="ghost" onClick={props.onBack}>
            {t('wizard.back')}
          </Button>
          <Button type="button" onClick={props.onSubmitExternal} disabled={!props.externalValid}>
            {t('wizard.create')}
          </Button>
        </>
      );
    case 'chooseCommunity':
      return (
        <Button type="button" variant="ghost" onClick={() => props.onChooseCommunity(undefined)}>
          {t('wizard.chooseCommunity.skip')}
        </Button>
      );
    default:
      return null;
  }
}

const PATHS: { key: VcWizardPath; icon: typeof Library }[] = [
  { key: 'writtenKnowledge', icon: Library },
  { key: 'existingSpace', icon: BookOpen },
  { key: 'external', icon: CloudDownload },
];

/** Standard Alkemio avatar visual constraints (square, 190–410px). The VC's
 *  avatar visual enforces this range server-side when the cropped file is
 *  uploaded post-creation, so the crop output must already fit it. */
const AVATAR_CROP_CONFIG: ImageCropConfig = {
  aspectRatio: 1,
  minWidth: 190,
  minHeight: 190,
  maxWidth: 410,
  maxHeight: 410,
};

function InitialStep(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | undefined>(undefined);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body text-muted-foreground">{t('wizard.initial.intro')}</p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-20">
            {props.avatarPreviewUrl ? <AvatarImage src={props.avatarPreviewUrl} alt="" /> : null}
            <AvatarFallback style={backgroundGradient('var(--chart-2)')} className="text-white">
              <Bot aria-hidden="true" className="size-8" />
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) setCropFile(file);
              // Reset so re-picking the same file fires onChange again.
              e.target.value = '';
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" className="mr-1.5 size-4" />
            {t('wizard.initial.uploadAvatar')}
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <Field label={t('wizard.initial.name')} required={true}>
            <Input
              value={props.identity.name}
              onChange={e => props.onChangeIdentity({ name: e.target.value })}
              aria-label={t('wizard.initial.name')}
            />
          </Field>
          <Field label={t('wizard.initial.tagline')}>
            <Input
              value={props.identity.tagline}
              onChange={e => props.onChangeIdentity({ tagline: e.target.value })}
              aria-label={t('wizard.initial.tagline')}
            />
          </Field>
        </div>
      </div>

      <Field label={t('wizard.initial.description')}>
        <MarkdownEditor
          value={props.identity.description}
          onChange={next => props.onChangeIdentity({ description: next })}
          placeholder={t('wizard.initial.description')}
          onImageUpload={props.onImageUpload}
          iframeAllowedUrls={props.iframeAllowedUrls}
          onError={props.onError}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-body-emphasis">{t('wizard.initial.pathTitle')}</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {PATHS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => props.onSelectPath(key)}
              aria-pressed={props.selectedPath === key}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-4 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50',
                props.selectedPath === key ? 'border-primary bg-accent' : 'border-border'
              )}
            >
              <Icon aria-hidden="true" className="size-5 text-primary" />
              <span className="text-body-emphasis">{t(`wizard.initial.paths.${key}.title`)}</span>
              <span className="text-caption text-muted-foreground">{t(`wizard.initial.paths.${key}.subtitle`)}</span>
            </button>
          ))}
        </div>
      </div>

      <ImageCropDialog
        open={Boolean(cropFile)}
        file={cropFile}
        config={AVATAR_CROP_CONFIG}
        onSave={({ file }) => {
          props.onUploadAvatar(file);
          setCropFile(undefined);
        }}
        onCancel={() => setCropFile(undefined)}
        title={t('shared.avatarCropDialog.title')}
        description={t('shared.avatarCropDialog.description')}
        altTextLabel={t('shared.avatarCropDialog.altTextLabel')}
        altTextPlaceholder={t('shared.avatarCropDialog.altTextPlaceholder')}
        saveLabel={t('shared.save')}
        savingLabel={t('shared.saving')}
        cancelLabel={t('shared.cancel')}
      />
    </div>
  );
}

function AddKnowledgeStep(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const [uploadingDocs, setUploadingDocs] = useState<Record<number, boolean>>({});
  // Mirror of `documents` for post-await reads: a file upload takes seconds, and
  // if the user edits any row meanwhile the closure-captured `props.documents`
  // is stale by the time `await onDocumentUpload` resolves. Reading from the ref
  // avoids reverting concurrent keystrokes.
  const documentsRef = useRef(props.documents);
  useEffect(() => {
    documentsRef.current = props.documents;
  }, [props.documents]);

  const updatePost = (i: number, patch: Partial<VcWizardPost>) =>
    props.onChangePosts(props.posts.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const updateDoc = (i: number, patch: Partial<VcWizardDocument>) =>
    props.onChangeDocuments(props.documents.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const handleDocFile = async (i: number, file: File | undefined) => {
    if (!file || !props.onDocumentUpload) return;
    setUploadingDocs(prev => ({ ...prev, [i]: true }));
    try {
      const url = await props.onDocumentUpload(file);
      if (!url) return;
      const current = documentsRef.current[i];
      const filenameBase = file.name.replace(/\.[^./\\]+$/, '').trim();
      const patch: Partial<VcWizardDocument> = { url };
      if (!current?.name.trim() && filenameBase) patch.name = filenameBase;
      props.onChangeDocuments(documentsRef.current.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
    } finally {
      setUploadingDocs(prev => {
        const next = { ...prev };
        delete next[i];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body text-muted-foreground">{t('wizard.addKnowledge.intro')}</p>

      <section className="flex flex-col gap-2">
        <span className="text-body-emphasis">{t('wizard.addKnowledge.postsTitle')}</span>
        {props.posts.map((post, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: list rows have no stable id
          <div key={i} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <Input
                value={post.title}
                onChange={e => updatePost(i, { title: e.target.value })}
                placeholder={t('wizard.addKnowledge.postTitle')}
                aria-label={t('wizard.addKnowledge.postTitle')}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => props.onChangePosts(props.posts.filter((_, idx) => idx !== i))}
                aria-label={t('wizard.addKnowledge.removePost')}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <MarkdownEditor
              value={post.description}
              onChange={next => updatePost(i, { description: next })}
              placeholder={t('wizard.addKnowledge.postDescription')}
              onImageUpload={props.onImageUpload}
              iframeAllowedUrls={props.iframeAllowedUrls}
              onError={props.onError}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => props.onChangePosts([...props.posts, { title: '', description: '' }])}
        >
          <Plus aria-hidden="true" className="mr-1.5 size-4" />
          {t('wizard.addKnowledge.addPost')}
        </Button>
      </section>

      <section className="flex flex-col gap-2">
        <span className="text-body-emphasis">{t('wizard.addKnowledge.documentsTitle')}</span>
        {props.documents.map((doc, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: list rows have no stable id
          <div key={i} className="flex items-center gap-2 rounded-lg border bg-card p-3">
            <Input
              value={doc.name}
              onChange={e => updateDoc(i, { name: e.target.value })}
              placeholder={t('wizard.addKnowledge.documentName')}
              aria-label={t('wizard.addKnowledge.documentName')}
              className="flex-1"
            />
            <Input
              value={doc.url}
              onChange={e => updateDoc(i, { url: e.target.value })}
              placeholder={t('wizard.addKnowledge.documentUrl')}
              aria-label={t('wizard.addKnowledge.documentUrl')}
              className="flex-1"
            />
            {props.onDocumentUpload && (
              <RowAttachFileButton
                accept={props.documentUploadAccept}
                uploading={Boolean(uploadingDocs[i])}
                ariaLabel={t('wizard.addKnowledge.attachDocument')}
                onFile={file => handleDocFile(i, file)}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => props.onChangeDocuments(props.documents.filter((_, idx) => idx !== i))}
              aria-label={t('wizard.addKnowledge.removeDocument')}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => props.onChangeDocuments([...props.documents, { name: '', url: '' }])}
        >
          <Plus aria-hidden="true" className="mr-1.5 size-4" />
          {t('wizard.addKnowledge.addDocument')}
        </Button>
      </section>
    </div>
  );
}

function SpaceList({ spaces, onSelect }: { spaces: VcWizardSelectableSpace[]; onSelect: (id: string) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {spaces.map(space => (
        <li key={space.id} className="flex flex-col gap-2">
          <SpaceRow space={space} onSelect={onSelect} />
          {space.subspaces && space.subspaces.length > 0 && (
            <ul className="ml-6 flex flex-col gap-2">
              {space.subspaces.map(sub => (
                <li key={sub.id}>
                  <SpaceRow space={sub} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function SpaceRow({ space, onSelect }: { space: VcWizardSelectableSpace; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(space.id)}
      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Avatar className="size-8 shrink-0">
        {space.avatarUrl ? <AvatarImage src={space.avatarUrl} alt="" /> : null}
        <AvatarFallback style={backgroundGradient(space.color)} className="text-white text-caption">
          {space.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-body-emphasis">{space.displayName}</span>
    </button>
  );
}

function ExistingSpaceStep(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <div className="flex flex-col gap-6">
      <p className="text-body text-muted-foreground">{t('wizard.existingSpace.intro')}</p>
      {props.availableSpaces.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('wizard.existingSpace.empty')}</p>
      ) : (
        <SpaceList spaces={props.availableSpaces} onSelect={props.onSubmitExistingSpace} />
      )}
    </div>
  );
}

function ExternalProviderStep(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const { externalConfig } = props;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-muted-foreground">{t('wizard.external.intro')}</p>

      <Field label={t('wizard.external.engine')}>
        <Select
          value={externalConfig.engine}
          onValueChange={value => props.onChangeExternalConfig({ engine: value as typeof externalConfig.engine })}
        >
          <SelectTrigger aria-label={t('wizard.external.engine')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="genericOpenai">{t('wizard.external.engines.genericOpenai')}</SelectItem>
            <SelectItem value="openaiAssistant">{t('wizard.external.engines.openaiAssistant')}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label={t('wizard.external.apiKey')} required={true}>
        <Input
          type="password"
          value={externalConfig.apiKey}
          onChange={e => props.onChangeExternalConfig({ apiKey: e.target.value })}
          aria-label={t('wizard.external.apiKey')}
        />
      </Field>

      {externalConfig.engine === 'openaiAssistant' && (
        <Field label={t('wizard.external.assistantId')} required={true}>
          <Input
            value={externalConfig.assistantId}
            onChange={e => props.onChangeExternalConfig({ assistantId: e.target.value })}
            aria-label={t('wizard.external.assistantId')}
          />
        </Field>
      )}

      {props.comingSoonSlot}
    </div>
  );
}

function ChooseCommunityStep(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <div className="flex flex-col gap-6">
      <p className="text-body text-muted-foreground">{t('wizard.chooseCommunity.intro')}</p>
      {props.availableCommunities.length > 0 && (
        <SpaceList spaces={props.availableCommunities} onSelect={id => props.onChooseCommunity(id)} />
      )}
    </div>
  );
}

function TryVcInfoStep(props: VCCreationWizardViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <Bot aria-hidden="true" className="size-12 text-primary" />
      <h2 className="text-section-title">{t('wizard.tryVc.title', { name: props.createdVc?.name ?? '' })}</h2>
      <p className="text-body text-muted-foreground">{t('wizard.tryVc.description')}</p>
      <div className="flex gap-2">
        {props.createdVc?.profileUrl && (
          <Button asChild={true}>
            <a href={props.createdVc.profileUrl}>{t('wizard.tryVc.view')}</a>
          </Button>
        )}
        <Button type="button" variant="outline" onClick={props.onClose}>
          {t('wizard.tryVc.done')}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-body-emphasis">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
