export async function onRequest(context) {
    const hkoUrl = 'https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_10min_wind.csv';
    
    try {
        // We add a realistic "User-Agent" header to fool the HKO firewall into thinking we are a normal Safari browser.
        const response = await fetch(`${hkoUrl}?_=${Date.now()}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
                'Accept': 'text/csv, application/csv, text/plain, */*'
            }
        });

        if (!response.ok) {
            return new Response(`Error from HKO: ${response.status}`, { status: response.status });
        }

        const csvText = await response.text();

        return new Response(csvText, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Access-Control-Allow-Origin': '*', // Unlocks CORS for your app
            }
        });
    } catch (error) {
        return new Response(`Fetch Failed: ${error.message}`, { status: 500 });
    }
}