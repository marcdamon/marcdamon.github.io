import { initializeAuth } from './auth.js';
import { fetchSheetData, updateFlightHours } from './data.js';
import { adjustSidebar } from './ui.js';
import { API_KEY, DISCOVERY_DOCS } from './config.js';

export function gapiLoaded() {
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
            initializeAuth(() => fetchSheetData());
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
    updateFlightHours(flightHours);
});

document.getElementById('signout-button').addEventListener('click', function() {
    console.log("Sign out button clicked.");
    localStorage.removeItem('gapiToken');
    google.accounts.id.disableAutoSelect();
    location.reload();
});
