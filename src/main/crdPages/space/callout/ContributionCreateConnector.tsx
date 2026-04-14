import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionCreateButton } from '@/crd/components/contribution/ContributionCreateButton';
import { ContributionFormLayout } from '@/crd/forms/contribution/ContributionFormLayout';

type ContributionCreateConnectorProps = {
  allowedTypes: Array<'post' | 'memo' | 'whiteboard' | 'link'>;
  onCreated?: () => void;
};

export function ContributionCreateConnector({ allowedTypes, onCreated }: ContributionCreateConnectorProps) {
  const [activeForm, setActiveForm] = useState<'post' | 'memo' | 'whiteboard' | 'link' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');

  const handleSubmit = () => {
    // TODO: Call appropriate mutation based on activeForm type
    setActiveForm(null);
    resetForm();
    onCreated?.();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setLinkUrl('');
    setLinkDescription('');
  };

  const handleCancel = () => {
    setActiveForm(null);
    resetForm();
  };

  const { t } = useTranslation('crd-space');

  const typeLabels: Record<string, string> = {
    post: t('callout.post'),
    memo: t('callout.memo'),
    whiteboard: t('callout.whiteboard'),
    link: t('callout.link'),
  };

  return (
    <div className="space-y-3">
      {/* Create buttons */}
      {!activeForm && (
        <div className="flex flex-wrap gap-2">
          {allowedTypes.map(type => (
            <ContributionCreateButton key={type} label={typeLabels[type]} onClick={() => setActiveForm(type)} />
          ))}
        </div>
      )}

      {/* Active form */}
      {activeForm && (
        <ContributionFormLayout
          type={activeForm}
          title={{ value: title, onChange: setTitle }}
          description={{ value: description, onChange: setDescription }}
          tags={{ value: tags, onChange: setTags }}
          linkUrl={activeForm === 'link' ? { value: linkUrl, onChange: setLinkUrl } : undefined}
          linkDescription={activeForm === 'link' ? { value: linkDescription, onChange: setLinkDescription } : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
