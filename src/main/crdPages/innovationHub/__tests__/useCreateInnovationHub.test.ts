import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { InnovationHubType } from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { CreateInnovationHubValues } from '@/crd/components/innovationHub/createInnovationHub.types';
import { validateCreateInnovationHub } from '../createInnovationHubSchema';

// ---- Mock the generated mutation hook (repo convention — no MockedProvider) ----
const createMutationMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateInnovationHubMutation: (options: unknown) => {
    lastOptions = options;
    return [createMutationMock, { loading: false }];
  },
}));
let lastOptions: unknown;

import { useCreateInnovationHub } from '../useCreateInnovationHub';

const VALID: CreateInnovationHubValues = {
  subdomain: 'my-hub',
  name: 'My Hub',
  tagline: 'A tagline',
  description: 'Some description',
};

describe('validateCreateInnovationHub', () => {
  test('accepts a fully valid form', () => {
    expect(validateCreateInnovationHub(VALID)).toEqual({});
  });

  test('subdomain: required / format / min / max', () => {
    expect(validateCreateInnovationHub({ ...VALID, subdomain: '' }).subdomain).toBe('subdomainRequired');
    expect(validateCreateInnovationHub({ ...VALID, subdomain: 'FooBar' }).subdomain).toBe('subdomainFormat');
    expect(validateCreateInnovationHub({ ...VALID, subdomain: 'foo bar' }).subdomain).toBe('subdomainFormat');
    expect(validateCreateInnovationHub({ ...VALID, subdomain: 'ab' }).subdomain).toBe('subdomainMin');
    expect(validateCreateInnovationHub({ ...VALID, subdomain: 'a'.repeat(26) }).subdomain).toBe('subdomainMax');
    expect(validateCreateInnovationHub({ ...VALID, subdomain: 'a'.repeat(25) }).subdomain).toBeUndefined();
  });

  test('name: required / min 3 / max 128', () => {
    expect(validateCreateInnovationHub({ ...VALID, name: '' }).name).toBe('required');
    expect(validateCreateInnovationHub({ ...VALID, name: 'ab' }).name).toBe('min3');
    expect(validateCreateInnovationHub({ ...VALID, name: 'a'.repeat(SMALL_TEXT_LENGTH + 1) }).name).toBe('maxSmall');
  });

  test('tagline: optional, max 512', () => {
    expect(validateCreateInnovationHub({ ...VALID, tagline: '' }).tagline).toBeUndefined();
    expect(validateCreateInnovationHub({ ...VALID, tagline: 'a'.repeat(MID_TEXT_LENGTH + 1) }).tagline).toBe('maxMid');
  });

  test('description: required, max 8000', () => {
    expect(validateCreateInnovationHub({ ...VALID, description: '' }).description).toBe('required');
    expect(validateCreateInnovationHub({ ...VALID, description: '   ' }).description).toBe('required');
    expect(
      validateCreateInnovationHub({ ...VALID, description: 'a'.repeat(MARKDOWN_TEXT_LENGTH + 1) }).description
    ).toBe('maxMarkdown');
  });
});

describe('useCreateInnovationHub', () => {
  beforeEach(() => {
    createMutationMock.mockReset();
    createMutationMock.mockResolvedValue({ data: { createInnovationHub: { id: 'hub-1' } } });
  });

  test('refetches the account + admin hub list queries', () => {
    renderHook(() => useCreateInnovationHub({ accountId: 'acc-1' }));
    expect(lastOptions).toMatchObject({ refetchQueries: ['AdminInnovationHubsList', 'AccountInformation'] });
  });

  test('sends List-type hub with empty space-list filter and trimmed profile, calls onCreated', async () => {
    const onCreated = vi.fn();
    const { result } = renderHook(() => useCreateInnovationHub({ accountId: 'acc-1', onCreated }));

    let resolved: string | undefined;
    await act(async () => {
      resolved = await result.current.create({
        subdomain: ' my-hub ',
        name: ' My Hub ',
        tagline: ' Tagline ',
        description: 'Body',
      });
    });

    expect(createMutationMock).toHaveBeenCalledWith({
      variables: {
        hubData: {
          accountID: 'acc-1',
          subdomain: 'my-hub',
          profileData: { displayName: 'My Hub', tagline: 'Tagline', description: 'Body' },
          type: InnovationHubType.List,
          spaceListFilter: [],
        },
      },
    });
    expect(resolved).toBe('hub-1');
    expect(onCreated).toHaveBeenCalledWith('hub-1');
  });

  test('rejects without firing the mutation when accountId is missing', async () => {
    const { result } = renderHook(() => useCreateInnovationHub({ accountId: undefined }));
    await expect(result.current.create(VALID)).rejects.toThrow(/accountId/);
    expect(createMutationMock).not.toHaveBeenCalled();
  });
});
