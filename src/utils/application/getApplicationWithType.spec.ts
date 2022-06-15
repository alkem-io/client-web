import { ApplicationForRoleResult } from '../../models/graphql-schema';
import getApplicationWithType, { ApplicationWithType } from './getApplicationWithType';
import { ApplicationTypeEnum } from '../../models/enums/application-type';

type TestData = {
  name: string;
  data: Partial<ApplicationForRoleResult>;
  result?: Partial<ApplicationWithType>;
  exceptionMsg?: string;
};

const data = (): TestData[] =>
  [
    // normal case
    {
      name: '3',
      data: { id: 'app-id', hubID: 'eco' },
      result: { id: 'app-id', hubID: 'eco', type: ApplicationTypeEnum.hub },
    },
    {
      name: '4',
      data: { id: 'app-id', hubID: 'eco', challengeID: 'chall' },
      result: { id: 'app-id', hubID: 'eco', challengeID: 'chall', type: ApplicationTypeEnum.challenge },
    },
    {
      name: '5',
      data: { id: 'app-id', hubID: 'eco', challengeID: 'chall', opportunityID: 'opp' },
      result: {
        id: 'app-id',
        hubID: 'eco',
        challengeID: 'chall',
        opportunityID: 'opp',
        type: ApplicationTypeEnum.opportunity,
      },
    },
  ].map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

const exceptionData = (): TestData[] =>
  [
    //edge case
    { name: '1', data: { id: 'app-id' }, exceptionMsg: "'hubID' parameter expected" },
    {
      name: '2',
      data: { id: 'app-id', hubID: 'eco', opportunityID: 'opp' },
      exceptionMsg: "'challengeID' parameter expected when 'hubID' and 'opportunityID' are provided",
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
