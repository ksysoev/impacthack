const Redis = require('ioredis');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.APP_PORT || 8000;
const redis_uri = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redis_uri);

app.use(bodyParser.json());

app.post('/shops', async (req, res) => {
  try {
    const { shopId, shopName, latitude, longitude, products } = req.body;

    await redisClient.geoadd('shops', longitude, latitude, shopId);

    const shopDetails = {
      name: shopName,
      latitude,
      longitude,
      products: JSON.stringify(products),
    };
    await redisClient.hset(`shop:${shopId}`, shopDetails);

    const categories = products.map((product) => product.category);
    await redisClient.sadd('categories', ...categories);

    res.status(201).json({ message: 'Shop registered successfully' });
  } catch (error) {
    console.error('Error registering shop:', error);
    res.status(500).json({ error: 'Failed to register shop' });
  }
});

app.get('/search/:productName', async (req, res) => {
  try {
    const { productName, carModel, category } = req.params;
    const { minRating, minReliability } = req.query;

    const shopIds = await redisClient.zrangebyscore('shops', '-inf', '+inf');

    const productPromises = shopIds.map(async (shopId) => {
      const shopName = await redisClient.hget(`shop:${shopId}`, 'name');
      const productsJSON = await redisClient.hget(`shop:${shopId}`, 'products');
      const rating = await redisClient.hget(`shop:${shopId}`, 'rating');
      const reliability = await redisClient.hget(`shop:${shopId}`, 'reliability');
      const shopCategory = await redisClient.hget(`shop:${shopId}`, 'category');

      const products = JSON.parse(productsJSON);

      const matchingProducts = products.filter((product) =>
        typeof product === 'string' && product.toLowerCase().includes(productName.toLowerCase())
      );

      if (
        matchingProducts.length > 0 &&
        (!minRating || rating >= minRating) &&
        (!minReliability || reliability >= minReliability) &&
        (!carModel || shopCategory.toLowerCase() === carModel.toLowerCase()) &&
        (!category || shopCategory.toLowerCase() === category.toLowerCase())
      ) {
        const geoposResponse = await redisClient.geopos('shops', shopId);
        const [longitude, latitude] = geoposResponse[0] || [];

        return {
          shopId,
          shopName,
          location: { latitude: latitude || 0, longitude: longitude || 0 },
          products: matchingProducts,
          rating: rating || 0,
          reliability: reliability || 0,
          category: shopCategory || '',
        };
      } else {
        return null;
      }
    });

    const results = await Promise.all(productPromises);
    const matchingShops = results.filter((result) => result !== null);

    res.status(200).json({ matchingShops });
  } catch (error) {
    console.error('Error searching for shops:', error);
    res.status(500).json({ error: 'Failed to search for shops' });
  }
});

app.get('/shop/:shopId/categories', async (req, res) => {
  try {
    const { shopId } = req.params;
    const productCategories = await redisClient.hgetall(`shop:${shopId}:products`);

    res.status(200).json({ productCategories });
  } catch (error) {
    console.error('Error retrieving product categories:', error);
    res.status(500).json({ error: 'Failed to retrieve product categories' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await redisClient.smembers('categories');

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.get('/shops/range/:latitude/:longitude/:radius', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.params;
    const shopIds = await redisClient.georadius('shops', longitude, latitude, radius, 'km', 'WITHDIST');
    const shops = [];

    for (const [shopId, distance] of shopIds) {
      const shopName = await redisClient.hget(`shop:${shopId}`, 'name');
      const productsJSON = await redisClient.hget(`shop:${shopId}`, 'products');
      const rating = await redisClient.hget(`shop:${shopId}`, 'rating');
      const reliability = await redisClient.hget(`shop:${shopId}`, 'reliability');
      const shopCategory = await redisClient.hget(`shop:${shopId}`, 'category');

      const products = JSON.parse(productsJSON);

      shops.push({
        shopId,
        shopName,
        location: { latitude: Number(latitude), longitude: Number(longitude) },
        products,
        rating: rating || 0,
        reliability: reliability || 0,
        category: shopCategory || '',
        distance: Number(distance),
      });
    }

    res.status(200).json({ shops });
  } catch (error) {
    console.error('Error retrieving shops within range:', error);
    res.status(500).json({ error: 'Failed to retrieve shops within range' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
