/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;
const DB_FILE = path.resolve('./plots.json');
const LOG_FILE = path.resolve('./log.json');
const HARVEST_LOG_FILE = path.resolve('./harvest_log.json');

app.use(cors());
app.use(express.json());

app.get('/api/plots', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: 'Error reading data' });
  }
});

app.post('/api/plots', async (req, res) => {
  try {
    const newPlots = req.body;
    await fs.writeFile(DB_FILE, JSON.stringify(newPlots, null, 2));
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving data' });
  }
});

app.get('/api/log', async (req, res) => {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf-8');
    if (!data) {
      return res.json([]);
    }
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Error reading log' });
  }
});

app.post('/api/log', async (req, res) => {
  try {
    const newLog = req.body;
    await fs.writeFile(LOG_FILE, JSON.stringify(newLog, null, 2));
    res.status(200).json({ message: 'Log saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving log' });
  }
});

app.get('/api/harvest_log', async (req, res) => {
  try {
    const data = await fs.readFile(HARVEST_LOG_FILE, 'utf-8');
    if (!data) {
      return res.json([]);
    }
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Error reading harvest log' });
  }
});

app.post('/api/harvest_log', async (req, res) => {
  try {
    const newLog = req.body;
    if (!Array.isArray(newLog)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
    }
    await fs.writeFile(HARVEST_LOG_FILE, JSON.stringify(newLog, null, 2));
    res.status(200).json({ message: 'Harvest log saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving harvest log' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});