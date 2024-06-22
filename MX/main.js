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
            const flightHours = document.getElementById('flightHours').value;
            updateFlightHours(flightHours);
        });
    } else {
        console.error('Element with ID updateForm not found');
    }
});

function updateFlightHours(flightHours) {
    const nNumber = document.getElementById('registration').innerText;
    console.log(`Updating flight hours for ${nNumber} to ${flightHours}`);
    const sheet = getSheetData(); // Function to get your Google Sheet data

    // Iterate through all rows and update the ones that match the nNumber
    sheet.forEach(row => {
        if (row.nNumber === nNumber) {
            console.log(`Updating row for ${nNumber}`);
            row.flightHours = flightHours;
        }
    });

    // Save changes to the sheet
    console.log('Saving sheet data:', sheet);
    saveSheetData(sheet);
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

function getSheetData() {
    // Placeholder function to get your Google Sheet data
    return [
        // Example data structure
        { nNumber: 'N122ZM', flightHours: 749 },
        { nNumber: 'N213P', flightHours: 136.6 },
        // Add more rows as needed
    ];
}

function saveSheetData(sheet) {
    // Placeholder function to save data back to Google Sheets
    // You need to implement the actual logic to update the Google Sheets API
    console.log('Saving sheet data:', sheet);
    // Example of saving data:
    // gapi.client.sheets.spreadsheets.values.update({
    //     spreadsheetId: 'your_spreadsheet_id',
    //     range: 'Sheet1!A2:Z',
    //     valueInputOption: 'RAW',
    //     resource: {
    //         values: sheet
    //     }
    // }).then(response => {
    //     console.log('Sheet data saved:', response);
    // }).catch(error => {
    //     console.error('Error saving sheet data:', error);
    // });
}
