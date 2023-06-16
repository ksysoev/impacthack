const Redis = require('ioredis');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.APP_PORT || 8000;
const redis_uri = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redis_uri);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to parse JSON safely
function safeParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
}

// Fetch all shops
app.get('/shops', async (req, res) => {
  try {
    const shopIds = await redisClient.zrangebyscore('shops', '-inf', '+inf');
    const shops = [];

    for (const shopId of shopIds) {
      const shopDetails = await redisClient.hgetall(`shop:${shopId}`);
      shopDetails.products = safeParseJSON(shopDetails.products);
      shops.push(shopDetails);
    }

    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching shop data:', error);
    res.status(500).json({ error: 'Failed to fetch shop data' });
  }
});

// Register a new shop
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

    await redisClient.zadd('shopNames', 0, shopName.toLowerCase());

    const categories = [...new Set(products.map((product) => product.category))];
    for (const category of categories) {
      await redisClient.sadd('categories', category);
      await redisClient.sadd(`shop:${shopId}:categories`, category);
    }

    res.status(201).json({ message: 'Shop registered successfully' });
  } catch (error) {
    console.error('Error registering shop:', error);
    res.status(500).json({ error: 'Failed to register shop' });
  }
});

// Search shops by product name
app.get('/search/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const { carModel, category, minRating, minReliability } = req.query;

    const shopIds = await redisClient.zrangebyscore('shops', '-inf', '+inf');

    const productPromises = shopIds.map(async (shopId) => {
      const shopName = await redisClient.hget(`shop:${shopId}`, 'name');
      const productsJSON = await redisClient.hget(`shop:${shopId}`, 'products');
      const rating = await redisClient.hget(`shop:${shopId}`, 'rating');
      const reliability = await redisClient.hget(`shop:${shopId}`, 'reliability');
      const shopCategories = await redisClient.smembers(`shop:${shopId}:categories`);

      const products = safeParseJSON(productsJSON) || [];

      const matchingProducts = products.filter((product) =>
        typeof product === 'object' &&
        product.name.toLowerCase().includes(productName.toLowerCase())
      );

      if (
        matchingProducts.length > 0 &&
        (!minRating || rating >= minRating) &&
        (!minReliability || reliability >= minReliability) &&
        (!carModel || shopCategories.includes(carModel.toLowerCase())) &&
        (!category || shopCategories.includes(category.toLowerCase()))
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
          categories: shopCategories,
        };
      } else {
        return null;
      }
    });

    const results = await Promise.all(productPromises);
    const matchingShops = results.filter((result) => result !== null);

    // autocomplete
    const autoCompleteResults = [...new Set(results.flatMap((result) => result?.products?.map((p) => p.name)))];

    res.status(200).json({ matchingShops, autoCompleteResults });
  } catch (error) {
    console.error('Error searching for shops:', error);
    res.status(500).json({ error: 'Failed to search for shops' });
  }
});

// Get categories for a shop
app.get('/shop/:shopId/categories', async (req, res) => {
  try {
    const { shopId } = req.params;
    const categories = await redisClient.smembers(`shop:${shopId}:categories`);

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// Get all categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await redisClient.smembers('categories');

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// Get shops within a certain range
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
      const shopCategories = await redisClient.smembers(`shop:${shopId}:categories`);

      const products = safeParseJSON(productsJSON) || [];

      shops.push({
        shopId,
        shopName,
        location: { latitude: Number(latitude), longitude: Number(longitude) },
        products,
        rating: rating || 0,
        reliability: reliability || 0,
        categories: shopCategories,
        distance: Number(distance),
      });
    }

    res.status(200).json({ shops });
  } catch (error) {
    console.error('Error retrieving shops within range:', error);
    res.status(500).json({ error: 'Failed to retrieve shops within range' });
  }
});

// Serve the home page
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
