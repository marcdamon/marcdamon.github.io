import { SPREADSHEET_ID } from './config.js';
import { updateAircraftList, updateDisplay } from './ui.js';

export function fetchSheetData() {
    console.log("Fetching data from Google Sheets...");
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A2:Z',
    }).then(function(response) {
        let range = response.result;
        if (range.values.length > 0) {
            console.log("Data fetched successfully.");
            console.log("Fetched data:", range.values);
            window.aircraftData = range.values;
            updateAircraftList(range.values);
            updateDisplay(range.values[0][0]);
        } else {
            console.log("No data found in the specified range.");
        }
    }, function(response) {
        console.error('Error fetching data from Google Sheets:', response.result.error.message);
    });
}

export function updateFlightHours(flightHours) {
    console.log("Updating flight hours...");
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!G2',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[flightHours]]
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} cells updated.`);
        fetchSheetData();
    }, function(error) {
        console.error('Error updating Google Sheets:', error);
    });
}
