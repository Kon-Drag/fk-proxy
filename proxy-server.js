const CACHE_TTL = 15000; // 15 секунд кеширования
let cache = null;
let lastUpdate = 0;

app.use(compression());
app.use(cors({
  origin: ['https://cityscreen.cloud', 'http://localhost'] // Укажите нужные origin
}));

app.get('/api/matchdata', async (req, res) => {
  try {
    // Отдаём кеш если он актуален
    if (cache && Date.now() - lastUpdate < CACHE_TTL) {
      res.set('X-Cache-Status', 'HIT');
      return res.json(cache);
    }

    // Запрос к API с таймаутом
    const { data } = await axios.get('https://iservice.fckrasnodar.ru/v10/matches/index/format/json/?teamId=22982&langId=1', {
      timeout: 5000,
      headers: {
        'Accept-Encoding': 'gzip'
      }
    });

    // Обновляем кеш
    cache = data;
    lastUpdate = Date.now();
    res.set('X-Cache-Status', 'MISS');
    res.json(data);

  } catch (error) {
    console.error('[PROXY ERROR]', error.message);
    
    // Отдаём кеш даже если он устарел
    if (cache) {
      res.set('X-Cache-Status', 'STALE');
      res.json(cache);
    } else {
      res.status(500).json({ error: 'Service unavailable' });
    }
  }
});
