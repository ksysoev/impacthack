const Redis = require("ioredis");
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());


const port = process.env.APP_PORT;
const redis_uri = process.env.REDIS_URL;
const jwt_secret = process.env.JWT_SECRET || 'KJmCuDI5LaNMcT1cCKVGDg5KFGp6roh5';
const jwt_expiry = process.env.JWT_EXPIRY || '3600';

const client = new Redis(redis_uri);
client.on('error', err => console.log('Redis Client Error', err));

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = generateUserId();
    await client.hmset(`user:${userId}`, 'username', username, 'password', password);
    res.status(200).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = await getUserId(username);
    if (userId) {
      const accessToken = jwt.sign({ userId }, jwt_secret, { expiresIn: jwt_expiry });
      await client.set(`access_token:${userId}`, accessToken, 'EX', jwt_expiry);
      res.status(200).json({ accessToken });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function generateUserId() {
  return Math.random().toString(36).substring(2, 10);
}

async function getUserId(username) {
  const keys = await client.keys('user:*');
  for (const key of keys) {
    const user = await client.hgetall(key);
    if (user.username === username) {
      const [, userId] = key.split(':');
      return userId;
    }
  }
  return null;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
