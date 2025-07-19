import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const API_KEY = 'abf38b7caa9a0897743e7f59ca1029fd';
const API_BASE = 'https://v3.football.api-sports.io';

app.use(cors());

app.get('/api/players', async (req, res) => {
  const { search, season = '2023' } = req.query;
  const url = `${API_BASE}/players?search=${encodeURIComponent(search)}&season=${season}`;
  try {
    const response = await fetch(url, {
      headers: { 'x-apisports-key': API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'API Football error', details: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001')); 