import { TransactionEntity } from '../../gql/gql';
import { getEpochWeek } from '../utils/time.utils';

// 80% cashback
const CALCULATE_VALUE: bigint = BigInt(800);
const DIVIDER: bigint = BigInt(1000);

export function formatTransactions(transactions: TransactionEntity[]): Record<number, Record<string, string>> {
  const record: Record<number, Record<string, string>> = {};
  transactions.forEach((transaction) => {
    const week = getEpochWeek(Number(transaction.timestamp));
    const from = transaction.from?.toLowerCase() || '';
    if (!record[week]) {
      record[week] = {};
    }
    if (!record[week][from]) {
      record[week][from] = "0";
    }
    record[week][from] = (BigInt(record[week][from]) + (calculateGas(transaction) * CALCULATE_VALUE) / DIVIDER).toString();
  });
  return record;
}

function calculateGas(tx: TransactionEntity): bigint {
  return BigInt(tx.gasUsed || '0') * BigInt(tx.gasPrice || '0');
}