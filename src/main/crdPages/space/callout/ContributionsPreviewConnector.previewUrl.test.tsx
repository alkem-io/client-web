import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { DocType } from '@/core/apollo/generated-v2/graphql-schema';
import { ContributionsPreviewConnector } from './ContributionsPreviewConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, variables?: { count?: number }) => {
      if (key === 'callout.contributionsHeader') return `Contributions (${variables?.count})`;
      return key;
    },
  }),
}));

vi.mock(
  '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions',
  () => ({
    default: () => ({ canCreateContribution: false }),
  })
);

const response = {
  id: 'contribution-1',
  url: '/documents/doc-1',
  contentKind: 'document',
  createdAt: '2026-01-01T00:00:00Z',
  tags: [],
  sortOrder: 0,
  about: { displayName: 'Q1 Report' },
  links: [],
  can: { update: false, delete: false, moveTask: false },
  content: {
    __typename: 'DocumentContent' as const,
    document: {
      id: 'doc-1',
      docType: DocType.OfficeSheet,
      preview: { url: '/api/private/wopi/files/doc-1/preview' },
      about: { displayName: 'Q1 Report' },
    },
  },
};

describe('ContributionsPreviewConnector collabora document preview', () => {
  it('threads the resolved previewUrl into the feed contribution card', () => {
    const callout = {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.None,
        profile: { displayName: 'Documents' },
      },
      settings: {
        framing: { commentsEnabled: true },
        contribution: {
          enabled: true,
          allowedTypes: [CalloutContributionType.CollaboraDocument],
          canAddContributions: 'NONE',
          commentsEnabled: false,
        },
      },
      contributions: [{ id: 'contribution-1' }],
    };

    const { container } = render(
      <ContributionsPreviewConnector callout={callout as never} responses={[response]} total={1} onShowAll={vi.fn()} />
    );

    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('src', '/api/private/wopi/files/doc-1/preview');
  });
});
