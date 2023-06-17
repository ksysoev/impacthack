const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const Redis = require('ioredis');

const botToken = process.env.BOT_TOKEN;
const apiKeyGPT = process.env.GPT_TOKEN;
const redis_uri = process.env.REDIS_URL || 'redis://localhost:6379';

const bot = new TelegramBot(botToken, { polling: true });
const redisClient = new Redis(redis_uri);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text.toLowerCase();
    console.log(message);
    const shopId = 'YOUR_SHOP_ID'; //TODO get shopId
    const shopInformation = await redisClient.hgetall(`shop:${shopId}`);

    if (!shopInformation) {
        bot.sendMessage(chatId, 'Shop information not found');
        return;
    }

    const shopInformation = {"rating":"4","address":"18, Jalan 4/23b, Taman Danau Kota, 53300 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur","logo":"","latitude":"3.2081691","phone":"+60 16-244 1991","pay_by_card":"true","brands":["Alfa Romeo","Acura","Buick"],"products":{"Seats":"Interior and Exterior Components","Fuel Tank":"Fuel System Components","Sensors (Oxygen Sensor, Mass Air Flow Sensor, etc.)":"Electrical Components","Windows and Windshields":"Interior and Exterior Components","Switches":"Electrical Components","Exterior Trim":"Interior and Exterior Components","Brake Lines":"Braking System Components","Valves":"Engine Components","Brake Discs/Rotors":"Braking System Components","Steering Rack":"Suspension and Steering Components"},"photos":["https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w800-h500-k-no","https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w1600-h1000-k-no"],"reliability":"5","category":"Car Wash","longitude":"101.7180254","working_hours":{"Monday":"9:30 am-7:30 pm","Tuesday":"9:30 am-7:30 pm","Wednesday":"9:30 am-7:30 pm","Thursday":"9:30 am-7:30 pm","Friday":"9:30 am-7:30 pm","Saturday":"9:30 am-7:30 pm","Sunday":"9:30 am-7:30 pm"},"shopName":"Danau Air Cond & Accessories Auto Works"};
    resp =  await classifyMessage(message, shopInformation);

    const regex = /Category:\s*(\w+)/;
    const match = resp.match(regex);
    let reply = 'Sorry, I did not understand your message. Please try again.';
    if (match && match[1]) {
        const category = match[1].toLowerCase() || 'other';
        switch (category) {
            case 'show':
                reply = `Here you can see the information about the shop:\n ${printShopInformation(shopInformation)}`;
                break;
            case 'update':
                let resp = await parseResponse(message, shopInformation)
                if(!resp) {
                    reply = `Sorry, I did not understand your message. Please try again.`;
                    break;
                }
                redisClient.hmset(`shop:${shopId}`, resp, (err) => {
                    if (err) {
                        console.error('Error updating shop information in Redis:', err);
                    }
                });
                reply = `Thank you for your update. We updated the information for you. Here you can see the updated information: ${printShopInformation(resp)}`;
                break;
            case 'news':
                post = await generataPost(message, shopInformation);
                console.log(post);
                redisClient.hset(`shop:${shopId}`, 'post', post, (err, result) => {
                    if (err) {
                        console.error('Error storing post in Redis:', err);
                    }
                });
                reply = `Thank you for your news. We posted it on our website: ${post}`;
                break;
            case 'request':
                reply = `Thank you for your request. We will contact you as soon as possible.`;
                break;
            case 'greeting':
                reply = `Hello! How can I help you?`;
                break;
            case 'thanks':
                reply = `You are welcome!`;
                break;
            case 'other':
                reply = `Sorry, I did not understand your message. Please try again.`;
                break;
            default:
                reply = `Sorry, I did not understand your message. Please try again.`;
                break;
        }
    }

    bot.sendMessage(chatId, reply);
});

async function classifyMessage(response, currentStructure) {
    const message = `I want to to classify user input into one of the following categories:

    1. Update - Provide updated information for provided structure
    2. News - News about the shop, new products, new services, new promotions
    3. Request - Request for a service or help
    4. Greeting - Greeting
    5. Thanks - Client says thanks
    6. Show - Request to show information about the shop
    6. Other - Other
    
    Input:\n\n${response}

    Structure:\n\n${JSON.stringify(currentStructure)}`;

    const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
        messages: [{"role": "user", "content": message}],
        model: "gpt-3.5-turbo",
        max_tokens: 1024,
        n: 1,
        stop: '\n\n',
        temperature: 0.5,
    }, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyGPT}`,
        },
    });

    return data.choices[0].message.content;
}

async function parseResponse(response, currentStructure) {
    const message = `Parse the following response and add new information into existing structure. 
    you MUST use only existing fields from provided sturcture
    If new address was provided partially, you must use missed information from providede structure
    
    Response:\n\n${response}

    Structure:\n\n${JSON.stringify(currentStructure)}`;

    const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
        messages: [{"role": "user", "content": message}],
        model: "gpt-3.5-turbo",
        max_tokens: 1024,
        n: 1,
        stop: '\n\n',
        temperature: 0.5,
    }, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyGPT}`,
        },
    });

    const structuredResponse = data.choices[0].message.content;

    try {
        updatedStructure = JSON.parse(structuredResponse);
    } catch (error) {
        console.error('Error parsing JSON:', error, structuredResponse);
        return;
    }

    if (currentStructure.address !== updatedStructure.address) {
        const coordinates = await getCoordinates(updatedStructure.address);;
        if (coordinates) {
            updatedStructure.latitude = coordinates.latitude;
            updatedStructure.longitude = coordinates.longitude;
        }
    }

    return updatedStructure;
}

async function generataPost(initialMessage, currentStructure) {
    const message = `Parse the following client input and generate social media post from car workshop company. 
    also you can use information about the shop from provided structure if it's needed.
    
    Input:\n\n${initialMessage}

    Structure:\n\n${JSON.stringify(currentStructure)}`;

    const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
        messages: [{"role": "user", "content": message}],
        model: "gpt-3.5-turbo",
        max_tokens: 1024,
        n: 1,
        stop: '\n\n',
        temperature: 0.5,
    }, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyGPT}`,
        },
    });

    return data.choices[0].message.content;
}

async function getCoordinates(address) {
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}`;
    const { data } = await axios.get(url);

    if (!data.length || !data[0].geometry) {
        return
    }
  
    const { lat, lng } = data[0].geometry.location;
  
    return { latitude: lat, longitude: lng };
}

function printShopInformation(shop) {
    const { shopName, address, phoneNumber, website, working_hours, brands, pay_by_card } = shop;
    return `Shop name: ${shopName}
    Address: ${address}
    Phone number: ${phoneNumber || 'not provided'}
    Website: ${website || 'not provided'}
    Opening hours: ${working_hours}
    Brands: ${brands}
    Can pay with card: ${pay_by_card ? 'Yes' : 'No'}`;
}
