import { DocumentNode, gql } from '@apollo/client/core';


export function getTransactionsFromQuery(): DocumentNode {
  return gql`
        query TransactionsFrom($timestamp: BigInt!, $first: Int!, $skip: Int!) {
            transactionEntities(
                where: {
                    timestamp_gte: $timestamp
                }
                first: $first,
                skip: $skip,
                orderBy: timestamp
                orderDirection: desc
            ){
                from
                gasUsed
                gasPrice
                timestamp
            }
        }
  `;
}
