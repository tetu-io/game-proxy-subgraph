import { PawnshopPositionEntity } from '../../gql/gql';

export function getMinPricesPawnshop(items: PawnshopPositionEntity[]): Map<string, number> {
  return items.filter(i => i.collateralItem).reduce((map, item) => {
    const metaId = item.collateralItem?.meta?.id || '';
    const price = +item.acquiredAmount;
    const currentMinPrice = map.get(metaId);
    if (currentMinPrice === undefined || price < currentMinPrice) {
      map.set(metaId, price);
    }
    return map;
  }, new Map<string, number>());
}