const nameOf = <T>(name: Extract<keyof T, string>): string => name;
export default nameOf;
