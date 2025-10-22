// Configuration
const apiBaseUrl = 'https://shell-uat.workspaceair.com'; // Replace with your UEM server (e.g., cn1506.awmdm.com)
const apiKey = 'BYe/egnfEpe4QAFhthqbaC7eoQEHU/h21cuBfmMfp+w='; // Replace with your API key
const clientId = '3899c5fb3bdb4720b77e410d595b2036'; // Replace with your OAuth client ID
const clientSecret = '94E355AE746CFD5F36EAB2FF672D40C1'; // Replace with your OAuth client secret

// Error handling function
function handleError(error, message = 'An error occurred while fetching data.') {
    console.error('Error:', error);
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.classList.remove('d-none');
    errorContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}: ${error.message || 'Unknown error'}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    // Clear previous content
    document.getElementById('deviceCards').innerHTML = '';
    document.getElementById('deviceChart').style.display = 'none';
}

// Fetch OAuth token
async function getOAuthToken() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/system/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'aw-tenant-code': apiKey
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch OAuth token: ${response.status}`);
        }
        const data = await response.json();
        return `Bearer ${data.access_token}`;
    } catch (error) {
        handleError(error, 'Failed to authenticate with API');
        throw error; // Re-throw to stop further execution
    }
}

// Fetch device data
async function fetchDeviceData() {
    try {
        const authToken = await getOAuthToken();
        const response = await fetch(`${apiBaseUrl}/api/mdm/devices/search`, {
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'aw-tenant-code': apiKey,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Clear any previous error messages
        document.getElementById('errorContainer').classList.add('d-none');
        document.getElementById('deviceChart').style.display = 'block';
        processDeviceData(data.Devices);
    } catch (error) {
        handleError(error, 'Failed to load device data. Please check your API configuration');
    }
}

// Process and display device data
function processDeviceData(devices) {
    try {
        // Count devices by platform
        const deviceCounts = {};
        devices.forEach(device => {
            const platform = device.Platform || 'Unknown';
            deviceCounts[platform] = (deviceCounts[platform] || 0) + 1;
        });

        // Generate cards
        const cardContainer = document.getElementById('deviceCards');
        cardContainer.innerHTML = ''; // Clear existing content
        for (const [platform, count] of Object.entries(deviceCounts)) {
            const card = `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title">${platform}</h5>
                            <p class="card-text">${count}</p>
                        </div>
                    </div>
                </div>`;
            cardContainer.innerHTML += card;
        }

        // Render pie chart
        renderChart(deviceCounts);
    } catch (error) {
        handleError(error, 'Error processing device data');
    }
}

// Render pie chart
function renderChart(deviceCounts) {
    try {
        const ctx = document.getElementById('deviceChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(deviceCounts),
                datasets: [{
                    data: Object.values(deviceCounts),
                    backgroundColor: [
                        '#007bff', // Blue
                        '#28a745', // Green
                        '#dc3545', // Red
                        '#ffc107', // Yellow
                        '#6c757d'  // Gray
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Device Distribution by Type',
                        font: {
                            size: 18
                        }
                    }
                }
            }
        });
    } catch (error) {
        handleError(error, 'Error rendering chart');
    }
}

// Fetch data on page load
window.onload = fetchDeviceData;