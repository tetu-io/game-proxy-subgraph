import { DocumentNode, gql } from '@apollo/client/core';


export function getHeroActionsQuery(): DocumentNode {
  return gql`
        query HeroActionsByType($id: ID!, $actions: [Int!]!) {
            heroActions(
                where: {
                    id_gt: $id
                    action_in: $actions
                }
                orderBy: id,
                orderDirection: asc,
            ){
                id
                action
                owner {
                    id
                }
            }
        }
  `;
}
