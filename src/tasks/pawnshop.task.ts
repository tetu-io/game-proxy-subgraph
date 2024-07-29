import { PawnshopPositionEntity } from '../../generated/gql';
import { getPawnshopPositions } from '../graphql/graph-service';

export async function getPawnshopPositionsTask(): Promise<PawnshopPositionEntity[]> {
  const startTime = Date.now();
  try {
    const data = await getPawnshopPositions();
    console.log(`Fetched ${data.length} pawnshop positions`);
    const lastCacheUpdate = new Date();
    const duration = Date.now() - startTime;
    console.log(`Cache updated at ${lastCacheUpdate}. Update took ${duration} ms`);
    return data;
  } catch (error) {
    console.error('Failed to update cache:', error);
    const duration = Date.now() - startTime;
    console.error(`Update failed after ${duration} ms`);
    return [];
  }
}