let aircraftData = [];
let flightHoursData = [];
let selectedAircraft = null;

async function fetchSheetData() {
    console.log("Fetching data from Google Sheets...");
    try {
        const sheetResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A2:Z',
        });
        const sheetRange = sheetResponse.result;
        if (sheetRange.values.length > 0) {
            console.log("Data fetched successfully.");
            aircraftData = sheetRange.values;
            updateAircraftList(aircraftData);
            if (!selectedAircraft) {
                selectedAircraft = aircraftData[0][0];
            }
            updateDisplay(selectedAircraft); // Ensure the selected aircraft remains the same after updating
        } else {
            console.log("No data found in the specified range.");
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
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error.message);
        throw error; // Ensure the error propagates to be caught in the calling function
    }
}


function updateAircraftList(data) {
    const aircraftListContainer = document.getElementById('aircraftList');
    aircraftListContainer.innerHTML = '';

    const dashboardLink = document.createElement('a');
    dashboardLink.href = 'javascript:void(0)';
    dashboardLink.textContent = 'Dashboard';
    dashboardLink.onclick = openDashboard;
    aircraftListContainer.appendChild(dashboardLink);

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
