import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  CalloutContributionType,
  CalloutFramingType,
  CollaboraDocumentType,
} from '@/core/apollo/generated/graphql-schema';
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

vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', () => ({
  default: () => ({
    inViewRef: vi.fn(),
    loaded: true,
    contributions: {
      total: 1,
      items: [
        {
          id: 'contribution-1',
          collaboraDocument: {
            id: 'doc-1',
            documentType: CollaboraDocumentType.Spreadsheet,
            previewUrl: '/api/private/wopi/files/doc-1/preview',
            profile: { id: 'profile-1', url: '/documents/doc-1', displayName: 'Q1 Report' },
          },
        },
      ],
    },
  }),
}));

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

    const { container } = render(<ContributionsPreviewConnector callout={callout as never} onShowAll={vi.fn()} />);

    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('src', '/api/private/wopi/files/doc-1/preview');
  });
});
