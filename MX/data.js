let aircraftData = [];
let flightHoursData = [];
let personalItemsData = [];
let vehicleMaintenanceData = [];
let vehicleUsageMetricData = []; // Add a variable to hold VehicleUsageMetric data

async function fetchSheetData() {
    console.log("Fetching data from Google Sheets...");
    try {
        // Fetch aircraft data
        const sheetResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A2:Z', // Ensure this range covers all needed columns
        });
        const sheetRange = sheetResponse.result;
        if (sheetRange.values.length > 0) {
            console.log("Aircraft data fetched successfully.");
            aircraftData = sheetRange.values;
            updateAircraftList(aircraftData);
            updateDisplay(aircraftData[0][0]);
        } else {
            console.log("No aircraft data found in the specified range.");
        }

        // Fetch flight hours data
        const flightHoursResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'FlightHours!A2:B',
        });
        const flightHoursRange = flightHoursResponse.result;
        if (flightHoursRange.values.length > 0) {
            console.log("Flight hours data fetched successfully.");
            flightHoursData = flightHoursRange.values;
        } else {
            console.log("No flight hours data found in the specified range.");
        }

        // Fetch personal items data
        const personalItemsResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'PersonalItems!A2:L', // Ensure the range includes all necessary columns
        });
        const personalItemsRange = personalItemsResponse.result;
        if (personalItemsRange.values.length > 0) {
            console.log("Personal items data fetched successfully.");
            personalItemsData = personalItemsRange.values;
            console.log("Fetched personal items data:", JSON.stringify(personalItemsData)); // Log the fetched data to the console
        } else {
            console.log("No personal items data found in the specified range.");
        }

        // Fetch vehicle maintenance data
        const vehicleMaintenanceResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'VehicleMaintenance!A2:U', // Adjust the range based on the VehicleMaintenance sheet structure
        });
        const vehicleMaintenanceRange = vehicleMaintenanceResponse.result;
        if (vehicleMaintenanceRange.values.length > 0) {
            console.log("Vehicle maintenance data fetched successfully.");
            vehicleMaintenanceData = vehicleMaintenanceRange.values;
            console.log("Fetched vehicle maintenance data:", JSON.stringify(vehicleMaintenanceData)); // Log the fetched data to the console
        } else {
            console.log("No vehicle maintenance data found in the specified range.");
        }

        // Fetch vehicle usage metric data
        const vehicleUsageMetricResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'vehicleUsageMetric!A2:B', // Ensure the range covers VIN and usage metric
        });
        const vehicleUsageMetricRange = vehicleUsageMetricResponse.result;
        if (vehicleUsageMetricRange.values.length > 0) {
            console.log("Vehicle usage metric data fetched successfully.");
            vehicleUsageMetricData = vehicleUsageMetricRange.values;
            console.log("Fetched vehicle usage metric data:", JSON.stringify(vehicleUsageMetricData)); // Log the fetched data to the console
        } else {
            console.log("No vehicle usage metric data found in the specified range.");
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error.message);
    }
}

// Logging vehicle usage metric data
function fetchVehicleUsageMetricData() {
    const spreadsheetId = SPREADSHEET_ID;
    const range = 'vehicleUsageMetric!A2:B'; // Ensure this range covers VIN and usage metric
    console.log(`Fetching vehicle usage metric data from spreadsheet ID: ${spreadsheetId}, range: ${range}`);

    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    }).then(response => {
        const vehicleUsageMetricData = response.result.values || [];
        console.log('Fetched vehicle usage metric data:', vehicleUsageMetricData);
        return vehicleUsageMetricData;
    }).catch(error => {
        console.error('Error fetching vehicle usage metric data:', error);
        return [];
    });
}

function updateAircraftList(data) {
    const aircraftListContainer = document.getElementById('aircraftList');
    aircraftListContainer.innerHTML = '';

    const dashboardLink = document.createElement('a');
    dashboardLink.href = 'javascript:void(0)';
    dashboardLink.textContent = 'Dashboard';
    dashboardLink.onclick = openDashboard;
    aircraftListContainer.appendChild(dashboardLink);

    const personalItemsLink = document.createElement('a');
    personalItemsLink.href = 'javascript:void(0)';
    personalItemsLink.textContent = 'Personal Items';
    personalItemsLink.onclick = showPersonalItems;
    aircraftListContainer.appendChild(personalItemsLink);

    const vehicleMaintenanceLink = document.createElement('a');
    vehicleMaintenanceLink.href = 'javascript:void(0)';
    vehicleMaintenanceLink.textContent = 'Vehicle Maintenance';
    vehicleMaintenanceLink.onclick = showVehicleMaintenance;
    aircraftListContainer.appendChild(vehicleMaintenanceLink);

    const space = document.createElement('div');
    space.style.height = '10px';
    aircraftListContainer.appendChild(space);

    const uniqueAircraft = [...new Set(data.map(row => row[0]))];

    uniqueAircraft.forEach(nNumber => {
        const listItem = document.createElement('a');
        listItem.href = 'javascript:void(0)';
        listItem.textContent = nNumber;
        listItem.onclick = () => {
            updateDisplay(nNumber);
        };
        aircraftListContainer.appendChild(listItem);
    });
}

async function updateGoogleSheet(rowIndex, mxDate, mxFlightHours, nextServiceDueAt, isManual) {
    const range = isManual ? `Sheet1!O${rowIndex + 2}:Q${rowIndex + 2}` : `Sheet1!O${rowIndex + 2}:P${rowIndex + 2}`;
    const values = isManual ? [[mxDate, mxFlightHours, nextServiceDueAt]] : [[mxDate, mxFlightHours]];

    try {
        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values
            }
        });
        console.log(`${response.result.updatedCells} cells updated.`);
        fetchSheetData();
    } catch (error) {
        console.error('Error updating Google Sheets:', error);
    }
}
