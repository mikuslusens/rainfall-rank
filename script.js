// Configuration
const API_KEY = 'ddb6415a7abffbc47892771d5cee0016'; // Replace with your OpenWeatherMap API key
const POPULATION_THRESHOLD = 1000000; // 1 million
const CSV_FILE = 'uscities.csv'; // Path to your CSV file
const TOMORROW = new Date();
TOMORROW.setDate(TOMORROW.getDate() + 1);
const DATE_STR = TOMORROW.toISOString().split('T')[0]; // YYYY-MM-DD for tomorrow

// DOM Elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const resultsBody = document.getElementById('results-body');

// Main function to initialize the app
async function init() {
    try {
        // Parse CSV
        const cities = await parseCSV(CSV_FILE);
        // Filter cities by population
        const largeCities = cities.filter(city => 
            city.population && parseInt(city.population) >= POPULATION_THRESHOLD
        );

        if (largeCities.length === 0) {
            throw new Error('No cities with population ≥ 1 million found in the CSV.');
        }

        // Fetch weather data for each city
        const precipitationData = await fetchPrecipitationData(largeCities);
        // Sort and get top 5
        const topCities = precipitationData
            .sort((a, b) => b.precipitation - a.precipitation)
            .slice(0, 5);

        // Display results
        displayResults(topCities);
    } catch (error) {
        showError(error.message);
    } finally {
        loadingDiv.classList.add('d-none');
    }
}

// Parse CSV file using PapaParse
function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            download: true, // Fetches the file
            header: true, // Treats first row as headers
			skipEmptyLines: true,
            complete: (result) => {
                if (result.errors.length > 0) {
                    reject(new Error('Error parsing CSV: ' + result.errors[0].message));
                } else {
                    resolve(result.data);
                }
            },
            error: (error) => reject(error)
        });
    });
}

// Fetch precipitation data for all cities
async function fetchPrecipitationData(cities) {
    const precipitationData = [];

    for (const city of cities) {
        if (!city.lat || !city.lng || !city.state_name || !city.city) {
            console.warn(`Skipping city due to missing data: ${JSON.stringify(city)}`);
            continue;
        }

        try {
            const precip = await getDailyPrecipitation(
                city.lat,
                city.lng,
                DATE_STR
            );
            precipitationData.push({
                city: city.city,
				state_name: city.state_name,
                precipitation: precip || 0.0 // Default to 0.0 if no precipitation
            });
        } catch (error) {
            console.warn(`Error fetching data for ${city.city}: ${error.message}`);
        }
    }

    return precipitationData;
}

// Fetch daily precipitation from OpenWeatherMap Daily Aggregation API
async function getDailyPrecipitation(lat, lon, date) {
    const url = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${date}&appid=${API_KEY}`;
    const response = await fetch(url);
	
	if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code) {
        throw new Error(data.message || 'Unknown API error');
    }

    // Extract precipitation (in mm)
    return data.precipitation.total || 0.0;
}

// Display results in the table
function displayResults(cities) {
    resultsBody.innerHTML = '';
    cities.forEach((city, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${city.city}</td>
			<td>${city.state_name}</td>
            <td>${city.precipitation.toFixed(2)} mm</td>
        `;
        resultsBody.appendChild(row);
    });
    resultsDiv.classList.remove('d-none');
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

// Start the app
init();