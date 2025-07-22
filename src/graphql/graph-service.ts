import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client/core';
import { getPawnshopPositionsQuery } from './pawnshop-positions-query';
import dotenv from 'dotenv';
import { getTransactionsFromQuery } from './transactions-from-query';
import {
  HeroAction,
  HeroEntity,
  ItemActionEntity,
  ItemUsedEntity,
  PawnshopPositionEntity, PvpFightEntity,
  TransactionEntity,
} from '../../gql/gql';
import { getHeroActionsQuery } from './hero-actions-query';
import { getHeroDiedQuery } from './hero-died-query';
import { getItemActionsQuery } from './item-actions-query';
import { getItemUsedQuery } from './item-used-query';
import { getPvpFightsQuery } from './pvp-fights-query';

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
      console.log(`Fetching transactions with skip ${skip}, turn ${turn}`);

      const MAX_RETRIES = 3;
      let attempt = 0;
      let success = false;
      let data: any;

      while (attempt < MAX_RETRIES && !success) {
        try {
          data = await fetchTransactionsFromWithRetry(client, timestamp, skip, PAWNSHOP_FIRST);
          if (!data?.transactionEntities || !Array.isArray(data.transactionEntities)) {
            throw new Error('Invalid data structure: transactionEntities missing or not an array');
          }
          success = true;
        } catch (err) {
          attempt++;
          console.warn(`Attempt ${attempt} failed to fetch transactions: ${err}`);
          if (attempt >= MAX_RETRIES) {
            throw new Error(`Failed after ${MAX_RETRIES} attempts to fetch transactions with skip ${skip}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // backoff
        }
      }

      if (data.transactionEntities.length > 0) {
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

async function fetchHeroActionsWithRetry(client: ApolloClient<any>, id: string, actions: number[]) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getHeroActionsQuery(),
        variables: { id, actions },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} HeroActionsQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed HeroActionsQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

export async function getHeroActions(actions: number[]): Promise<HeroAction[]> {
  console.log('Fetching hero actions');
  let id = '';
  let fetchMore = true;
  let allData: HeroAction[] = [];
  try {
    const client = createClient(getSubgraphUrl() ?? 'no_url');
    while (fetchMore) {
      console.log(`Fetching hero actions with id ${id}`);
      const data = await fetchHeroActionsWithRetry(client, id, actions);
      allData = allData.concat(data.heroActions);
      if (data.heroActions.length > 0) {
        id = data.heroActions[data.heroActions.length - 1].id;
      } else {
        fetchMore = false;
      }
    }
    return allData;
  } catch (error) {
    console.error(`Error fetching hero actions for subgraph url ${getSubgraphUrl()}: ${error}`);
    return [];
  }
}

async function fetchHeroDiedWithRetry(client: ApolloClient<any>, id: string) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getHeroDiedQuery(),
        variables: { id },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} HeroDiedQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed HeroDiedQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

export async function getHeroDied(): Promise<HeroEntity[]> {
  console.log('Fetching hero died');
  let id = '';
  let fetchMore = true;
  let allData: HeroEntity[] = [];
  try {
    const client = createClient(getSubgraphUrl() ?? 'no_url');
    while (fetchMore) {
      console.log(`Fetching hero died with id ${id}`);
      const data = await fetchHeroDiedWithRetry(client, id);
      allData = allData.concat(data.heroEntities);
      if (data.heroEntities.length > 0) {
        id = data.heroEntities[data.heroEntities.length - 1].id;
      } else {
        fetchMore = false;
      }
    }
    return allData;
  } catch (error) {
    console.error(`Error fetching hero died for subgraph url ${getSubgraphUrl()}: ${error}`);
    return [];
  }
}

async function fetchItemActionsWithRetry(client: ApolloClient<any>, id: string, actions: number[]) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getItemActionsQuery(),
        variables: { id, actions },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} ItemActionsQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed ItemActionsQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

export async function getItemActions(actions: number[]): Promise<ItemActionEntity[]> {
  console.log('Fetching item actions');
  let id = '';
  let fetchMore = true;
  let allData: ItemActionEntity[] = [];
  try {
    const client = createClient(getSubgraphUrl() ?? 'no_url');
    while (fetchMore) {
      console.log(`Fetching item actions with id ${id}`);
      const data = await fetchItemActionsWithRetry(client, id, actions);
      allData = allData.concat(data.itemActionEntities);
      if (data.itemActionEntities.length > 0) {
        id = data.itemActionEntities[data.itemActionEntities.length - 1].id;
      } else {
        fetchMore = false;
      }
    }
    return allData;
  } catch (error) {
    console.error(`Error fetching item actions for subgraph url ${getSubgraphUrl()}: ${error}`);
    return [];
  }
}

async function fetchItemUsedWithRetry(client: ApolloClient<any>, id: string) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getItemUsedQuery(),
        variables: { id },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} ItemUsedQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed ItemUsedQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

export async function getItemUsed(): Promise<ItemUsedEntity[]> {
  console.log('Fetching item used');
  let id = '';
  let fetchMore = true;
  let allData: ItemUsedEntity[] = [];
  try {
    const client = createClient(getSubgraphUrl() ?? 'no_url');
    while (fetchMore) {
      console.log(`Fetching item used with id ${id}`);
      const data = await fetchItemUsedWithRetry(client, id);
      allData = allData.concat(data.itemUsedEntities);
      if (data.itemUsedEntities.length > 0) {
        id = data.itemUsedEntities[data.itemUsedEntities.length - 1].id;
      } else {
        fetchMore = false;
      }
    }
    return allData;
  } catch (error) {
    console.error(`Error fetching item used for subgraph url ${getSubgraphUrl()}: ${error}`);
    return [];
  }
}

async function fetchPvpFightsWithRetry(client: ApolloClient<any>, id: string) {
  let retries = 0;
  while (retries < PAWNSHOP_MAX_RETRIES) {
    try {
      const { data } = await client.query({
        query: getPvpFightsQuery(),
        variables: { id },
      });
      return data;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed: ${error} PvpFightsQuery`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed PvpFightsQuery to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
      }
    }
  }
}

export async function getPvpFights(): Promise<PvpFightEntity[]> {
  console.log('Fetching pvp fights');
  let id = '';
  let fetchMore = true;
  let allData: PvpFightEntity[] = [];
  try {
    const client = createClient(getSubgraphUrl() ?? 'no_url');
    while (fetchMore) {
      console.log(`Fetching pvp fights with id ${id}`);
      const data = await fetchPvpFightsWithRetry(client, id);
      allData = allData.concat(data.pvpFightEntities);
      if (data.pvpFightEntities.length > 0) {
        id = data.pvpFightEntities[data.pvpFightEntities.length - 1].id;
      } else {
        fetchMore = false;
      }
    }
    return allData;
  }
  catch (error) {
    console.error(`Error fetching pvp fights for subgraph url ${getSubgraphUrl()}: ${error}`);
    return [];
  }
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