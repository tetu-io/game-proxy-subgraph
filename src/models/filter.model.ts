export class DropdownItemModel {
  id?: string;
  label?: string;
  address?: string;
  prefixIconPath?: string;
  suffixIconPath?: string;
  iconHeight?: string;
  selectedItemPrefixIconPath?: string;
  suffixText?: string;
  valueFormatted?: string;
  valueN?: number;
  valueBN?: bigint;

  constructor(data: Partial<DropdownItemModel> = {}) {
    Object.assign(this, data);
  }
}

export interface IFilter {
  id: string;
  filterType: FILTER_TYPE;
  filterTypeIcon?: string;
  attribute: DropdownItemModel | null;
  and: string | boolean;
  value: string;
  order: number;
}

export enum FILTER_TYPE {
  COMMON = 'COMMON',
  MAGIC_ATTACK = 'MAGIC_ATTACK',
  SKILL_BUFF_CASTER = 'SKILL_BUFF_CASTER',
  IMPACT = 'IMPACT',
}