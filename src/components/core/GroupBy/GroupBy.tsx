import React from 'react';
import { groupBy } from 'lodash';

type GroupedData<T> = {
  key: keyof T;
  keyValue: string;
  values: T[];
};

export interface GroupByProps<T> {
  data: T[];
  groupKey: keyof T;
  children: (groupedData: GroupedData<T>[]) => React.ReactNode;
}

const GroupBy = <T extends Object>({ data, groupKey, children }: GroupByProps<T>) => {
  if (!data.length) {
    return <>{children([])}</>;
  }

  const grouped = groupBy(data, groupKey);
  const groups = Object.keys(grouped).map(x => ({
    key: groupKey,
    keyValue: x,
    values: grouped[x],
  }));

  return <>{children(groups)}</>;
};
export default GroupBy;
