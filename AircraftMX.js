let CLIENT_ID = '816027223942-4rqrbc07n383r8dddfb04rqoojm5480f.apps.googleusercontent.com';
let API_KEY = 'AIzaSyBUzFa5AscG-sMzbiPxGp0zKDsnbD0ZSGg';
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";
let SPREADSHEET_ID = '1mK2LE_oudXFydiAD_iSuvuL7rPvf6NU8_LlXEVvQQHQ';



function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        document.getElementById('signin-button').onclick = handleAuthClick;
        document.getElementById('signout-button').onclick = handleSignoutClick;
    }, function(error) {
        console.error("Error initializing GAPI client:", error);
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        fetchSheetData();
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function fetchSheetData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:X',
    }).then(function(response) {
        let range = response.result;
        if (range.values.length > 0) {
            let table = document.getElementById('maintenanceTable').getElementsByTagName('tbody')[0];
            table.innerHTML = '';
            for (let i = 0; i < range.values.length; i++) {
                let row = range.values[i];
                let newRow = table.insertRow();
                for (let j = 0; j < row.length; j++) {
                    let newCell = newRow.insertCell();
                    newCell.appendChild(document.createTextNode(row[j]));
                }
            }
        }
    }, function(response) {
        console.error('Error fetching data from Google Sheets:', response.result.error.message);
    });
}

function updateFlightHours() {
    let flightHours = document.getElementById('flightHours').value;

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

document.addEventListener('DOMContentLoaded', function() {
    handleClientLoad();
});

document.getElementById('updateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateFlightHours();
});