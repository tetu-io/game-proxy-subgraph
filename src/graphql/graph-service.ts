import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client/core';
import { getPawnshopPositionsQuery } from './pawnshop-positions-query';
import dotenv from 'dotenv';
import { getTransactionsFromQuery } from './transactions-from-query';
import { PawnshopPositionEntity, TransactionEntity } from '../../gql/gql';

dotenv.config();

const PAWNSHOP_FIRST = +(process.env.PAWNSHOP_FIRST || 1000);
const PAWNSHOP_MAX_RETRIES = +(process.env.PAWNSHOP_MAX_RETRIES || 10);

function getSubgraphUrl() {
  return process.env.SUBGRAPH_URL;
}

function getTransactionsSubgraphUrl() {
  return process.env.TRANSACTIONS_SUBGRAPH_URL || 'https://graph.tetu.io/subgraphs/name/sacra-sonic-transactions';
}

export function createClient(url: string) {
  return new ApolloClient({
    link: createHttpLink({
      uri: url,
      fetch,
    }),
    cache: new InMemoryCache({
      resultCaching: false,
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
}


async function fetchPawnshopPositionsWithRetry(client: ApolloClient<any>, skip: number, first: number) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getPawnshopPositionsQuery(),
        variables: { skip, first },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} PawnshopPositionsQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed PawnshopPositionsQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

async function fetchTransactionsFromWithRetry(client: ApolloClient<any>, timestamp: string, skip: number, first: number) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getTransactionsFromQuery(),
        variables: { skip, first, timestamp },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} TransactionsFromQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed TransactionsFromQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

export async function getPawnshopPositions(): Promise<PawnshopPositionEntity[]> {
  console.log('Fetching pawnshop positions');
  let allData: PawnshopPositionEntity[] = [];

  try {
    const client = createClient(getSubgraphUrl() ?? 'no_url');

    let skip = 0;
    let fetchMore = true;
    let turn = 1;

    while (fetchMore) {
      console.log(`Fetching pawnshop positions with skip ${skip} , turn ${turn}`);
      const data = await fetchPawnshopPositionsWithRetry(client, skip, PAWNSHOP_FIRST);

      if (data.pawnshopPositionEntities && data.pawnshopPositionEntities.length > 0) {
        allData = allData.concat(data.pawnshopPositionEntities);
        skip += PAWNSHOP_FIRST;
      } else {
        fetchMore = false;
      }
      turn++;
    }
  } catch (error) {
    console.error(`Error fetching pawnshop positions for subgraph url ${getSubgraphUrl()}: ${error}`);
  }

  return reduceListPrices(allData);
}

export async function getTransactionsFrom(timestamp: string): Promise<TransactionEntity[]> {
  console.log('Fetching transaction');
  let allData: TransactionEntity[] = [];

  try {
    const client = createClient(getTransactionsSubgraphUrl() ?? 'no_url');

    let skip = 0;
    let fetchMore = true;
    let turn = 1;

    while (fetchMore) {
      console.log(`Fetching transactions with skip ${skip} , turn ${turn}`);
      const data = await fetchTransactionsFromWithRetry(client, timestamp, skip, PAWNSHOP_FIRST);

      if (data.transactionEntities && data.transactionEntities.length > 0) {
        allData = allData.concat(data.transactionEntities);
        skip += PAWNSHOP_FIRST;
      } else {
        fetchMore = false;
      }
      turn++;
    }
  } catch (error) {
    console.error(`Error fetching transactions for subgraph url ${getTransactionsSubgraphUrl()}: ${error}`);
  }

  return allData;
}

function reduceListPrices(items: PawnshopPositionEntity[]): PawnshopPositionEntity[] {
  return items.map(item => {
    if (item.collateralItem?.meta?.pawnshopItemStat) {
      const newPawnshopItemStat = item.collateralItem.meta.pawnshopItemStat.map(stat => {
        if (stat.prices) {
          // Create a new stat object with the last 5 prices
          return {
            ...stat,
            prices: stat.prices.slice(-5)
          };
        }
        return stat;
      });
      // Create a new item object with the updated pawnshopItemStat
      return {
        ...item,
        collateralItem: {
          ...item.collateralItem,
          meta: {
            ...item.collateralItem.meta,
            pawnshopItemStat: newPawnshopItemStat
          }
        }
      };
    }
    return item;
  });
}