/**
 * @deprecated - use EllipsableWithCount
 */
const withOptionalCount = (label: string, count?: number) =>
  typeof count === 'undefined' ? label : `${label} (${count})`;

export default withOptionalCount;
