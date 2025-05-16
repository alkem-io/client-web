type EmailParserResult = {
  displayName: string;
  email: string;
}[];

// Find things like "Name Surname <name.surname@email.com>
const nameEmailRegex = /^(?:([^<>]+))\s*?<([^<>]+)>$/i;
// https://www.regular-expressions.info/email.html
const emailRegex =
  /^<?([a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?)>?$/i;

const delimitersRegex = /[,;\r\n\t]+/;

const emailParser = (data: string): EmailParserResult => {
  const results: EmailParserResult = [];

  // Split the input data by common delimiters (comma, semicolon, newline, tab, but not space yet, in case we have a format like "Name Surname <name.surname@email.com>")
  const lines = `${data}`
    .trim()
    .split(delimitersRegex)
    .map(item => item.trim())
    .filter(item => item);

  for (const line of lines) {
    const nameEmailMatch = line.match(nameEmailRegex);

    if (nameEmailMatch && nameEmailMatch[2]) {
      const displayName = nameEmailMatch[1]?.trim() || nameEmailMatch[2].trim();
      const email = nameEmailMatch[2].trim();
      if (emailRegex.test(email)) {
        results.push({ displayName, email });
      } else {
        // Doesn't match email regex, so we assume it's a wrong address,
        // but we don't filter here, Formik will mark it later as an error
        results.push({ displayName: email, email: email });
      }
    } else {
      // Split again in case there are multiple addresses in the same block separated by spaces
      const textBlocks = line
        .split(/\s+/)
        .map(item => item.trim())
        .filter(item => item);
      // Add the rest of the text blocks as addresses directly
      results.push(...textBlocks.map(item => ({ displayName: item, email: item })));
    }
  }
  return results;
};

export default emailParser;
