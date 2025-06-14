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

// --- ZOD Schemas (No changes here) ---
const PlotSchema = z.object({
  id: z.number(),
  name: z.string(),
  wateringInterval: z.number(),
  nextWateringTime: z.number(),
});
const PlotsSchema = z.array(PlotSchema);

const PlantSchema = z.object({
    id: z.number(),
    plotId: z.number(),
    name: z.string(),
    icon: z.string(),
    datePlanted: z.string().datetime(),
    isRemoved: z.boolean(),
    harvests: z.array(z.object({
        date: z.string().datetime(),
        quantity: z.string()
    }))
});
const PlantsSchema = z.array(PlantSchema);


const LogEntrySchema = z.object({
  id: z.number(),
  plotName: z.string(),
  timestamp: z.string().datetime(),
  status: z.string().optional(),
  timeDifference: z.number().optional(),
  weather: z.any().optional(),
});
const LogSchema = z.array(LogEntrySchema);

const HarvestLogEntrySchema = z.object({
    id: z.number(),
    plotName: z.string(),
    plantName: z.string(),
    timestamp: z.string().datetime(),
    quantity: z.string().optional(),
    action: z.string().optional(),
    weather: z.any().optional(),
});
const HarvestLogSchema = z.array(HarvestLogEntrySchema);

// --- lowdb Setup (No changes from previous attempt, this part was correct) ---
const createDb = (filename, defaultData = []) => {
    const adapter = new JSONFile(path.resolve(filename));
    return new Low(adapter, defaultData);
};

const plotsDb = createDb('./plots.json', []);
const wateringLogDb = createDb('./log.json', []);
const harvestLogDb = createDb('./harvest_log.json', []);
const plantsDb = createDb('./plants.json', []);


// --- Middlewares ---
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


// --- API Routes (No changes here) ---

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

app.get('/api/log', async (req, res) => {
  try {
    await wateringLogDb.read();
    res.json(wateringLogDb.data);
  } catch (error) {
    res.status(500).json({ message: 'Error reading watering log' });
  }
});

app.post('/api/log', validate(LogSchema), async (req, res) => {
  try {
    wateringLogDb.data = req.body;
    await wateringLogDb.write();
    res.status(200).json({ message: 'Log saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving watering log' });
  }
});


app.get('/api/harvest_log', async (req, res) => {
    try {
        await harvestLogDb.read();
        res.json(harvestLogDb.data);
    } catch (error) {
        res.status(500).json({ message: 'Error reading harvest log' });
    }
});

app.post('/api/harvest_log', validate(HarvestLogSchema), async (req, res) => {
    try {
        harvestLogDb.data = req.body;
        await harvestLogDb.write();
        res.status(200).json({ message: 'Harvest log saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving harvest log' });
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


app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});