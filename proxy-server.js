const express = require('express');
const axios = require('axios');
const compression = require('compression');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;
const SOURCE_API = 'https://iservice.fckrasnodar.ru/v10/matches/index/format/json/?teamId=22982&langId=1';

// Оптимизации
app.use(compression());
app.use(cors());
app.disable('x-powered-by');

// Кеширование
let cache = null;
let lastUpdate = 0;
const CACHE_TIME = 15000; // 15 секунд

// Ускоренный эндпоинт
app.get('/api/matchdata', async (req, res) => {
  try {
    // Отдаем кеш, если он актуален
    if (cache && Date.now() - lastUpdate < CACHE_TIME) {
      return res.json(cache);
    }

    // Быстрый запрос с таймаутом
    const { data } = await axios.get(SOURCE_API, { 
      timeout: 4000,
      headers: {
        'Accept-Encoding': 'gzip'
      }
    });

    // Обновляем кеш
    cache = data;
    lastUpdate = Date.now();
    
    res.json(data);
  } catch (error) {
    console.error('[PROXY ERROR]', error.message);
    res.status(500).json({ error: 'Service temporary unavailable' });
  }
});

// Health-check для Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Optimized proxy running on port ${PORT}`);
});
