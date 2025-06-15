/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { z } from 'zod';

// --- SETUP ---
const app = express();
const PORT = 3001;

// --- ZOD Schemas ---
const WeatherSummarySchema = z.object({
    temp: z.number(),
    description: z.string(),
    icon: z.string(),
    humidity: z.number(),
});

const PlotSchema = z.object({
  id: z.number(),
  name: z.string(),
  wateringInterval: z.number(),
  nextWateringTime: z.number(),
  plantIds: z.array(z.number()).optional(),
});
const PlotsSchema = z.array(PlotSchema);


const PlantSchema = z.object({
    id: z.number(),
    plotId: z.number(),
    name: z.string(),
    icon: z.string(),
    datePlanted: z.string().datetime(),
    status: z.string().optional(),
    isRemoved: z.boolean(),
    wateringHistory: z.array(z.object({
        timestamp: z.string().datetime(),
        weather: WeatherSummarySchema.optional(), 
    })).optional(),
    harvests: z.array(z.object({
        date: z.string().datetime().optional(),
        timestamp: z.string().datetime().optional(),
        quantity: z.string().optional(),
        action: z.string().optional(),
        weather: WeatherSummarySchema.optional(), 
    })),
    // ADDED: AI-driven fields
    estimatedDaysToMaturity: z.number().optional(),
    estimatedHarvestDate: z.string().datetime().optional(),
});
const PlantsSchema = z.array(PlantSchema);


const createDb = (filename, defaultData = []) => {
    const adapter = new JSONFile(path.resolve(filename));
    return new Low(adapter, defaultData);
};

const plotsDb = createDb('./plots.json', []);
const plantsDb = createDb('./plants.json', []);

app.use(cors());
app.use(express.json());

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
        message: 'Invalid data format.',
        errors: error.errors
    });
  }
};


app.get('/api/plots', async (req, res) => {
  try {
    await plotsDb.read();
    res.json(plotsDb.data);
  } catch (error) {
    res.status(500).json({ message: 'Error reading plots data' });
  }
});

app.post('/api/plots', validate(PlotsSchema), async (req, res) => {
  try {
    plotsDb.data = req.body;
    await plotsDb.write();
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving plots data' });
  }
});


app.get('/api/plants', async (req, res) => {
    try {
        await plantsDb.read();
        res.json(plantsDb.data);
    } catch (error) {
        res.status(500).json({ message: 'Error reading plants data' });
    }
});

app.post('/api/plants', validate(PlantsSchema), async (req, res) => {
    try {
        plantsDb.data = req.body;
        await plantsDb.write();
        res.status(200).json({ message: 'Plants data saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving plants data' });
    }
});

app.post('/api/ai/plant-info', async (req, res) => {
  const { plantName } = req.body;

  if (!plantName) {
    return res.status(400).json({ message: 'plantName is required' });
  }

  console.log(`AI endpoint received request for: ${plantName}`);
  let days = null;
  const lowerCaseName = plantName.toLowerCase();

  if (lowerCaseName.includes('basil')) {
    days = 70;
  } else if (lowerCaseName.includes('tomato')) {
    days = 60;
  } else if (lowerCaseName.includes('pepper')) {
    days = 75;
  }

  if (days) {
    res.json({ estimatedDaysToMaturity: days });
  } else {
    res.status(404).json({ message: 'Could not find information for this plant.' });
  }
});



app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});