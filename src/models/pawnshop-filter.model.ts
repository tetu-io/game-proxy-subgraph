import { IFilter } from './filter.model';
import { PaginationModel } from './pagination.model';

export interface PawnshopFilterModel extends PaginationModel{
  selectedActionId: string;
  currentPositionSort: string;
  sortDirection: number;
  currentFilterQuery: string | null;
  isShowOnlyMyControl: string;
  filters: IFilter[];
  generalFilters?: { [key: string]: { min: string; max: string } };
}

export interface PawnshopItemFilterModel extends PawnshopFilterModel {
  onlyConcreteItemType: number;
}

export interface PawnshopItemFilterModel extends PawnshopFilterModel {
  onlyConcreteHeroes: number;
}