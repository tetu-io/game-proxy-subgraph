import { DocumentNode, gql } from '@apollo/client/core';


export function getHeroDiedQuery(): DocumentNode {
  return gql`
      query HeroDied($id: ID!) {
          heroEntities(
              where: {
                  id_gt: $id
                  dead: true
              }
              orderBy: id,
              orderDirection: asc,
          ){
              id
              actions(
                  first: 1,
                  orderBy: id,
                  orderDirection: desc,
              ) {
                  owner {
                      id
                  }
              }
          }
      }
  `;
}
