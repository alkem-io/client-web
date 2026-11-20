import { describe, expect, it } from 'vitest';
import { subspaceHomeColumns } from './subspaceHomeColumns';

describe('subspaceHomeColumns', () => {
  it('without a sidebar the content fills the track inside the gutters', () => {
    expect(subspaceHomeColumns(false, false, false)).toEqual({ sidebar: '', main: 'lg:col-start-2 lg:col-span-10' });
    expect(subspaceHomeColumns(false, true, false).main).toBe('lg:col-start-2 lg:col-span-10');
  });

  it('without a sidebar and full width the content spans every column', () => {
    expect(subspaceHomeColumns(true, false, false)).toEqual({ sidebar: '', main: 'lg:col-start-1 lg:col-span-12' });
  });

  it('with a sidebar the content starts after it', () => {
    expect(subspaceHomeColumns(false, false, true).main).toBe('lg:col-start-4 lg:col-span-8');
    expect(subspaceHomeColumns(true, true, true).main).toBe('lg:col-start-2 lg:col-span-11');
  });
});
