import { initializeAuth } from './auth.js';
import { fetchSheetData, updateFlightHours } from './data.js';
import { adjustSidebar } from './ui.js';

const CLIENT_ID = '816027223942-4rqrbc07n383r8dddfb04rqoojm5480f.apps.googleusercontent.com';
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const SPREADSHEET_ID = '1mK2LE_oudXFydiAD_iSuvuL7rPvf6NU8_LlXEVvQQHQ';

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
            fetchSheetData(SPREADSHEET_ID);
        } else {
            initializeAuth(CLIENT_ID, SCOPES, () => fetchSheetData(SPREADSHEET_ID));
        }
    }, function(error) {
        console.error("Error initializing GAPI client:", error.details);
    });
}

window.addEventListener('load', () => {
    gapiLoaded();
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded.");
});

document.getElementById('updateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const flightHours = document.getElementById('flightHours').value;
    console.log("Update form submitted.");
    updateFlightHours(SPREADSHEET_ID, flightHours);
});

document.getElementById('signout-button').addEventListener('click', function() {
    console.log("Sign out button clicked.");
    localStorage.removeItem('gapiToken');
    google.accounts.id.disableAutoSelect();
    location.reload();
});
