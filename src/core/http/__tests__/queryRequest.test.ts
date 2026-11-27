import axios from 'axios';
import { parse } from 'graphql';
import { describe, expect, test, vi } from 'vitest';
import queryRequest from '../queryRequest';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));

describe('queryRequest', () => {
  test('gives up after 8 s', async () => {
    await queryRequest('/api/public/graphql', parse('{ platform { id } }'));

    expect(vi.mocked(axios.post).mock.calls[0][2]).toMatchObject({ timeout: 8000 });
  });
});
