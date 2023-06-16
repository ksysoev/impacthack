const fs = require('fs');
const redis = require('ioredis');
const csv = require('csv-parser');

// Define the Redis client
const client = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Define the filename for the CSV file
const filename = 'POI.csv';

let categories = [
    'Car Accessories',
    'Car Parts',
    'Tuner',
    'Service/Repair',
    'Car Wash'
];

const prductsConfig = fs.readFileSync('products.json', 'utf8');
const products  = JSON.parse(prductsConfig);
const productCategories = Object.keys(products);
// Read the CSV file and populate Redis with the data


(async function () {
    await client.sadd('categories', ...categories);
    let all_data = [];
    fs.createReadStream(filename)
    .pipe(csv())
    .on('data', async function(data) {
        all_data.push(data);    
    })
    .on('end', async () => {
        for (let i = 0; i < all_data.length; i++) {
            let data = all_data[i];

            await client.geoadd('shops', data.longitude, data.latitude, data.google_id);
            
            let photos = []
            if (data.photo) {
                photos.push(data.photo);
            }

            if (data.street_view) {
                photos.push(data.street_view);
            }

            //Saves shop details

            let products = generate_random_products();
            await client.hmset('shop:' + data.google_id, {
                shopName: data.name,
                latitude: data.latitude,
                longitude: data.longitude,
                photos: JSON.stringify(photos),
                address: data.full_address,
                working_hours: data.working_hours,
                products: JSON.stringify(products),
                phone: data.phone,
                logo: data.logo,
                rating: generate_random_rating(),
                reliability: generate_random_rating(),
                category: generate_random_category(),
            });

            //Saves shop products
            await client.hmset('shop:' + data.google_id + ':products', products);
            await client.zadd('shopNames', 0, data.name.toLowerCase());
        }
        client.quit();
    });
})()

function generate_random_rating() {
    return Math.ceil(Math.random() * 3 + 2);
}

function generate_random_category() {
    return categories[Math.floor(Math.random() * categories.length)];
}

function generate_random_products() {
    const productCount = Math.ceil(Math.random() * 10 + 5);
    const randomProducts = {};
    for (let i = 0; i < productCount; i++) {
        const randomCategory = productCategories[Math.floor(Math.random() * productCategories.length)]
        const randomProduct = products[randomCategory][Math.floor(Math.random() * products[randomCategory].length)];
        randomProducts[randomProduct] = randomCategory;
    }
    return randomProducts;
} 