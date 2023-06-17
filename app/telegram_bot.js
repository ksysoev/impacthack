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
    telegram_username = msg.from.username;

    let shopId;
    try {
        shopId = await redisClient.hget('shop::owner', telegram_username);
    } catch (error) {
        console.error('Error getting shop ID from Redis:', error);
        bot.sendMessage(chatId, 'An error occurred. Please try again later.');
        return;
    }

    if (!shopId) {
        bot.sendMessage(chatId, 'Sorry, we could not find your shop. Please register your shop first.');
        return;
    }

    let shopInformation;
    try {
        shopInformation = await redisClient.hgetall(`shop:${shopId}`);
    } catch (error) {
        console.error('Error getting shop information from Redis:', error);
        bot.sendMessage(chatId, 'An error occurred. Please try again later.');
        return;
    }

    if (!shopInformation) {
        bot.sendMessage(chatId, 'Sorry, we could not find your shop. Please register your shop first.');
        return;
    }
    shopInformation = parseShop(shopInformation);

    let resp;
    try {
        resp = await classifyMessage(message, shopInformation);
    } catch (error) {
        console.error('Error classifying message with GPT:', error);
        bot.sendMessage(chatId, 'An error occurred. Please try again later.');
        return;
    }

    const regex = /Category:\s*(\w+)/;
    const match = resp.match(regex);
    let reply = 'Sorry, I did not understand your message. Please try again.';
    if (match && match[1]) {
        const category = match[1].toLowerCase() || 'other';
        let display = '';
        switch (category) {
            case 'show':
                reply = `Here you can see the information about the shop:\n ${printShopInformation(shopInformation)}`;
                break;
            case 'update':
                let updatedStructure;
                try {
                    updatedStructure = await parseResponse(message, shopInformation);
                } catch (error) {
                    console.error('Error parsing response with GPT:', error);
                    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
                    return;
                }
                if (!updatedStructure) {
                    reply = `Sorry, I did not understand your message. Please try again.`;
                    break;
                }
                display = printShopInformation(updatedStructure);
                try {
                    await redisClient.hmset(`shop:${shopId}`, serializeShop(updatedStructure));
                } catch (error) {
                    console.error('Error updating shop information in Redis:', error);
                    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
                    return;
                }
                reply = `Thank you for your update. We updated the information for you. Here you can see the updated information: ${display}`;
                break;
            case 'news':
                let post;
                try {
                    post = await generataPost(message, shopInformation);
                } catch (error) {
                    console.error('Error generating post with GPT:', error);
                    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
                    return;
                }
                shopInformation.posts.unshift(post);
                display = printShopInformation(shopInformation);

                try {
                    await redisClient.hset(`shop:${shopId}`, serializeShop(shopInformation));
                } catch (error) {
                    console.error('Error storing post in Redis:', error);
                    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
                    return;
                }
                reply = `Thank you for your news. We posted it on our website:\n\n ${post}`;
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
    const message = `I want to classify user input into one of the following categories:

    1. Update - Provide updated information for the provided structure
    2. News - News about the shop, new products, new services, new promotions
    3. Request - Request for a service or help
    4. Greeting - Greeting
    5. Thanks - Client says thanks
    6. Show - Request to show information about the shop
    6. Other - Other
    
    Input:\n\n${response}

    Structure:\n\n${JSON.stringify(currentStructure)}`;

    try {
        const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
            messages: [{ role: 'user', content: message }],
            model: 'gpt-3.5-turbo',
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
    } catch (error) {
        console.error('Error making API call to GPT:', error.response?.data || error.message);
        throw error;
    }
}

async function parseResponse(response, currentStructure) {
    const message = `Parse the following response and add new information into the existing structure. 
    You MUST use only existing fields from the provided structure.
    If new address was provided partially, you must use the missed information from the provided structure.
    
    Response:\n\n${response}

    Structure:\n\n${JSON.stringify(currentStructure)}`;

    try {
        const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
            messages: [{ role: 'user', content: message }],
            model: 'gpt-3.5-turbo',
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
        let updatedStructure;
        try {
            updatedStructure = JSON.parse(structuredResponse);
        } catch (error) {
            console.error('Error parsing JSON:', error, structuredResponse);
            return;
        }

        if (currentStructure.address !== updatedStructure.address) {
            const coordinates = await getCoordinates(updatedStructure.address);
            if (coordinates) {
                updatedStructure.latitude = coordinates.latitude;
                updatedStructure.longitude = coordinates.longitude;
            }
        }

        return updatedStructure;
    } catch (error) {
        console.error('Error making API call to GPT:', error.response?.data || error.message);
        throw error;
    }
}

async function generataPost(initialMessage, currentStructure) {
    const message = `Parse the following client input and generate a social media post from a car workshop company. 
    You can also use information about the shop from the provided structure if needed.
    
    Input:\n\n${initialMessage}

    Structure:\n\n${JSON.stringify(currentStructure)}`;

    try {
        const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
            messages: [{ role: 'user', content: message }],
            model: 'gpt-3.5-turbo',
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
    } catch (error) {
        console.error('Error making API call to GPT:', error.response?.data || error.message);
        throw error;
    }
}

async function getCoordinates(address) {
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}`;

    try {
        const { data } = await axios.get(url);
        if (!data.length || !data[0].geometry) {
            return;
        }
        const { lat, lng } = data[0].geometry.location;
        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error('Error getting coordinates:', error.response?.data || error.message);
        throw error;
    }
}

// Other functions remain the same...
function printShopInformation(shop) {
    const { shopName, address, phone, website, working_hours, brands, pay_by_card } = shop;

    let openingHoursString = '';
    for (const day in working_hours) {
        openingHoursString += `  ${day}: ${working_hours[day]}\n`;
    }

    brandsString = (brands).join(', ');

    return `Shop name:\n ${shopName}\n
Address:\n ${address}\n
Phone number:\n ${phone || 'not provided'}\n
Website:\n ${website || 'not provided'}\n
Opening hours:\n ${openingHoursString}\n
Brands:\n ${brandsString}`;
}

function parseShop(rawShop) {
    rawShop.photos = safeParseJSON(rawShop.photos) || [];
    rawShop.products = safeParseJSON(rawShop.products) || {};
    rawShop.working_hours = safeParseJSON(rawShop.working_hours) || {};
    rawShop.brands = safeParseJSON(rawShop.brands) || [];
    rawShop.posts = safeParseJSON(rawShop.posts) || [];
    return rawShop;
}

function safeParseJSON(jsonString) {
    if (!jsonString) {
        return null;
    }

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error, jsonString);
        return null;
    }
}

function serializeShop(shop) {
    shop.photos = JSON.stringify(shop.photos || []);
    shop.products = JSON.stringify(shop.products || {});
    shop.working_hours = JSON.stringify(shop.working_hours || {});
    shop.brands = JSON.stringify(shop.brands || []);
    shop.posts = JSON.stringify(shop.posts || []);
    return shop;
}
