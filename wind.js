export async function onRequest(context) {
    // 1. Fetch the live CSV directly from HKO using Cloudflare's backend servers
    const hkoUrl = 'https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_10min_wind.csv';
    const response = await fetch(`${hkoUrl}?_=${Date.now()}`);
    const csvText = await response.text();

    // 2. Pass the data back to your frontend with CORS completely unlocked
    return new Response(csvText, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Access-Control-Allow-Origin': '*', // Unlocks CORS for your app
        }
    });
}