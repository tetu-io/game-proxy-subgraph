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
                orderBy: timestamp,
                orderDirection: asc,
                orderBy2: id,         
                orderDirection2: desc
            ){
                id
                from
                gasUsed
                gasPrice
                timestamp
            }
        }
  `;
}
