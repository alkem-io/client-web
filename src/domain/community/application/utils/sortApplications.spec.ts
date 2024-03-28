import { ApplicationWithType } from './getApplicationWithType';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../constants/ApplicationState';
import sortApplications from './sortApplications';
import { expect, test, describe } from 'vitest';

type TestData = {
  name: string;
  data: Partial<ApplicationWithType>[];
  result: string[]; //array of ids for easier testing
};

const data = (): TestData[] =>
  (
    [
      {
        name: '1',
        data: [
          { id: '1', type: 'challenge' },
          { id: '2', type: 'space' },
          { id: '3', type: 'opportunity' },
          { id: '4', type: 'space' },
        ],
        result: ['2', '4', '1', '3'],
      },
      {
        name: '2',
        data: [
          { id: '1', type: 'space', state: APPLICATION_STATE_REJECTED },
          { id: '2', type: 'space', state: APPLICATION_STATE_NEW },
        ],
        result: ['2', '1'],
      },
      {
        name: '3',
        data: [
          { id: '1', type: 'challenge', state: APPLICATION_STATE_REJECTED },
          { id: '2', type: 'challenge', state: APPLICATION_STATE_NEW },
        ],
        result: ['2', '1'],
      },
      {
        name: '4',
        data: [
          { id: '1', type: 'opportunity', state: APPLICATION_STATE_REJECTED },
          { id: '2', type: 'opportunity', state: APPLICATION_STATE_NEW },
        ],
        result: ['2', '1'],
      },
      {
        name: '5',
        data: [
          { id: '1', type: 'challenge', state: APPLICATION_STATE_REJECTED },
          { id: '2', type: 'challenge', state: APPLICATION_STATE_NEW },
          { id: '3', type: 'space', state: APPLICATION_STATE_NEW },
          { id: '4', type: 'space', state: APPLICATION_STATE_REJECTED },
        ],
        result: ['3', '4', '2', '1'],
      },
    ] as TestData[]
  ).map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

describe('sortApplications', () => {
  test.concurrent.each(data())('%s', async ({ data, result }) => {
    const sorted = (data as ApplicationWithType[]).sort(sortApplications);
    expect(sorted.map(x => x.id)).toEqual(result);
  });
});
