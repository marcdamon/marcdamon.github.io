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
    const registration = values[0];
    const make = values[3];
    const model = values[4];

    document.getElementById('registration').textContent = registration;
    document.getElementById('makeModel').textContent = `${make} ${model}`;
}

function updateCurrentFlightHours(values) {
    const flightHours = values[6];
    document.getElementById('currentFlightHours').textContent = flightHours;
}

function updateMaintenanceReminders(values) {
    const container = document.getElementById('maintenanceReminders');
    container.innerHTML = '';

    let currentCategory = '';
    const categoryTitles = {
        'MX': 'General Maintenance',
        'LLP': 'Life Limited Parts',
        'Misc': 'Miscellaneous Items'
    };

    for (let i = 0; i < values.length; i++) {
        const row = values[i];
        const category = row[11];
        const itemsToTrack = row[14];
        const remainingTime = row[18];
        const sendReminder = parseFloat(row[19]);
        const remainingHours = parseFloat(row[21]);
        const remainingDays = parseFloat(row[20]);
        const percentageUsed = parseFloat(row[24]);
        let progressBarColor = '#007bff';

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
    squawkInput.style.width = '100%';
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
        const squawk = values[i][25];
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
                aircraftData[rowIndex][25] = newSquawk;
            } else {
                aircraftData[rowIndex][25] += `\n${newSquawk}`;
            }
            const cellAddress = `Sheet1!Z${rowIndex + 2}`;
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: cellAddress,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[aircraftData[rowIndex][25]]]
                }
            }).then((response) => {
                console.log(`${response.result.updatedCells} cells updated.`);
                document.getElementById('newSquawk').value = '';
                updateSquawks([aircraftData[rowIndex]]);
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
        const cellAddress = `Sheet1!Z${rowIndex + 2}`;
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: cellAddress,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[aircraftData[rowIndex][25]]]
            }
        }).then((response) => {
            console.log(`${response.result.updatedCells} cells updated.`);
            updateSquawks([aircraftData[rowIndex]]);
        }, function(error) {
            console.error('Error updating Google Sheets:', error);
        });
    }
}

function openDashboard() {
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';

    const container = document.getElementById('dashboardReminders');
    container.innerHTML = '';

    const categoryTitles = {
        'MX': 'General Maintenance',
        'LLP': 'Life Limited Parts',
        'Misc': 'Miscellaneous Items'
    };

    const dashboardItems = aircraftData.filter(row => {
        const remainingHours = parseFloat(row[21]);
        const remainingDays = parseFloat(row[20]);
        const sendReminder = parseFloat(row[19]);

        return remainingHours <= sendReminder || remainingDays <= sendReminder;
    });

    let currentAircraft = '';

    dashboardItems.forEach(row => {
        const nNumber = row[0];
        const year = row[2];
        const make = row[3];
        const model = row[4];
        const category = row[11];
        const itemsToTrack = row[14];
        const remainingTime = row[18];
        const percentageUsed = parseFloat(row[24]);
        let progressBarColor = '#007bff';

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
