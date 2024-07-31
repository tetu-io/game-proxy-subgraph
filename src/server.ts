import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PawnshopPositionEntity } from '../generated/gql';
import { logSystemResources } from './utils/monitoring.utils';
import { getPawnshopPositionsTask } from './tasks/pawnshop.task';

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

let pawnshopPositionCache: PawnshopPositionEntity[] = [];

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



setInterval(async () => {
  pawnshopPositionCache = await getPawnshopPositionsTask();
}, 60000);

// check system resources every 30 seconds
setInterval(logSystemResources, 30000);

app.listen(port, async () => {
  console.log(`Server is running on ${port} port`);
  pawnshopPositionCache = await getPawnshopPositionsTask();

});