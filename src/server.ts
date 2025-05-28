import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { logSystemResources } from './utils/monitoring.utils';
import { getPawnshopPositionsTask } from './tasks/pawnshop.task';
import { PawnshopPositionEntity, TransactionEntity } from '../gql/gql';
import { getTransactionsTask } from './tasks/transactions.task';
import { formatTransactions } from './service/transactions.service';

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const PAWNSHOP_INTERVAL = +(process.env.PAWNSHOP_INTERVAL || 60000);
// default every 1 hour
const TRANSACTION_INTERVAL = +(process.env.TRANSACTION_INTERVAL || 3600000);

let pawnshopPositionCache: PawnshopPositionEntity[] = [];
let transactionsCache: TransactionEntity[] = [];
let transactionsFormattedCache: Record<number, Record<string, string>> = {};

app.get('/pawnshop-positions', (req: Request, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const first = parseInt(req.query.first as string) || 10000;
    const paginatedData = pawnshopPositionCache.slice(skip, skip + first);
    res.send(paginatedData);
  } catch (error) {
    console.error('Failed to get data:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/transactions', (req: Request, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const first = parseInt(req.query.first as string) || 10000;
    const paginatedData = transactionsCache.slice(skip, skip + first);
    res.send(paginatedData);
  } catch (error) {
    console.error('Failed to get data:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/transactions-formatted', (req: Request, res: Response) => {
  try {
    res.send(transactionsFormattedCache);
  } catch (error) {
    console.error('Failed to get data:', error);
    res.status(500).send('Internal server error');
  }
});


async function processPawnshopPositions() {
  while (true) {
    try {
      pawnshopPositionCache = await getPawnshopPositionsTask();
    } catch (error) {
      console.error('Error during fetch pawnshop items:', error);
    }
    await new Promise(resolve => setTimeout(resolve, PAWNSHOP_INTERVAL));
  }
}

async function processTransactions(): Promise<void> {
  while (true) {
    try {
      const lastTimestamp = getLastTransactionTimestamp(transactionsCache);
      const newTransactions = await getTransactionsTask(lastTimestamp);

      const existingIds = new Set(transactionsCache.map(tx => tx.id));

      const uniqueNewTransactions = newTransactions.filter(tx => !existingIds.has(tx.id));

      if (uniqueNewTransactions.length > 0) {
        transactionsCache = transactionsCache.concat(uniqueNewTransactions);
        transactionsFormattedCache = formatTransactions(transactionsCache);

        console.log(`Added ${uniqueNewTransactions.length} new transactions.`);
      } else {
        console.log('No new unique transactions found.');
      }
    } catch (error) {
      console.error('Error during fetch transactions:', error);
    }

    await delay(TRANSACTION_INTERVAL);
  }
}

function getLastTransactionTimestamp(transactions: TransactionEntity[]): string | undefined {
  if (!transactions.length) return undefined;

  const latest = transactions.reduce((max, tx) =>
    Number(tx?.timestamp || 0) > Number(max?.timestamp || 0) ? tx : max
  );

  return latest?.timestamp || '0';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// check system resources every 30 seconds
setInterval(logSystemResources, 30000);

app.listen(port, async () => {
  console.log(`Server is running on ${port} port`);
  pawnshopPositionCache = await getPawnshopPositionsTask();
  processPawnshopPositions();
  transactionsCache = await getTransactionsTask();
  transactionsFormattedCache = formatTransactions(transactionsCache);
  processTransactions();
});