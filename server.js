import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = 'https://v3.football.api-sports.io';

if (!API_KEY) {
  console.error('❌ API_FOOTBALL_KEY environment variable is required');
  console.log('Please set API_FOOTBALL_KEY in your .env file');
  process.exit(1);
}

app.use(cors());

app.get('/api/players', async (req, res) => {
  const { search, season = '2023' } = req.query;
  
  if (!search) {
    return res.status(400).json({ error: 'Search parameter is required' });
  }

  const url = `${API_BASE}/players?search=${encodeURIComponent(search)}&season=${season}`;
  
  try {
    const response = await fetch(url, {
      headers: { 
        'x-apisports-key': API_KEY,
        'User-Agent': 'Ballon-dOr-2025-App'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('API Football error:', err.message);
    res.status(500).json({ 
      error: 'API Football error', 
      details: err.message,
      fallback: 'Using mock data'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Football API Proxy running on http://localhost:${PORT}`);
  console.log(`✅ API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
});