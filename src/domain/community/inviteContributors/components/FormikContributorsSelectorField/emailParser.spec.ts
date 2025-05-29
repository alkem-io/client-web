import emailParser from './emailParser';
import { expect, it, describe } from 'vitest';

describe('emailParser', () => {
  it('should parse a single email', () => {
    const input = 'john.doe@example.com';
    const result = emailParser(input);
    expect(result).toEqual([{ displayName: 'john.doe@example.com', email: 'john.doe@example.com' }]);
  });

  it('should parse different chars', () => {
    const input = 'john.doe3+test@exam-ple.com';
    const result = emailParser(input);
    expect(result).toEqual([{ displayName: 'john.doe3+test@exam-ple.com', email: 'john.doe3+test@exam-ple.com' }]);
  });

  it('should parse multiple emails separated by commas', () => {
    const input = 'john.doe@example.com,jane.smith@domain.com,random.user123@mail.com';
    const result = emailParser(input);
    expect(result).toEqual([
      { displayName: 'john.doe@example.com', email: 'john.doe@example.com' },
      { displayName: 'jane.smith@domain.com', email: 'jane.smith@domain.com' },
      { displayName: 'random.user123@mail.com', email: 'random.user123@mail.com' },
    ]);
  });

  it('should parse multiple emails separated by separators mixed', () => {
    const input =
      'john.doe@example.com,,jane.smith@domain.com;random.user123@mail.com\ntest@email.com\ttest2@email.com\n\r\ntest3@email.com;user.name456@provider.co';
    const result = emailParser(input);
    expect(result).toEqual([
      { displayName: 'john.doe@example.com', email: 'john.doe@example.com' },
      { displayName: 'jane.smith@domain.com', email: 'jane.smith@domain.com' },
      { displayName: 'random.user123@mail.com', email: 'random.user123@mail.com' },
      { displayName: 'test@email.com', email: 'test@email.com' },
      { displayName: 'test2@email.com', email: 'test2@email.com' },
      { displayName: 'test3@email.com', email: 'test3@email.com' },
      { displayName: 'user.name456@provider.co', email: 'user.name456@provider.co' },
    ]);
  });

  it('should parse multiple emails separated by different delimiters and mixed formats', () => {
    const input = `john.doe@example.com; jane.smith@domain.com random.user123@mail.com
    Name Surname <name.surname@email.com>`;
    const result = emailParser(input);
    expect(result).toEqual([
      { displayName: 'john.doe@example.com', email: 'john.doe@example.com' },
      { displayName: 'jane.smith@domain.com', email: 'jane.smith@domain.com' },
      { displayName: 'random.user123@mail.com', email: 'random.user123@mail.com' },
      { displayName: 'Name Surname', email: 'name.surname@email.com' },
    ]);
  });

  it('should handle emails in the format "Name Surname <email>"', () => {
    const input = 'Name Surname <name.surname@email.com>';
    const result = emailParser(input);
    expect(result).toEqual([{ displayName: 'Name Surname', email: 'name.surname@email.com' }]);
  });

  it('should handle mixed formats of emails', () => {
    const input = `john.doe@example.com, Name Surname <name.surname@email.com>;
    jane.smith@domain.com random.user123@mail.com`;
    const result = emailParser(input);
    expect(result).toEqual([
      { displayName: 'john.doe@example.com', email: 'john.doe@example.com' },
      { displayName: 'Name Surname', email: 'name.surname@email.com' },
      { displayName: 'jane.smith@domain.com', email: 'jane.smith@domain.com' },
      { displayName: 'random.user123@mail.com', email: 'random.user123@mail.com' },
    ]);
  });

  it('should ignore empty entries and invalid formats', () => {
    const input = ', , ; ; \n\n john.doe@example.com, <invalid-email>';
    const result = emailParser(input);
    expect(result).toEqual([
      { displayName: 'john.doe@example.com', email: 'john.doe@example.com' },
      { displayName: '<invalid-email>', email: '<invalid-email>' },
    ]);
  });
});
