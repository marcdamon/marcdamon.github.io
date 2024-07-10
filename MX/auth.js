let tokenClient;

function handleCredentialResponse(response) {
    console.log("Credential response received:", response);
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse.error) {
                console.error("Error receiving token response:", tokenResponse.error);
                return;
            }
            console.log("Token response received:", tokenResponse);
            localStorage.setItem('gapiToken', tokenResponse.access_token);
            fetchSheetData();
            scheduleTokenRefresh(tokenResponse.expires_in);
        },
    });
    tokenClient.requestAccessToken({ prompt: '' });
}

function gapiLoaded() {
    console.log("Loading Google API client...");
    gapi.load('client', initializeGapiClient);
}

function initializeGapiClient() {
    console.log("Initializing Google API client...");
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(function () {
        console.log("Google API client initialized.");
        let token = localStorage.getItem('gapiToken');
        if (token) {
            gapi.client.setToken({ access_token: token });
            fetchSheetData();
        } else {
            gisLoaded();
        }
    }, function(error) {
        console.error("Error initializing GAPI client:", error.details);
    });
}

function gisLoaded() {
    console.log("GIS loaded.");
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
    });
    document.getElementById('signin-button').onclick = () => google.accounts.id.prompt();
}

function scheduleTokenRefresh(expiresIn) {
    const timeout = (expiresIn - 300) * 1000; // Refresh token 5 minutes before it expires
    setTimeout(refreshAccessToken, timeout);
}

function refreshAccessToken() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance && authInstance.isSignedIn.get()) {
        authInstance.currentUser.get().reloadAuthResponse().then((authResponse) => {
            console.log('Token refreshed', authResponse);
            localStorage.setItem('gapiToken', authResponse.access_token);
            scheduleTokenRefresh(authResponse.expires_in);
        });
    } else {
        console.error("No refresh token available.");
        google.accounts.id.prompt();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', openDashboard);
    } else {
        console.error('Dashboard link not found.');
    }

    const itemUpdateForm = document.getElementById('itemUpdateForm');
    if (itemUpdateForm) {
        itemUpdateForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const mxDate = document.getElementById('mxDate').value;
            const mxFlightHours = document.getElementById('mxFlightHours').value;
            const nextServiceDueAt = document.getElementById('nextServiceDueAt').value;

            const selectedRowIndex = aircraftData.findIndex(row => row[0] === selectedAircraft && row[13] === document.getElementById('modalHeader').textContent);

            if (selectedRowIndex !== -1) {
                console.log('Updating row:', selectedRowIndex);
                aircraftData[selectedRowIndex][14] = mxDate;
                aircraftData[selectedRowIndex][15] = mxFlightHours;
                if (aircraftData[selectedRowIndex][12] === 'manual') {
                    aircraftData[selectedRowIndex][16] = nextServiceDueAt;
                }

                updateGoogleSheet(selectedRowIndex, mxDate, mxFlightHours, nextServiceDueAt, aircraftData[selectedRowIndex][12] === 'manual');
                closeUpdateModal();
            } else {
                console.error('Row not found for update.');
            }
        });
    } else {
        console.error('Element with ID itemUpdateForm not found');
    }
});

function fetchSheetData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: 'YOUR_SPREADSHEET_ID',
        range: 'Sheet1!A1:Z1000',
    }).then(function(response) {
        const range = response.result;
        if (range.values.length > 0) {
            // Process the fetched data
            console.log('Data fetched successfully');
        } else {
            console.log('No data found.');
        }
    }, function(response) {
        console.error('Error fetching data: ' + response.result.error.message);
    });
}

function updateGoogleSheet(rowIndex, mxDate, mxFlightHours, nextServiceDueAt, isManual) {
    const range = isManual ? `Sheet1!O${rowIndex + 2}:Q${rowIndex + 2}` : `Sheet1!O${rowIndex + 2}:P${rowIndex + 2}`;
    const values = isManual ? [[mxDate, mxFlightHours, nextServiceDueAt]] : [[mxDate, mxFlightHours]];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: 'YOUR_SPREADSHEET_ID',
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} cells updated.`);
        fetchSheetData();
    }, (error) => {
        console.error('Error updating Google Sheets:', error);
    });
}
