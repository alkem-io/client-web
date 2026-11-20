import { describe, expect, it, vi } from 'vitest';

const usePlatformLicensingPlansQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLicensingPlansQuery: (...args: unknown[]) => usePlatformLicensingPlansQueryMock(...args),
}));

import useCanManageLicensePlans from './useCanManageLicensePlans';

const queryResult = (myPrivileges: string[] = []) => ({
  data: {
    platform: {
      licensingFramework: {
        id: 'licensing-1',
        authorization: { id: 'auth-1', myPrivileges },
      },
    },
  },
  loading: false,
});

describe('useCanManageLicensePlans', () => {
  it('is true when the licensing framework authorization carries Grant', () => {
    usePlatformLicensingPlansQueryMock.mockReturnValue(queryResult(['GRANT']));
    expect(useCanManageLicensePlans()).toBe(true);
  });

  it('is false without Grant', () => {
    usePlatformLicensingPlansQueryMock.mockReturnValue(queryResult(['READ']));
    expect(useCanManageLicensePlans()).toBe(false);
  });

  it('is false when the query has not resolved yet', () => {
    usePlatformLicensingPlansQueryMock.mockReturnValue({ data: undefined, loading: true });
    expect(useCanManageLicensePlans()).toBe(false);
  });

  it('queries cache-first', () => {
    usePlatformLicensingPlansQueryMock.mockReturnValue(queryResult(['GRANT']));
    useCanManageLicensePlans();
    expect(usePlatformLicensingPlansQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: 'cache-first' })
    );
  });
});
