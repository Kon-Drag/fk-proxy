const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;
const MATCHES_URL = 'https://iservice.fckrasnodar.ru/v10/matches/index/format/json/?langId=1';

app.use(cors());

app.get('/api/matchdata', async (req, res) => {
  try {
    const response = await fetch(MATCHES_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Прокси ошибка:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки данных' });
  }
});

app.listen(PORT, () => {
  console.log(`Прокси-сервер запущен: http://localhost:${PORT}/api/matchdata`);
});

app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=10'); // Кеширование 10 сек
  next();
});
