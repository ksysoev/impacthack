const axios = require('axios');
const apiKey = process.env.GPT_TOKEN;

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
        'Authorization': `Bearer ${apiKey}`,
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
        const coordinates = await getCoordinates(updatedStructure.address);
        console.log('coordinates', coordinates);
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
        'Authorization': `Bearer ${apiKey}`,
        },
    });

    return data.choices[0].message.content;
}

async function getCoordinates(address) {
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}`;
    console.log('url', url);
    const { data } = await axios.get(url);

    if (!data.length) {
        return
    }
  
    const { lat, lng } = data[0].geometry.location;
  
    return { latitude: lat, longitude: lng };
}


// Example usage:
// let updatedStructure = parseResponse(
//     'yeah, i moved my store to new location, it is now located at 4, Jln Klang Lama. and now i also working with a new brand for BMW', 
//     {"rating":"4","address":"18, Jalan 4/23b, Taman Danau Kota, 53300 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur","logo":"","latitude":"3.2081691","phone":"+60 16-244 1991","pay_by_card":"true","brands":["Alfa Romeo","Acura","Buick"],"products":{"Seats":"Interior and Exterior Components","Fuel Tank":"Fuel System Components","Sensors (Oxygen Sensor, Mass Air Flow Sensor, etc.)":"Electrical Components","Windows and Windshields":"Interior and Exterior Components","Switches":"Electrical Components","Exterior Trim":"Interior and Exterior Components","Brake Lines":"Braking System Components","Valves":"Engine Components","Brake Discs/Rotors":"Braking System Components","Steering Rack":"Suspension and Steering Components"},"photos":["https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w800-h500-k-no","https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w1600-h1000-k-no"],"reliability":"5","category":"Car Wash","longitude":"101.7180254","working_hours":{"Monday":"9:30 am-7:30 pm","Tuesday":"9:30 am-7:30 pm","Wednesday":"9:30 am-7:30 pm","Thursday":"9:30 am-7:30 pm","Friday":"9:30 am-7:30 pm","Saturday":"9:30 am-7:30 pm","Sunday":"9:30 am-7:30 pm"},"shopName":"Danau Air Cond & Accessories Auto Works"}
// );

// let post = generataPost(
//     'I have a got new mufler from acrapovich xz123 in stock make it public lah', 
//     {"rating":"4","address":"18, Jalan 4/23b, Taman Danau Kota, 53300 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur","logo":"","latitude":"3.2081691","phone":"+60 16-244 1991","pay_by_card":"true","brands":["Alfa Romeo","Acura","Buick"],"products":{"Seats":"Interior and Exterior Components","Fuel Tank":"Fuel System Components","Sensors (Oxygen Sensor, Mass Air Flow Sensor, etc.)":"Electrical Components","Windows and Windshields":"Interior and Exterior Components","Switches":"Electrical Components","Exterior Trim":"Interior and Exterior Components","Brake Lines":"Braking System Components","Valves":"Engine Components","Brake Discs/Rotors":"Braking System Components","Steering Rack":"Suspension and Steering Components"},"photos":["https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w800-h500-k-no","https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w1600-h1000-k-no"],"reliability":"5","category":"Car Wash","longitude":"101.7180254","working_hours":{"Monday":"9:30 am-7:30 pm","Tuesday":"9:30 am-7:30 pm","Wednesday":"9:30 am-7:30 pm","Thursday":"9:30 am-7:30 pm","Friday":"9:30 am-7:30 pm","Saturday":"9:30 am-7:30 pm","Sunday":"9:30 am-7:30 pm"},"shopName":"Danau Air Cond & Accessories Auto Works"}
// )


module.exports = {
    parseResponse, generataPost
};