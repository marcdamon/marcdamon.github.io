import { updateAircraftList, updateDisplay } from './ui.js';

let aircraftData = [];

export function fetchSheetData(SPREADSHEET_ID) {
    console.log("Fetching data from Google Sheets...");
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A2:Z',
    }).then(function(response) {
        let range = response.result;
        if (range.values.length > 0) {
            console.log("Data fetched successfully.");
            console.log("Fetched data:", range.values);
            aircraftData = range.values;
            updateAircraftList(aircraftData);
            updateDisplay(aircraftData[0][0]); // Default to the first aircraft
        } else {
            console.log("No data found in the specified range.");
        }
    }, function(response) {
        console.error('Error fetching data from Google Sheets:', response.result.error.message);
    });
}

export function updateFlightHours(SPREADSHEET_ID, flightHours) {
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
        fetchSheetData(SPREADSHEET_ID);
    }, function(error) {
        console.error('Error updating Google Sheets:', error);
    });
}

export function saveSquawk(SPREADSHEET_ID, selectedAircraft, newSquawk) {
    const rowIndex = aircraftData.findIndex(row => row[0] === selectedAircraft);
    if (rowIndex !== -1) {
        if (!aircraftData[rowIndex][25]) {
            aircraftData[rowIndex][25] = newSquawk; // Update squawk in local data
        } else {
            aircraftData[rowIndex][25] += `\n${newSquawk}`; // Append new squawk to existing squawks
        }
        // Update squawk in Google Sheets
        const cellAddress = `Sheet1!Z${rowIndex + 2}`; // Adjust for header row
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: cellAddress,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[aircraftData[rowIndex][25]]]
            }
        }).then((response) => {
            console.log(`${response.result.updatedCells} cells updated.`);
            document.getElementById('newSquawk').value = ''; // Clear input after save
            updateSquawks([aircraftData[rowIndex]]); // Refresh squawks display
        }, function(error) {
            console.error('Error updating Google Sheets:', error);
        });
    }
}

export function markSquawkComplete(SPREADSHEET_ID, selectedAircraft, squawkIndex) {
    const rowIndex = aircraftData.findIndex(row => row[0] === selectedAircraft);
    if (rowIndex !== -1) {
        const squawks = aircraftData[rowIndex][25].split('\n');
        squawks.splice(squawkIndex, 1);
        aircraftData[rowIndex][25] = squawks.join('\n');
        // Update squawks in Google Sheets
        const cellAddress = `Sheet1!Z${rowIndex + 2}`; // Adjust for header row
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: cellAddress,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[aircraftData[rowIndex][25]]]
            }
        }).then((response) => {
            console.log(`${response.result.updatedCells} cells updated.`);
            updateSquawks([aircraftData[rowIndex]]); // Refresh squawks display
        }, function(error) {
            console.error('Error updating Google Sheets:', error);
        });
    }
}
