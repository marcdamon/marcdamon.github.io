window.addEventListener('load', () => {
    gapiLoaded();
    gisLoaded();
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
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
});


function updateFlightHours(flightHours) {
    const nNumber = document.getElementById('registration').innerText;
    console.log(`Updating flight hours for ${nNumber} to ${flightHours}`);
    getFlightHoursData().then(sheet => {
        if (!sheet || !Array.isArray(sheet)) {
            console.error('Sheet data is undefined or not an array');
            return;
        }

        // Find the row index of the aircraft
        const rowIndex = sheet.findIndex(row => row[0] === nNumber);
        if (rowIndex === -1) {
            console.error(`Aircraft with nNumber ${nNumber} not found`);
            return;
        }

        // Update flight hours in the correct cell for the aircraft
        console.log(`Old flight hours for ${nNumber}: ${sheet[rowIndex][1]}`);
        sheet[rowIndex][1] = flightHours;
        console.log(`New flight hours for ${nNumber}: ${sheet[rowIndex][1]}`);

        // Save changes to the sheet
        console.log('Saving sheet data:', sheet);
        saveFlightHoursData(sheet);
    }).catch(error => {
        console.error('Error fetching sheet data:', error);
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
    // Fetch the data from the FlightHours Google Sheet
    const spreadsheetId = SPREADSHEET_ID; // Use the spreadsheet ID from config.js
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
    // Ensure the sheet data is a 2D array
    const formattedSheet = sheet.map(row => (Array.isArray(row) ? row : [row]));
    
    // Save the updated data back to Google Sheets
    const spreadsheetId = SPREADSHEET_ID; // Use the spreadsheet ID from config.js
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
