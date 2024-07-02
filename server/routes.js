const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('./db');  // Ensure db.js is correctly configured
const logger = require('./logger');

// Endpoint to fetch all items
router.get('/all-items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_posts', (err, results) => {
    if (err) {
      logger.error(`Error fetching all items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info('Fetched all items');
    res.json(results);
  });
});

// Endpoint to fetch limited items
router.get('/items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_posts LIMIT 4', (err, results) => {
    if (err) {
      logger.error(`Error fetching limited items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info('Fetched limited items');
    res.json(results);
  });
});

// Endpoint to fetch items for a specific user
router.get('/user-items', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }
  pool.query('SELECT * FROM tbl_123_posts WHERE userId = ?', [userId], (err, results) => {
    if (err) {
      logger.error(`Error fetching user items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Fetched items for user ${userId}`);
    res.json(results);
  });
});

// Endpoint to fetch a specific item by name
router.get('/items/:itemName', (req, res) => {
  const itemName = req.params.itemName;
  pool.query('SELECT * FROM tbl_123_posts WHERE itemName = ?', [itemName], (err, results) => {
    if (err) {
      logger.error(`Error fetching item by name: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0) {
      logger.info(`Fetched item: ${itemName}`);
      res.json(results[0]);
    } else {
      logger.warn(`Item not found: ${itemName}`);
      res.status(404).json({ error: 'Item not found' });
    }
  });
});

// Endpoint to add a new item
router.post('/items', (req, res) => {
  const newItem = req.body;
  logger.info(`Adding new item: ${JSON.stringify(newItem)}`);
  pool.query('INSERT INTO tbl_123_posts SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error adding new item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item added with ID: ${result.insertId}`);
    res.json({ id: result.insertId, ...newItem });
  });
});

// Endpoint to update an item
router.put('/items/:id', (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  logger.info(`Updating item ID ${itemId}: ${JSON.stringify(updatedItem)}`);
  pool.query('UPDATE tbl_123_posts SET ? WHERE id = ?', [updatedItem, itemId], (err) => {
    if (err) {
      logger.error(`Error updating item ID ${itemId}: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item ID ${itemId} updated`);
    res.json({ success: true });
  });
});

// Endpoint to delete an item and its image
router.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;
  pool.query('DELETE FROM tbl_123_posts WHERE id = ?', [itemId], (err) => {
    if (err) {
      logger.error(`Error deleting item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item ID ${itemId} deleted`);
    res.json({ success: true });
  });
});

// Serve the profileGraph.json file
router.get('/profile-graph-data', (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'profileGraph.json');
  res.sendFile(filePath, (err) => {
    if (err) {
      logger.error(`Error serving profileGraph.json: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

// Serve the homeGraph.json file
router.get('/home-graph-data', (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'homeGraph.json');
  res.sendFile(filePath, (err) => {
    if (err) {
      logger.error(`Error serving homeGraph.json: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

module.exports = router;
