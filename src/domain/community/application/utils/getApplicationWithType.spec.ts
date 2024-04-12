import { ApplicationForRoleResult } from '../../../../core/apollo/generated/graphql-schema';
import getApplicationWithType, { ApplicationWithType } from './getApplicationWithType';
import { expect, test, describe } from 'vitest';

type TestData = {
  name: string;
  data: Partial<ApplicationForRoleResult>;
  result?: Partial<ApplicationWithType>;
  exceptionMsg?: string;
};

const data = (): TestData[] =>
  (
    [
      // normal case
      {
        name: '3',
        data: { id: 'app-id', spaceID: 'eco' },
        result: { id: 'app-id', spaceID: 'eco', type: 'space' },
      },
      {
        name: '4',
        data: { id: 'app-id', spaceID: 'eco', subspaceID: 'chall' },
        result: { id: 'app-id', spaceID: 'eco', subspaceID: 'chall', type: 'subspace' },
      },
      {
        name: '5',
        data: { id: 'app-id', spaceID: 'eco', subspaceID: 'chall', subsubspaceID: 'opp' },
        result: {
          id: 'app-id',
          spaceID: 'eco',
          subspaceID: 'chall',
          subsubspaceID: 'opp',
          type: 'subsubspace',
        },
      },
    ] as TestData[]
  ).map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

const exceptionData = (): TestData[] =>
  [
    //edge case
    { name: '1', data: { id: 'app-id' }, exceptionMsg: "'spaceID' parameter expected" },
    {
      name: '2',
      data: { id: 'app-id', spaceID: 'eco', subsubspaceID: 'opp' },
      exceptionMsg: "'subspaceID' parameter expected when 'spaceID' and 'subsubspaceID' are provided",
    },
  ].map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each;

describe('getApplicationWithType', () => {
  test.concurrent.each(data())('%s', async ({ data, result }) => {
    const appWithType = getApplicationWithType(data as ApplicationForRoleResult);
    expect(appWithType).toEqual(result);
  });

  test.concurrent.each(exceptionData())('%s', async ({ data, exceptionMsg }) => {
    expect(() => getApplicationWithType(data as ApplicationForRoleResult)).toThrowError(exceptionMsg);
  });
});
