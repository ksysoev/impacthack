const fs = require('fs');
const redis = require('ioredis');
const csv = require('csv-parser');

// Define the Redis client
const client = redis.createClient();

// Define the filename for the CSV file
const filename = 'POI.csv';

// Read the CSV file and populate Redis with the data
fs.createReadStream(filename)
  .pipe(csv())
  .on('data', async function(data) {
    // Convert the data to a Redis hash

    // Add the data to the Redis geospatial index    
    await client.geoadd('shops', data.longitude, data.latitude, data.google_id);

    //Saves shop details
    await client.hmset('shop:' + data.google_id, {
        shopName: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        rating: generate_random_rating(),
        reliability: generate_random_rating(),
        category: ,
    });

  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    // Quit the Redis client when done
    client.quit();
  });

function generate_random_rating() {
    return Math.ceil(Math.random() * 5);
}

let categories = [
    'Car Accessories',
    'Car Parts',
    'Tuner',
    'Service/Repair',
    'Car Wash'
];
function generate_random_category() {
    return Math.ceil(Math.random() * 5);
}