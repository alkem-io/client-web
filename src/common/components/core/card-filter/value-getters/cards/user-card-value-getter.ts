import { UserCardProps } from '../../../../composite/common/cards';
import { ValueType } from '../../filterFn';

export const userCardValueGetter = ({ id, displayName, roleName, country, city, tags }: UserCardProps): ValueType => ({
  id: id ?? '',
  values: [displayName ?? '', roleName ?? '', country ?? '', city ?? '', (tags ?? []).join(' ')],
});

export const userCardTagsGetter = ({ tags }: UserCardProps): string[] => tags ?? [];
