const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(require('cors')());
app.use(require('compression')());

// Кеширование
let cache = null;
let lastUpdate = 0;
const CACHE_TIME = 15000;

app.get('/api/matchdata', async (req, res) => {
  try {
    if (cache && Date.now() - lastUpdate < CACHE_TIME) {
      return res.json(cache);
    }

    const { data } = await axios.get('https://iservice.fckrasnodar.ru/v10/matches/index/format/json/?teamId=22982&langId=1', {
      timeout: 4000
    });

    cache = data;
    lastUpdate = Date.now();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Service unavailable' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
