const axios = require('axios');
const apiKey = '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';

async function parseResponse(response, currentStructure) {
    const message = `Parse the following response and add new information into existing structure. 
    you MUST use only existing fields from provided sturcture
    If new address was provided partially, you must use missed information from providede structure
    
    Response:\n\n${response}\n\n 
    Structure: ${currentStructure}`;

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

    const structuredResponse = data.choices[0];
    
    console.log(currentStructure);
    console.log(response);
    console.log(structuredResponse);

    return structuredResponse;
}


parseResponse(
    'yeah, i moved my store to new location, it is now located at 10 jalan sri tasik barat. and now i also working with a new brand for BMW', 
    '{"shops":{"shop":{"rating":"4","address":"18, Jalan 4/23b, Taman Danau Kota, 53300 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur","logo":"","latitude":"3.2081691","phone":"+60 16-244 1991","pay_by_card":"true","brands":["Alfa Romeo","Acura","Buick"],"products":{"Seats":"Interior and Exterior Components","Fuel Tank":"Fuel System Components","Sensors (Oxygen Sensor, Mass Air Flow Sensor, etc.)":"Electrical Components","Windows and Windshields":"Interior and Exterior Components","Switches":"Electrical Components","Exterior Trim":"Interior and Exterior Components","Brake Lines":"Braking System Components","Valves":"Engine Components","Brake Discs/Rotors":"Braking System Components","Steering Rack":"Suspension and Steering Components"},"photos":["https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w800-h500-k-no","https://lh5.googleusercontent.com/p/AF1QipOHftDQ8DbpggQ_tOimPJHNXYo0cegRGFC14xta=w1600-h1000-k-no"],"reliability":"5","category":"Car Wash","longitude":"101.7180254","working_hours":{"Monday":"9:30 am-7:30 pm","Tuesday":"9:30 am-7:30 pm","Wednesday":"9:30 am-7:30 pm","Thursday":"9:30 am-7:30 pm","Friday":"9:30 am-7:30 pm","Saturday":"9:30 am-7:30 pm","Sunday":"9:30 am-7:30 pm"},"shopName":"Danau Air Cond & Accessories Auto Works"},"distance":"2.1997"}}'
);