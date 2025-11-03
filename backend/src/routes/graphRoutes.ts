import express, { Request, Response, NextFunction } from 'express';
import * as graphService from '../services/graphService';

const router = express.Router();

// GET /api/graph - Return graph data (users + relationships)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const graphData = await graphService.getGraphData();
    res.json(graphData);
  } catch (error) {
    next(error);
  }
});

export default router;

