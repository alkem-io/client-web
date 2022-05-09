// const nameOf = <T>(name: Extract<keyof T, string>): string => name;
/***
 * Unsupported in IE
 * https://stackoverflow.com/a/63891494/11207901
 */
const nameOf = <T>() => {
  return new Proxy(
    {},
    {
      get: function (_target, prop) {
        return prop;
      },
    }
  ) as {
    [P in keyof T]: P;
  };
};
export default nameOf;
