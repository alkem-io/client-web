import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SpaceSettingsAboutView, type SpaceSettingsAboutViewProps } from './SpaceSettingsAboutView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const editorProps = vi.fn();

// Tiptap is heavy in jsdom; only the props handed to each editor matter here.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: (props: { value: string; maxLength?: number }) => {
    editorProps(props);
    return null;
  },
}));

const visual = { id: 'v', uri: null, altText: null };

const baseProps: SpaceSettingsAboutViewProps = {
  name: 'Space',
  tagline: '',
  country: '',
  city: '',
  avatar: visual,
  pageBanner: visual,
  cardBanner: visual,
  tagsetId: 'tagset',
  tags: [],
  profileId: 'profile',
  references: [],
  what: 'what-value',
  why: 'why-value',
  who: 'who-value',
  level: 'L0',
  previewCard: {
    name: 'Space',
    tagline: '',
    bannerUrl: null,
    avatarUrl: null,
    tags: [],
    color: '#000000',
    initials: 'S',
    href: '/space',
  },
  countries: [],
  onChange: vi.fn(),
  onUploadAvatar: vi.fn(),
  onUploadPageBanner: vi.fn(),
  onUploadCardBanner: vi.fn(),
  onReferencesChange: vi.fn(),
  classifications: [],
  unsavedClassificationIds: [],
  onAddClassification: vi.fn(),
  onSelectClassificationValues: vi.fn(),
  onToggleClassificationDisplay: vi.fn(),
  onRemoveClassification: vi.fn(),
};

const editorFor = (value: string) =>
  editorProps.mock.calls.map(([props]) => props).find(props => props.value === value);

describe('SpaceSettingsAboutView — markdown limits', () => {
  test('hands each markdown section its own limit', () => {
    render(
      <SpaceSettingsAboutView {...baseProps} markdownMaxLengthByField={{ what: 50000, why: 32000, who: 32000 }} />
    );
    expect(editorFor('what-value')).toMatchObject({ maxLength: 50000 });
    expect(editorFor('why-value')).toMatchObject({ maxLength: 32000 });
    expect(editorFor('who-value')).toMatchObject({ maxLength: 32000 });
  });
});
