const Redis = require('ioredis');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.APP_PORT || 8000;
const redis_uri = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redis_uri);

// Enabling CORS
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next();
});
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to parse JSON safely
function safeParseJSON(jsonString) {
    if (!jsonString) {
      return;
    }

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error, jsonString);
        return;
    }
}

// Fetch all shops
app.get('/shops', async (req, res) => {
  try {
    const shopIds = await redisClient.zrangebyscore('shops', '-inf', '+inf');
    const shops = [];

    for (const shopId of shopIds) {
      let shopDetails = await redisClient.hgetall(`shop:${shopId}`);
      shops.push(parseShop(shopDetails));
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
    const { shopId, shopName, latitude, longitude, products, telegramUsername, chatId, posts } = req.body;

    await redisClient.geoadd('shops', longitude, latitude, shopId);

    const shopDetails = {
      name: shopName,
      latitude,
      longitude,
      products: JSON.stringify(products),
      telegramUsername, // Add the Telegram username to the shop details
      chatId,
      posts
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

// The search function is an controller that searches for shops based on the specified search criteria.

// Request
// The search function expects a GET request with the following query parameters:

// latitude (required): The latitude of the user's location.
// longitude (required): The longitude of the user's location.
// radius (optional): The search radius in kilometers (default is 10km).
// category (optional): The category of the shops to search for.
// name (optional): The name of the shops to search for.
// sortby (optional): The field to sort the search results by, possible values distance, rating, reliability (default is distance).
// pay_by_card (optional): Whether the shop accepts card payments.
// product (optional): The product to search for.
// brand (optional): The brand to search for.

// Response
// The search function returns a JSON response with the following properties:

// shops: An array of shop objects that match the search criteria.

const sorters = {
    'distance': (a, b) => a.distance - b.distance,
    'rating': (a, b) => b.shop.rating - a.shop.rating,
    'reliability': (a, b) => b.shop.reliability - a.shop.reliability,
};

app.get('/search', async (req, res) => {
  try {
    let { latitude, longitude , radius, category, name, sortby, pay_by_card, product, brand } = req.query;

	if (!latitude || !longitude) { 
		res.status(400).json({ error: 'Missing latitude and/or longitude' });
		return;
	}

	radius = radius || 10; //default radius is 10km

    sortby = sortby || 'distance';

    if (!sorters[sortby]) {
        res.status(400).json({ error: 'Invalid sortby parameter' });
        return;
    }

    const shopIds = await redisClient.georadius('shops', longitude, latitude, radius, 'km', 'WITHDIST');

    const productPromises = shopIds.map(async ([shopId, distance]) => {
        const shop = parseShop(await redisClient.hgetall(`shop:${shopId}`));
        
        // Filter by Pay by Card
        if (pay_by_card && !shop.pay_by_card) {
            return null;
        }

         // Filter by Product
         if (product && !shop.products[product]) {
            return null;
        }

        // Filter by Shop category and name
        if (category && category.toLowerCase() !== shop.category.toLowerCase()) {
            return null;
        }

        // Filter by Brand
        if (brand && !shop.brands.some(b => b.toLowerCase() === brand.toLowerCase())) {
            return null;
        }

        // Filter by Shop name
        if (name && !name.split(' ').every(word => searchString.toLowerCase().includes(word.toLowerCase()))) {
            return null;
        }
	
        return { shop, distance };
    });

    const results = (await Promise.all(productPromises)).filter((result) => result !== null);

    results.sort(sorters[sortby]).map((result) => result.shop);

    res.status(200).json({ shops: results });
  } catch (error) {
    console.error('Error searching for shops:', error);
    res.status(500).json({ error: 'Failed to search for shops' });
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
          locatios: { latitude: latitude || 0, longitude: longitude || 0 },
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
	  let shop = await redisClient.hget(`shop:${shopId}`);
	  if (!shop) {
		continue;
	  }
      shops.push(parseShop(shop));
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

// Helper functions

function parseShop(rawShop) {
	rawShop.photos = safeParseJSON(rawShop.photos) || [];
	rawShop.products = safeParseJSON(rawShop.products) || {};
	rawShop.working_hours = safeParseJSON(rawShop.working_hours) || {};
    rawShop.brands = safeParseJSON(rawShop.brands) || [];
	return rawShop;
}
