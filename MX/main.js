import { initializeAuth } from './auth.js';
import { fetchSheetData, updateFlightHours, saveSquawk, markSquawkComplete } from './data.js';
import { updateAircraftList, updateDisplay, updateHeader, updateCurrentFlightHours, updateMaintenanceReminders, updateSquawks } from './ui.js';

const CLIENT_ID = '816027223942-4rqrbc07n383r8dddfb04rqoojm5480f.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBUzFa5AscG-sMzbiPxGp0zKDsnbD0ZSGg';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
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

function toggleSidebarMenu() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu.style.width === '250px') {
        sidebarMenu.style.width = '0';
    } else {
        sidebarMenu.style.width = '250px';
    }
}

function adjustSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (window.innerWidth >= 768) {
        sidebarMenu.style.width = '250px';
    } else {
        sidebarMenu.style.width = '0';
    }
}

window.addEventListener('load', () => {
    gapiLoaded();
    initializeAuth(CLIENT_ID, SCOPES, () => fetchSheetData(SPREADSHEET_ID));
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded.");
});

document.getElementById('updateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Update form submitted.");
    const flightHours = document.getElementById('flightHours').value;
    updateFlightHours(SPREADSHEET_ID, flightHours);
});

document.getElementById('signout-button').addEventListener('click', function() {
    console.log("Sign out button clicked.");
    localStorage.removeItem('gapiToken');
    google.accounts.id.disableAutoSelect();
    location.reload();
});
