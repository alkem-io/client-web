import { describe, expect, it } from 'vitest';
import { WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { decidePreviewWork } from './decidePreviewWork';

const base = {
  hadLocalEdits: false,
  sceneIsEmpty: false,
  mode: WhiteboardPreviewMode.Auto,
  hasPreview: true,
  hasCard: true,
  canUpload: true,
};

describe('decidePreviewWork', () => {
  it('does nothing when the visuals exist and this session changed nothing', () => {
    expect(decidePreviewWork(base)).toBe('none');
  });

  it('regenerates after local edits', () => {
    expect(decidePreviewWork({ ...base, hadLocalEdits: true })).toBe('full');
    expect(decidePreviewWork({ ...base, hadLocalEdits: true, mode: WhiteboardPreviewMode.Custom })).toBe('full');
  });

  it('keeps a Fixed preview after local edits', () => {
    expect(decidePreviewWork({ ...base, hadLocalEdits: true, mode: WhiteboardPreviewMode.Fixed })).toBe('none');
  });

  it('generates a missing preview without local edits, in any mode', () => {
    expect(decidePreviewWork({ ...base, hasPreview: false })).toBe('full');
    expect(decidePreviewWork({ ...base, hasPreview: false, mode: WhiteboardPreviewMode.Fixed })).toBe('full');
  });

  it('derives only the CARD from the stored preview when just the CARD is missing', () => {
    expect(decidePreviewWork({ ...base, hasCard: false })).toBe('card-from-preview');
    expect(decidePreviewWork({ ...base, hasCard: false, mode: WhiteboardPreviewMode.Fixed, hadLocalEdits: true })).toBe(
      'card-from-preview'
    );
  });

  it('keeps the placeholder for an empty whiteboard', () => {
    expect(decidePreviewWork({ ...base, sceneIsEmpty: true, hasPreview: false, hasCard: false })).toBe('none');
    expect(decidePreviewWork({ ...base, sceneIsEmpty: true, hadLocalEdits: true })).toBe('none');
  });

  it('skips all work when there is nowhere to upload', () => {
    expect(decidePreviewWork({ ...base, canUpload: false, hasPreview: false, hadLocalEdits: true })).toBe('none');
  });
});
