import { DocumentNode, gql } from '@apollo/client/core';


export function getItemUsedQuery(): DocumentNode {
  return gql`
      query ItemUsed($id: ID!) {
          itemUsedEntities(
              where: {
                  id_gt: $id
              }
              orderBy: id,
              orderDirection: asc,
          ){
              id
              item {
                  meta {
                      name
                  }
              }
              user {
                  id
              }
          }
      }
  `;
}
