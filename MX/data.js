let aircraftData = [];

async function fetchSheetData() {
    console.log("Fetching data from Google Sheets...");
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A2:Z',
        });
        const range = response.result;
        if (range.values.length > 0) {
            console.log("Data fetched successfully.");
            console.log("Fetched data:", range.values);
            aircraftData = range.values;
            updateAircraftList(aircraftData);
            updateDisplay(aircraftData[0][0]);
        } else {
            console.log("No data found in the specified range.");
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
