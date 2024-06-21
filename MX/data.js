import { updateAircraftList, updateDisplay } from './ui.js';

export function fetchSheetData(spreadsheetId) {
    console.log("Fetching data from Google Sheets...");
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A2:Z',  // Ensure the range is correct
    }).then(function(response) {
        let range = response.result;
        if (range.values.length > 0) {
            console.log("Data fetched successfully.");
            console.log("Fetched data:", range.values);
            window.aircraftData = range.values; // Store data globally for access in ui.js
            updateAircraftList(range.values);
            updateDisplay(range.values[0][0]); // Default to the first aircraft
        } else {
            console.log("No data found in the specified range.");
        }
    }, function(response) {
        console.error('Error fetching data from Google Sheets:', response.result.error.message);
    });
}

export function updateFlightHours(spreadsheetId, flightHours) {
    console.log("Updating flight hours...");
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!G2',  // Ensure the range is correct
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[flightHours]]
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} cells updated.`);
        fetchSheetData(spreadsheetId);
    }, function(error) {
        console.error('Error updating Google Sheets:', error);
    });
}
