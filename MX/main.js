window.addEventListener('load', () => {
    gapiLoaded();
    gisLoaded();
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
    // Event listener for updating flight hours
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const flightHours = parseFloat(document.getElementById('flightHours').value).toFixed(1);
            console.log("Update form submitted.");
            updateFlightHours(flightHours);
        });
    } else {
        console.error('Element with ID updateForm not found');
    }

    // Event listener for the item update form
    const itemUpdateForm = document.getElementById('itemUpdateForm');
    if (itemUpdateForm) {
        itemUpdateForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const mxDate = document.getElementById('mxDate').value;
            const mxFlightHours = document.getElementById('mxFlightHours').value;
            const nextServiceDueAt = document.getElementById('nextServiceDueAt').value;

            const selectedRowIndex = aircraftData.findIndex(row => row[0] === selectedAircraft);

            aircraftData[selectedRowIndex][7] = mxDate;
            aircraftData[selectedRowIndex][8] = mxFlightHours;
            if (aircraftData[selectedRowIndex][2] === 'manual') {
                aircraftData[selectedRowIndex][9] = nextServiceDueAt;
            }

            updateGoogleSheet(selectedRowIndex, mxDate, mxFlightHours, nextServiceDueAt);
            closeUpdateModal();
        });
    } else {
        console.error('Element with ID itemUpdateForm not found');
    }
});
function updateFlightHours(flightHours) {
    const nNumber = document.getElementById('registration').innerText;
    getFlightHoursData().then(sheet => {
        const rowIndex = sheet.findIndex(row => row[0] === nNumber);
        if (rowIndex !== -1) {
            sheet[rowIndex][1] = flightHours;  // Update the local copy of flight hours data
            saveFlightHoursData(sheet).then(() => {
                document.getElementById('currentFlightHours').textContent = flightHours; // Update flight hours display immediately
                // Assuming you have a way to update the `aircraftData` array as well
                const aircraftIndex = aircraftData.findIndex(row => row[0] === nNumber);
                if (aircraftIndex !== -1) {
                    aircraftData[aircraftIndex][6] = flightHours; // Update local data for maintenance calculations
                }
                updateMaintenanceReminders(aircraftData.filter(row => row[0] === nNumber)); // Refresh maintenance items
                updateDisplay(nNumber); // Maintain focus on the current aircraft
            }).catch(error => {
                console.error('Error saving flight hours data:', error);
            });
        } else {
            console.error(`Aircraft with N-Number ${nNumber} not found`);
        }
    }).catch(error => {
        console.error('Error fetching flight hours data:', error);
    });
}



function getFlightHoursData() {
    const spreadsheetId = SPREADSHEET_ID;
    const range = 'FlightHours!A2:B';
    console.log(`Fetching data from spreadsheet ID: ${spreadsheetId}, range: ${range}`);

    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    }).then(response => {
        console.log('Sheet data fetched successfully:', response.result.values);
        return response.result.values;
    }).catch(error => {
        console.error('Error fetching data from Google Sheets:', error);
        return null;
    });
}

function saveFlightHoursData(sheet) {
    const formattedSheet = sheet.map(row => (Array.isArray(row) ? row : [row]));

    const spreadsheetId = SPREADSHEET_ID;
    const range = 'FlightHours!A2:B';
    console.log(`Saving data to spreadsheet ID: ${spreadsheetId}, range: ${range}`);

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values: formattedSheet
        }
    }).then(response => {
        console.log('Sheet data saved successfully:', response);
    }).catch(error => {
        console.error('Error saving sheet data:', error);
    });
}



function adjustSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu) {
        if (window.innerWidth >= 768) {
            sidebarMenu.style.width = '250px';
        } else {
            sidebarMenu.style.width = '0';
        }
    } else {
        console.error('Element with ID sidebarMenu not found');
    }
}

function toggleSidebarMenu() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu) {
        if (sidebarMenu.style.width === '250px') {
            sidebarMenu.style.width = '0';
        } else {
            sidebarMenu.style.width = '250px';
        }
    } else {
        console.error('Element with ID sidebarMenu not found');
    }
}

function getFlightHoursData() {
    const spreadsheetId = SPREADSHEET_ID;
    const range = 'FlightHours!A2:B';
    console.log(`Fetching data from spreadsheet ID: ${spreadsheetId}, range: ${range}`);

    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    }).then(response => {
        console.log('Sheet data fetched successfully:', response.result.values);
        return response.result.values;
    }).catch(error => {
        console.error('Error fetching data from Google Sheets:', error);
        return null;
    });
}

function saveFlightHoursData(sheet) {
    const formattedSheet = sheet.map(row => (Array.isArray(row) ? row : [row]));

    const spreadsheetId = SPREADSHEET_ID;
    const range = 'FlightHours!A2:B';
    console.log(`Saving data to spreadsheet ID: ${spreadsheetId}, range: ${range}`);

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values: formattedSheet
        }
    }).then(response => {
        console.log('Sheet data saved successfully:', response);
    }).catch(error => {
        console.error('Error saving sheet data:', error);
    });
}
