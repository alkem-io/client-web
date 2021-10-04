import { ApplicationResultEntry } from '../../models/graphql-schema';
import getApplicationWithType, { ApplicationWithType } from './getApplicationWithType';
import ApplicationTypeEnum from '../../models/application-type';

type TestData = {
  name: string;
  data: Partial<ApplicationResultEntry>;
  result?: Partial<ApplicationWithType>;
  exceptionMsg?: string;
};

const data = (): TestData[] =>
  [
    //edge case
    { name: '1', data: { id: 'app-id' }, exceptionMsg: "'ecoverseID' parameter expected" },
    {
      name: '2',
      data: { id: 'app-id', ecoverseID: 'eco', opportunityID: 'opp' },
      exceptionMsg: "'challengeID' parameter expected when 'ecoverseID' and 'opportunityID' are provided",
    },
    // normal case
    {
      name: '3',
      data: { id: 'app-id', ecoverseID: 'eco' },
      result: { id: 'app-id', ecoverseID: 'eco', type: ApplicationTypeEnum.HUB },
    },
    {
      name: '4',
      data: { id: 'app-id', ecoverseID: 'eco', challengeID: 'chall' },
      result: { id: 'app-id', ecoverseID: 'eco', challengeID: 'chall', type: ApplicationTypeEnum.CHALLENGE },
    },
    {
      name: '5',
      data: { id: 'app-id', ecoverseID: 'eco', challengeID: 'chall', opportunityID: 'opp' },
      result: {
        id: 'app-id',
        ecoverseID: 'eco',
        challengeID: 'chall',
        opportunityID: 'opp',
        type: ApplicationTypeEnum.OPPORTUNITY,
      },
    },
  ].map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

describe('getApplicationWithType', () =>
  test.concurrent.each(data())('%s', async ({ data, result, exceptionMsg }) => {
    if (exceptionMsg) {
      expect(() => getApplicationWithType(data as ApplicationResultEntry)).toThrowError(exceptionMsg);
    } else {
      const appWithType = getApplicationWithType(data as ApplicationResultEntry);
      expect(appWithType).toEqual(result);
    }
  }));
