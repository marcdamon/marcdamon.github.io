let CLIENT_ID = '816027223942-4rqrbc07n383r8dddfb04rqoojm5480f.apps.googleusercontent.com';
let API_KEY = 'AIzaSyBUzFa5AscG-sMzbiPxGp0zKDsnbD0ZSGg';
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";
let SPREADSHEET_ID = '1mK2LE_oudXFydiAD_iSuvuL7rPvf6NU8_LlXEVvQQHQ';

let tokenClient;
let aircraftData = [];
let selectedAircraft = '';

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
        },
    });
    tokenClient.requestAccessToken({ prompt: '' });
}

function fetchSheetData() {
    console.log("Fetching data from Google Sheets...");
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A2:Z',  // Updated range to include new columns
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

function updateAircraftList(data) {
    const aircraftListContainer = document.getElementById('aircraftList');
    aircraftListContainer.innerHTML = ''; // Clear existing list

    // Add Dashboard link
    const dashboardLink = document.createElement('a');
    dashboardLink.href = 'javascript:void(0)';
    dashboardLink.textContent = 'Dashboard';
    dashboardLink.onclick = openDashboard;
    aircraftListContainer.appendChild(dashboardLink);

    // Add a space
    const space = document.createElement('div');
    space.style.height = '10px';
    aircraftListContainer.appendChild(space);

    // Get unique aircraft
    const uniqueAircraft = [...new Set(data.map(row => row[0]))];

    uniqueAircraft.forEach(nNumber => {
        const listItem = document.createElement('a');
        listItem.href = 'javascript:void(0)';
        listItem.textContent = nNumber;
        listItem.onclick = () => {
            updateDisplay(nNumber);
        };
        aircraftListContainer.appendChild(listItem);
    });
}

function updateDisplay(nNumber) {
    selectedAircraft = nNumber;
    const aircraft = aircraftData.filter(row => row[0] === nNumber);

    if (aircraft.length > 0) {
        document.getElementById('mainContainer').style.display = 'block';
        document.getElementById('dashboardContainer').style.display = 'none';

        updateHeader(aircraft[0]);
        updateCurrentFlightHours(aircraft[0]);
        updateMaintenanceReminders(aircraft);
        updateSquawks(aircraft);
    }
}

function updateHeader(values) {
    const registration = values[0]; // Column A
    const make = values[3]; // Column D
    const model = values[4]; // Column E

    document.getElementById('registration').textContent = registration;
    document.getElementById('makeModel').textContent = `${make} ${model}`;
}

function updateCurrentFlightHours(values) {
    const flightHours = values[6]; // Assuming flight hours are in cell G2
    document.getElementById('currentFlightHours').textContent = flightHours;
}

function updateMaintenanceReminders(values) {
    const container = document.getElementById('maintenanceReminders');
    container.innerHTML = ''; // Clear existing reminders

    let currentCategory = '';
    const categoryTitles = {
        'MX': 'General Maintenance',
        'LLP': 'Life Limited Parts',
        'Misc': 'Miscellaneous Items'
    };

    for (let i = 0; i < values.length; i++) { // Start with the first item
        const row = values[i];
        const category = row[11]; // Column L for Catagory
        const itemsToTrack = row[14]; // Column O
        const remainingTime = row[18]; // Column S
        const sendReminder = parseFloat(row[19]); // Column T
        const remainingHours = parseFloat(row[21]); // Column V
        const remainingDays = parseFloat(row[20]); // Column U
        const percentageUsed = parseFloat(row[24]); // Column Y
        let progressBarColor = '#007bff'; // Default blue

        if (remainingHours <= 0 || remainingDays <= 0) {
            progressBarColor = 'red';
        } else if (remainingHours <= sendReminder || remainingDays <= sendReminder) {
            progressBarColor = 'yellow';
        }

        if (itemsToTrack && remainingTime && !isNaN(percentageUsed)) {
            if (category !== currentCategory) {
                currentCategory = category;
                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = categoryTitles[category] || 'Unknown Category';
                container.appendChild(categoryTitle);
            }

            const reminder = document.createElement('div');
            reminder.className = 'reminder';

            const header = document.createElement('div');
            header.className = 'reminder-header';

            const item = document.createElement('div');
            item.className = 'item';
            item.textContent = itemsToTrack;

            const dueLabel = document.createElement('div');
            dueLabel.className = 'due-label';
            dueLabel.textContent = 'Due in:';

            const value = document.createElement('div');
            value.className = 'value';
            value.textContent = remainingTime;

            header.appendChild(item);
            header.appendChild(dueLabel);

            const content = document.createElement('div');
            content.className = 'reminder-content';

            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = 'Next Maintenance:';

            content.appendChild(label);
            content.appendChild(value);

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progress = document.createElement('div');
            progress.className = 'progress';
            progress.style.width = `${percentageUsed}%`;
            progress.style.backgroundColor = progressBarColor;

            progressBar.appendChild(progress);
            reminder.appendChild(header);
            reminder.appendChild(content);
            reminder.appendChild(progressBar);
            container.appendChild(reminder);
        }
    }
}

function updateSquawks(values) {
    const container = document.getElementById('maintenanceReminders');

    // Clear existing squawks section
    const existingSquawksContainer = document.getElementById('squawksContainer');
    if (existingSquawksContainer) {
        container.removeChild(existingSquawksContainer);
    }

    const squawksContainer = document.createElement('div');
    squawksContainer.className = 'squawks-container';
    squawksContainer.id = 'squawksContainer';
    const squawksTitle = document.createElement('h2');
    squawksTitle.textContent = 'Squawks';
    squawksContainer.appendChild(squawksTitle);

    const addSquawkIcon = document.createElement('span');
    addSquawkIcon.textContent = 'Add';
    addSquawkIcon.style.cursor = 'pointer';
    addSquawkIcon.style.marginLeft = '10px';
    addSquawkIcon.onclick = openSquawkInput;
    squawksTitle.appendChild(addSquawkIcon);

    const squawkInputContainer = document.createElement('div');
    squawkInputContainer.id = 'squawkInputContainer';
    squawkInputContainer.style.display = 'none';
    const squawkInput = document.createElement('input');
    squawkInput.type = 'text';
    squawkInput.id = 'newSquawk';
    squawkInput.style.width = '100%'; // Make input full width
    const squawkSaveButton = document.createElement('button');
    squawkSaveButton.textContent = 'Save';
    squawkSaveButton.onclick = saveSquawk;
    squawkInputContainer.appendChild(squawkInput);
    squawkInputContainer.appendChild(squawkSaveButton);
    squawksContainer.appendChild(squawkInputContainer);

    const squawkList = document.createElement('ol');
    squawkList.id = 'squawkList';
    squawksContainer.appendChild(squawkList);

    for (let i = 0; i < values.length; i++) {
        const squawk = values[i][25]; // Column Z for squawks
        if (squawk) {
            const squawkItems = squawk.split('\n');
            squawkItems.forEach((sq, index) => {
                const squawkItem = document.createElement('li');
                squawkItem.className = 'squawk-item';

                const squawkText = document.createElement('span');
                squawkText.textContent = sq;

                const squawkCheckbox = document.createElement('input');
                squawkCheckbox.type = 'checkbox';
                squawkCheckbox.style.marginLeft = '10px';
                squawkCheckbox.onchange = () => markSquawkComplete(index);

                squawkItem.appendChild(squawkCheckbox);
                squawkItem.appendChild(squawkText);
                squawkList.appendChild(squawkItem);
            });
        }
    }

    container.appendChild(squawksContainer);
}

function openSquawkInput() {
    const squawkInputContainer = document.getElementById('squawkInputContainer');
    squawkInputContainer.style.display = 'block';
}

function saveSquawk() {
    const newSquawk = document.getElementById('newSquawk').value;
    if (newSquawk) {
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
}

function markSquawkComplete(squawkIndex) {
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

function openDashboard() {
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';

    const container = document.getElementById('dashboardReminders');
    container.innerHTML = ''; // Clear existing reminders

    const categoryTitles = {
        'MX': 'General Maintenance',
        'LLP': 'Life Limited Parts',
        'Misc': 'Miscellaneous Items'
    };

    const dashboardItems = aircraftData.filter(row => {
        const remainingHours = parseFloat(row[21]); // Column V
        const remainingDays = parseFloat(row[20]); // Column U
        const sendReminder = parseFloat(row[19]); // Column T

        return remainingHours <= sendReminder || remainingDays <= sendReminder;
    });

    let currentAircraft = '';

    dashboardItems.forEach(row => {
        const nNumber = row[0]; // Column A
        const year = row[2]; // Column C
        const make = row[3]; // Column D
        const model = row[4]; // Column E
        const category = row[11]; // Column L for Catagory
        const itemsToTrack = row[14]; // Column O
        const remainingTime = row[18]; // Column S
        const percentageUsed = parseFloat(row[24]); // Column Y
        let progressBarColor = '#007bff'; // Default blue

        if (parseFloat(row[21]) <= 0 || parseFloat(row[20]) <= 0) {
            progressBarColor = 'red';
        } else if (parseFloat(row[21]) <= parseFloat(row[19]) || parseFloat(row[20]) <= parseFloat(row[19])) {
            progressBarColor = 'yellow';
        }

        if (nNumber !== currentAircraft) {
            currentAircraft = nNumber;
            const aircraftTitle = document.createElement('h2');
            aircraftTitle.textContent = `${nNumber} - ${year} ${make} ${model}`;
            container.appendChild(aircraftTitle);
        }

        const reminder = document.createElement('div');
        reminder.className = 'reminder';

        const header = document.createElement('div');
        header.className = 'reminder-header';

        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = itemsToTrack;

        const dueLabel = document.createElement('div');
        dueLabel.className = 'due-label';
        dueLabel.textContent = 'Due in:';

        const value = document.createElement('div');
        value.className = 'value';
        value.textContent = remainingTime;

        header.appendChild(item);
        header.appendChild(dueLabel);

        const content = document.createElement('div');
        content.className = 'reminder-content';

        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = 'Next Maintenance:';

        content.appendChild(label);
        content.appendChild(value);

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        progress.style.width = `${percentageUsed}%`;
        progress.style.backgroundColor = progressBarColor;

        progressBar.appendChild(progress);
        reminder.appendChild(header);
        reminder.appendChild(content);
        reminder.appendChild(progressBar);
        container.appendChild(reminder);
    });
}

function updateFlightHours() {
    let flightHours = document.getElementById('flightHours').value;

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
    gisLoaded();
    adjustSidebar();
});

window.addEventListener('resize', adjustSidebar);

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded.");
});

document.getElementById('updateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Update form submitted.");
    updateFlightHours();
});

document.getElementById('signout-button').addEventListener('click', function() {
    console.log("Sign out button clicked.");
    localStorage.removeItem('gapiToken');
    google.accounts.id.disableAutoSelect();
    location.reload();
});
