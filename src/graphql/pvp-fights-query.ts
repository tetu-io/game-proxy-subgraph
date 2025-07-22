import { DocumentNode, gql } from '@apollo/client/core';


export function getPvpFightsQuery(): DocumentNode {
  return gql`
      query PvpFights($id: ID!) {
          pvpFightEntities(
              where: {
                  id_gt: $id
                  completed: true
              }
              orderBy: id,
              orderDirection: asc,
          ){
              id
              isWinnerA
              userA {
                  id
              }
              userB {
                  id
              }
          }
      }
  `;
}
