const somePropsNotDefined = <Props extends {}>(props: Props): props is Required<Props> =>
  Object.keys(props).some(propName => !props[propName]);

export default somePropsNotDefined;
