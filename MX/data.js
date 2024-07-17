let aircraftData = [];
let flightHoursData = [];

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
            updateDisplay(aircraftData[0][0]); // Initial display update for first aircraft
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

async function updateGoogleSheet(rowIndex, mxDate, mxFlightHours, nextServiceDueAt) {
    const range = `Sheet1!P${rowIndex + 2}:R${rowIndex + 2}`;
    const values = [[mxDate, mxFlightHours, nextServiceDueAt]];

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
