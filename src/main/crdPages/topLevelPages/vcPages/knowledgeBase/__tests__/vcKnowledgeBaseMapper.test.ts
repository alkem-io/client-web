import { describe, expect, it, vi } from 'vitest';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { type MapVcKnowledgeBaseInput, mapVcKnowledgeBaseToViewProps } from '../vcKnowledgeBaseMapper';

const baseInput = (overrides: Partial<MapVcKnowledgeBaseInput> = {}): MapVcKnowledgeBaseInput => ({
  loading: false,
  noAccess: false,
  vcId: 'vc-123',
  displayName: 'Helper VC',
  avatarUrl: 'https://example.com/a.png',
  description: 'Some **knowledge**.',
  canRefresh: true,
  lastUpdatedValue: 'Jun 2, 2026, 10:00 AM',
  onRefresh: vi.fn(),
  refreshing: false,
  calloutsCount: 3,
  ...overrides,
});

describe('mapVcKnowledgeBaseToViewProps', () => {
  it('maps identity, description and refresh fields', () => {
    const onRefresh = vi.fn();
    const props = mapVcKnowledgeBaseToViewProps(baseInput({ onRefresh }));

    expect(props.displayName).toBe('Helper VC');
    expect(props.avatarUrl).toBe('https://example.com/a.png');
    expect(props.avatarColor).toBe(pickColorFromId('vc-123'));
    expect(props.description).toBe('Some **knowledge**.');
    expect(props.refresh).toEqual({
      canRefresh: true,
      lastUpdatedValue: 'Jun 2, 2026, 10:00 AM',
      onRefresh,
      refreshing: false,
    });
  });

  it('flags empty when there are no callouts', () => {
    expect(mapVcKnowledgeBaseToViewProps(baseInput({ calloutsCount: 0 })).isEmpty).toBe(true);
    expect(mapVcKnowledgeBaseToViewProps(baseInput({ calloutsCount: 5 })).isEmpty).toBe(false);
  });

  it('normalizes a blank description to undefined', () => {
    expect(mapVcKnowledgeBaseToViewProps(baseInput({ description: '' })).description).toBeUndefined();
    expect(mapVcKnowledgeBaseToViewProps(baseInput({ description: undefined })).description).toBeUndefined();
  });

  it('falls back to a deterministic color when vcId is missing', () => {
    expect(mapVcKnowledgeBaseToViewProps(baseInput({ vcId: undefined })).avatarColor).toBe(pickColorFromId('vc'));
  });

  it('passes through loading and noAccess', () => {
    const props = mapVcKnowledgeBaseToViewProps(baseInput({ loading: true, noAccess: true }));
    expect(props.loading).toBe(true);
    expect(props.noAccess).toBe(true);
  });
});
