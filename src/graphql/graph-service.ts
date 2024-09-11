import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client/core';
import { getPawnshopPositionsQuery } from './pawnshop-positions-query';
import { PawnshopPositionEntity } from '../../generated/gql';
import dotenv from 'dotenv';

dotenv.config();

const PAWNSHOP_FIRST = +(process.env.PAWNSHOP_FIRST || 1000);
const PAWNSHOP_MAX_RETRIES = +(process.env.PAWNSHOP_MAX_RETRIES || 10);

function getSubgraphUrl() {
  return process.env.SUBGRAPH_URL;
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
      console.error(`Attempt ${retries} failed: ${error}`);
      if (retries === PAWNSHOP_MAX_RETRIES) {
        throw new Error(`Failed to fetch data after ${PAWNSHOP_MAX_RETRIES} attempts`);
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
        skip += data.pawnshopPositionEntities.length;
      } else {
        fetchMore = false;
      }
      turn++;
    }
  } catch (error) {
    console.error(`Error fetching pawnshop positions for subgraph url ${getSubgraphUrl()}: ${error}`);
  }

  return allData;
}