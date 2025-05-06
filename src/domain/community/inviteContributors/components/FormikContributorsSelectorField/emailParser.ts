type EmailParserResult = {
  displayName: string;
  email: string;
}[];

// Find thins like "Name Surname <name.surname@email.com>
const nameEmailRegex = /^(?:([^<>]+))\s*?<([^<>]+)>$/i;
// https://www.regular-expressions.info/email.html
const emailRegex =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?$/i;

const emailParser = (data: string): EmailParserResult => {
  const results: EmailParserResult = [];

  // Split the input data by common delimiters (comma, semicolon, newline, tab, but not space yet, in case we have a format like "Name Surname <name.surname@email.com>")
  const lines = `${data}`
    .trim()
    .split(/[,;\r\n\t]+/)
    .map(item => item.trim())
    .filter(item => item);

  for (const line of lines) {
    const nameEmailMatch = line.match(nameEmailRegex);
    console.log('nameEmailMatch', line, nameEmailMatch, nameEmailMatch?.[1], nameEmailMatch?.[2]);
    if (nameEmailMatch && nameEmailMatch[2]) {
      const displayName = nameEmailMatch[1]?.trim() || nameEmailMatch[2].trim();
      const email = nameEmailMatch[2].trim();
      if (emailRegex.test(email)) {
        results.push({ displayName, email });
        continue;
      }
    } else {
      // Split again in case there are multiple addresses in the same block separated by spaces
      const textBlocks = line
        .split(/\s+/)
        .map(item => item.trim())
        .filter(item => item);
      for (const address of textBlocks) {
        const emailMatch = address.match(emailRegex);
        if (emailMatch && emailMatch[0]) {
          results.push({ displayName: emailMatch[0].trim(), email: emailMatch[0].trim() });
        }
      }
    }
  }
  return results;
};

export default emailParser;
