import { DocumentNode, gql } from '@apollo/client/core';


export function getItemActionsQuery(): DocumentNode {
  return gql`
        query ItemActionsByType($id: ID!, $actions: [Int!]!) {
            itemActionEntities(
                where: {
                    id_gt: $id
                    action_in: $actions
                }
                orderBy: id,
                orderDirection: asc,
            ){
                id
                action
                user {
                    id
                }
                values
            }
        }
  `;
}
