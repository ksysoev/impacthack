const Redis = require('ioredis');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());


const port = process.env.APP_PORT || 8000;
const redis_uri = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redis_uri);

app.use(bodyParser.json());

app.post('/shops', async (req, res) => {
  const { shopId, shopName, latitude, longitude, products } = req.body;
  await redisClient.geoadd('shops', longitude, latitude, shopId);
  await redisClient.hmset(`shop:${shopId}`, 'name', shopName, 'products', JSON.stringify(products));
  res.status(201).json({ message: 'Shop registered successfully' });
});

app.get('/search/:productName', async (req, res) => {
  const { productName } = req.params;

  // Search for shops near the specified product
  const shopIds = await redisClient.zrangebyscore('shops', '-inf', '+inf');
  const productPromises = shopIds.map(async (shopId) => {
    const [shopName, productsJSON] = await redisClient.hmget(`shop:${shopId}`, 'name', 'products');
    const products = JSON.parse(productsJSON);

    // Exists
    const matchingProducts = products.filter((product) =>
      product.toLowerCase().includes(productName.toLowerCase())
    );

    if (matchingProducts.length > 0) {
      const geoposResponse = await redisClient.geopos('shops', shopId);
      const [longitude, latitude] = geoposResponse[0] || []; // undefined

      return {
        shopId,
        shopName,
        location: { latitude: latitude || 0, longitude: longitude || 0 },
        products: matchingProducts,
      };
    } else {
      return null;
    }
  });

  const results = await Promise.all(productPromises);
  const matchingShops = results.filter((result) => result !== null);

  res.status(200).json({ matchingShops });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
