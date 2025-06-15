/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { z } from 'zod';
import { fileURLToPath } from 'url'

// --- SETUP ---
const app = express();
const PORT = 3001;
const AI_API_URL = 'http://192.168.2.171:8000/ask';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  soilType: z.string().optional(),
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
    notes: z.array(z.string()).optional(),
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
const aiCache = new Map();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

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

app.post('/api/ai/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'A "question" is required in the request body.' });
    }

    if (aiCache.has(question)) {
        console.log(`[Cache HIT] Returning cached response for: "${question}"`);
        return res.json({ answer: aiCache.get(question) });
    }

    console.log(`[Cache MISS] Asking AI: "${question}"`);
    try {
        const aiResponse = await fetch(AI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });

        if (!aiResponse.ok) {
            throw new Error(`AI service responded with status: ${aiResponse.status}`);
        }

        const answer = await aiResponse.text();
        aiCache.set(question, answer); 
        res.json({ answer });

    } catch (error) {
        console.error('Error contacting AI service:', error);
        res.status(503).json({ message: 'Failed to contact the AI service.' });
    }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});


