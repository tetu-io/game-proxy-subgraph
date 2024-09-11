import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client/core';
import { getPawnshopPositionsQuery } from './pawnshop-positions-query';
import { PawnshopPositionEntity } from '../../generated/gql';


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
      const { data } = await client.query({
        query: getPawnshopPositionsQuery(),
        variables: { skip },
      });

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