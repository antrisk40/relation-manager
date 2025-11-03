const express = require('express');
const graphService = require('../services/graphService');

const router = express.Router();

// GET /api/graph - Return graph data (users + relationships)
router.get('/', async (req, res, next) => {
  try {
    const graphData = await graphService.getGraphData();
    res.json(graphData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


