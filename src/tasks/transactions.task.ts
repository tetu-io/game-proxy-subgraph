import { TransactionEntity } from '../../gql/gql';
import { getTransactionsFrom } from '../graphql/graph-service';

// prod timestamp
const START_TIMESTAMP = '1741564800'
// test timestamp
// const START_TIMESTAMP = '1743478407'

export async function getTransactionsTask(): Promise<TransactionEntity[]> {
  const startTime = Date.now();
  try {
    const data = await getTransactionsFrom(START_TIMESTAMP);
    console.log(`Fetched ${data.length} transactions`);
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