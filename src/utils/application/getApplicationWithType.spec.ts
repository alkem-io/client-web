import { ApplicationResultEntry } from '../../models/graphql-schema';
import getApplicationWithType, { ApplicationWithType } from './getApplicationWithType';
import { ApplicationTypeEnum } from '../../models/enums/application-type';

type TestData = {
  name: string;
  data: Partial<ApplicationResultEntry>;
  result?: Partial<ApplicationWithType>;
  exceptionMsg?: string;
};

const data = (): TestData[] =>
  [
    // normal case
    {
      name: '3',
      data: { id: 'app-id', ecoverseID: 'eco' },
      result: { id: 'app-id', ecoverseID: 'eco', type: ApplicationTypeEnum.ecoverse },
    },
    {
      name: '4',
      data: { id: 'app-id', ecoverseID: 'eco', challengeID: 'chall' },
      result: { id: 'app-id', ecoverseID: 'eco', challengeID: 'chall', type: ApplicationTypeEnum.challenge },
    },
    {
      name: '5',
      data: { id: 'app-id', ecoverseID: 'eco', challengeID: 'chall', opportunityID: 'opp' },
      result: {
        id: 'app-id',
        ecoverseID: 'eco',
        challengeID: 'chall',
        opportunityID: 'opp',
        type: ApplicationTypeEnum.opportunity,
      },
    },
  ].map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

const exceptionData = (): TestData[] =>
  [
    //edge case
    { name: '1', data: { id: 'app-id' }, exceptionMsg: "'ecoverseID' parameter expected" },
    {
      name: '2',
      data: { id: 'app-id', ecoverseID: 'eco', opportunityID: 'opp' },
      exceptionMsg: "'challengeID' parameter expected when 'ecoverseID' and 'opportunityID' are provided",
    },
  ].map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each;

describe('getApplicationWithType', () => {
  test.concurrent.each(data())('%s', async ({ data, result }) => {
    const appWithType = getApplicationWithType(data as ApplicationResultEntry);
    expect(appWithType).toEqual(result);
  });

  test.concurrent.each(exceptionData())('%s', async ({ data, exceptionMsg }) => {
    expect(() => getApplicationWithType(data as ApplicationResultEntry)).toThrowError(exceptionMsg);
  });
});
