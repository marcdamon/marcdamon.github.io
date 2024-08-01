function updateDisplay(nNumber) {
    selectedAircraft = nNumber;
    getFlightHoursData().then(sheet => {
        const flightHoursEntry = sheet.find(row => row[0] === nNumber);
        const aircraft = aircraftData.find(row => row[0] === nNumber);
        if (aircraft) {
            document.getElementById('mainContainer').style.display = 'block';
            document.getElementById('dashboardContainer').style.display = 'none';
            document.getElementById('personalItemsContainer').style.display = 'none';

            updateHeader(aircraft);
            if (flightHoursEntry) {
                updateCurrentFlightHours(flightHoursEntry);
            } else {
                document.getElementById('currentFlightHours').textContent = "N/A";
            }
            document.getElementById('flightHours').value = '';
            updateMaintenanceReminders(aircraftData.filter(row => row[0] === nNumber));
            updateSquawks(aircraftData.filter(row => row[0] === nNumber));
        }
    }).catch(error => {
        console.error('Error fetching flight hours data:', error);
    });
}

function updateHeader(values) {
    const registration = values[0];
    const make = values[3];
    const model = values[4];

    document.getElementById('registration').textContent = registration;
    document.getElementById('makeModel').textContent = `${make} ${model}`;
}

function updateCurrentFlightHours(values) {
    const flightHours = values[1];
    document.getElementById('currentFlightHours').textContent = flightHours;
}

function getRemainingValue(row) {
    const isTimeBased = row[11] === 'time';
    return isTimeBased ? parseFloat(row[19]) : parseFloat(row[20]);
}

function updateMaintenanceReminders(values) {
    const container = document.getElementById('maintenanceReminders');
    container.innerHTML = '';

    let currentCategory = '';
    const categoryTitles = {
        'MX': 'General Maintenance',
        'LLP': 'Life Limited Parts',
        'Misc': 'Miscellaneous Items',
        'Databases': 'Database Updates'
    };

    for (let i = 0; i < values.length; i++) {
        const row = values[i];
        const category = row[10];
        const itemsToTrack = row[13];
        const remainingTime = row[17];
        const sendReminder = parseFloat(row[18]);
        const remainingValue = getRemainingValue(row);
        const percentageUsed = parseFloat(row[23]);
        let progressBarColor = '#007bff';

        if (remainingValue <= 0) {
            progressBarColor = 'red';
        } else if (remainingValue <= sendReminder) {
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
            reminder.onclick = () => openUpdateModal(itemsToTrack);

            const header = document.createElement('div');
            header.className = 'reminder-header';

            const item = document.createElement('div');
            item.className = 'item';
            item.textContent = itemsToTrack;

            const nextMaintenanceLabel = document.createElement('div');
            nextMaintenanceLabel.className = 'label';
            nextMaintenanceLabel.textContent = 'Next:';

            const nextMaintenanceValue = document.createElement('div');
            nextMaintenanceValue.className = 'value';
            nextMaintenanceValue.textContent = row[16];

            const dueLabel = document.createElement('div');
            dueLabel.className = 'label';
            dueLabel.textContent = 'Due in:';

            const value = document.createElement('div');
            value.className = 'value';
            value.textContent = remainingTime;

            const content = document.createElement('div');
            content.className = 'maintenance-container';
            content.appendChild(nextMaintenanceLabel);
            content.appendChild(nextMaintenanceValue);
            content.appendChild(dueLabel);
            content.appendChild(value);

            header.appendChild(item);
            header.appendChild(content);

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progress = document.createElement('div');
            progress.className = 'progress';
            progress.style.width = `${percentageUsed}%`;
            progress.style.backgroundColor = progressBarColor;

            progressBar.appendChild(progress);
            reminder.appendChild(header);
            reminder.appendChild(progressBar);
            container.appendChild(reminder);
        }
    }
}

function openUpdateModal(itemsToTrack) {
    const selectedRow = aircraftData.find(row => row[13] === itemsToTrack);
    if (selectedRow) {
        document.getElementById('modalHeader').textContent = itemsToTrack;
        document.getElementById('mxDate').value = selectedRow[14];
        document.getElementById('mxFlightHours').value = selectedRow[15];
        if (selectedRow[12] === 'manual') {
            document.getElementById('nextServiceDueContainer').style.display = 'flex';
            document.getElementById('nextServiceDueAt').value = selectedRow[16];
        } else {
            document.getElementById('nextServiceDueContainer').style.display = 'none';
        }
        document.getElementById('updateModal').style.display = 'block';
    }
}

function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}

function updateSquawks(values) {
    const container = document.getElementById('maintenanceReminders');

    const existingSquawksContainer = document.getElementById('squawksContainer');
    if (existingSquawksContainer) {
        existingSquawksContainer.remove();
    }

    const squawksContainer = document.createElement('div');
    squawksContainer.className = 'squawks-container';
    squawksContainer.id = 'squawksContainer';
    const squawksTitle = document.createElement('h2');
    squawksTitle.textContent = 'Squawks';

    const addSquawkIcon = document.createElement('span');
    addSquawkIcon.textContent = 'Add';
    addSquawkIcon.className = 'add-squawk-icon';
    addSquawkIcon.onclick = openSquawkInput;
    squawksTitle.appendChild(addSquawkIcon);

    squawksContainer.appendChild(squawksTitle);

    const squawkInputContainer = document.createElement('div');
    squawkInputContainer.id = 'squawkInputContainer';
    squawkInputContainer.style.display = 'none';
    const squawkInput = document.createElement('input');
    squawkInput.type = 'text';
    squawkInput.id = 'newSquawk';
    squawkInput.placeholder = 'Enter new squawk';
    squawkInputContainer.appendChild(squawkInput);

    const squawkSaveButton = document.createElement('button');
    squawkSaveButton.textContent = 'Save';
    squawkSaveButton.onclick = saveSquawk;
    squawkInputContainer.appendChild(squawkSaveButton);

    const squawkCloseButton = document.createElement('button');
    squawkCloseButton.textContent = 'Close';
    squawkCloseButton.onclick = closeSquawkInput;
    squawkInputContainer.appendChild(squawkCloseButton);

    squawksContainer.appendChild(squawkInputContainer);

    const squawkList = document.createElement('ol');
    squawkList.id = 'squawkList';
    squawksContainer.appendChild(squawkList);

    for (let i = 0; i < values.length; i++) {
        const squawk = values[i][24];
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

function closeSquawkInput() {
    const squawkInputContainer = document.getElementById('squawkInputContainer');
    squawkInputContainer.style.display = 'none';
}

function saveSquawk() {
    const newSquawk = document.getElementById('newSquawk').value;
    if (newSquawk) {
        const rowIndex = aircraftData.findIndex(row => row[0] === selectedAircraft);
        if (rowIndex !== -1) {
            if (!aircraftData[rowIndex][24]) {
                aircraftData[rowIndex][24] = newSquawk;
            } else {
                aircraftData[rowIndex][24] += `\n${newSquawk}`;
            }
            const cellAddress = `Sheet1!Y${rowIndex + 2}`;
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: cellAddress,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[aircraftData[rowIndex][24]]]
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
        const squawks = aircraftData[rowIndex][24].split('\n');
        squawks.splice(squawkIndex, 1);
        aircraftData[rowIndex][24] = squawks.join('\n');
        const cellAddress = `Sheet1!Y${rowIndex + 2}`;
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: cellAddress,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[aircraftData[rowIndex][24]]]
            }
        }).then((response) => {
            console.log(`${response.result.updatedCells} cells updated.`);
            updateSquawks([aircraftData[rowIndex]]);
        }, function(error) {
            console.error('Error updating Google Sheets:', error);
        });
    }
}


function showPersonalItems() {
    console.log("Personal Items link clicked");
    selectedAircraft = null;
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'none';
    const personalItemsContainer = document.getElementById('personalItemsContainer');
    personalItemsContainer.style.display = 'block';

    const personalItemsReminders = document.getElementById('personalItemsReminders');
    if (personalItemsReminders) {
        console.log('Personal items container found:', personalItemsReminders);
        updatePersonalItems(personalItemsData);
    } else {
        console.error('Personal items container not found');
    }
}










function formatRemainingDays(days) {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}, `;
    if (months > 0) result += `${months} month${months > 1 ? 's' : ''}, `;
    result += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;

    return result;
}













function updatePersonalItems(values) {
    console.log("Updating personal items");
    const container = document.getElementById('personalItemsReminders');
    container.innerHTML = '';

    let currentCategory = '';
    const categoryTitles = {
        'Pilot': 'Pilot Items',
        'Personal': 'Personal Items'
    };

    values.forEach((row, index) => {
        console.log('Processing row:', row);

        const category = row[2];
        const itemsToTrack = row[4];
        const remainingDays = parseInt(row[8]); // Column I
        const nextActionDueDate = row[6]; // Next Action Due Date
        const sendReminder = parseFloat(row[7]);
        const remainingValue = parseFloat(row[9]);
        let percentageUsedStr = row[11];

        console.log('Raw percentageUsedStr:', percentageUsedStr);

        if (percentageUsedStr === undefined || percentageUsedStr === null || percentageUsedStr.trim() === '') {
            console.warn('percentageUsedStr is undefined or empty for row:', row);
            percentageUsedStr = '0%';
        }

        const percentageUsed = parseFloat(percentageUsedStr.replace('%', ''));
        let progressBarColor = '#007bff';

        console.log(`Processing item: ${itemsToTrack}, category: ${category}, percentageUsed: ${percentageUsed}`);

        if (remainingValue <= 0) {
            progressBarColor = 'red';
        } else if (remainingValue <= sendReminder) {
            progressBarColor = 'yellow';
        }

        if (itemsToTrack && !isNaN(remainingDays) && !isNaN(percentageUsed)) {
            if (category !== currentCategory) {
                currentCategory = category;
                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = categoryTitles[category] || 'Unknown Category';
                container.appendChild(categoryTitle);
                console.log(`Added category title: ${categoryTitles[category] || 'Unknown Category'}`);
            }

            const reminder = document.createElement('div');
            reminder.className = 'reminder';

            const header = document.createElement('div');
            header.className = 'reminder-header';

            const item = document.createElement('div');
            item.className = 'item';
            item.textContent = itemsToTrack;

            const nextMaintenanceLabel = document.createElement('div');
            nextMaintenanceLabel.className = 'label';
            nextMaintenanceLabel.textContent = 'Next:';

            const nextMaintenanceValue = document.createElement('div');
            nextMaintenanceValue.className = 'value';
            nextMaintenanceValue.textContent = nextActionDueDate;

            const dueLabel = document.createElement('div');
            dueLabel.className = 'label';
            dueLabel.textContent = 'Due in:';

            const value = document.createElement('div');
            value.className = 'value';
            value.textContent = formatRemainingDays(remainingDays); // Use formatted remaining days

            const content = document.createElement('div');
            content.className = 'maintenance-container';
            content.appendChild(nextMaintenanceLabel);
            content.appendChild(nextMaintenanceValue);
            content.appendChild(dueLabel);
            content.appendChild(value);

            header.appendChild(item);
            header.appendChild(content);

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progress = document.createElement('div');
            progress.className = 'progress';
            progress.style.width = `${percentageUsed}%`;
            progress.style.backgroundColor = progressBarColor;

            progressBar.appendChild(progress);
            reminder.appendChild(header);
            reminder.appendChild(progressBar);
            container.appendChild(reminder);

            console.log(`Added reminder: ${itemsToTrack}`);
        } else {
            console.error(`Skipping item due to invalid data: itemsToTrack=${itemsToTrack}, remainingDays=${remainingDays}, percentageUsed=${percentageUsed}`);
        }
    });
}




















function openDashboard() {
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    document.getElementById('personalItemsContainer').style.display = 'none';

    const container = document.getElementById('dashboardReminders');
    container.innerHTML = '';

    const categoryTitles = {
        'MX': 'General Maintenance',
        'LLP': 'Life Limited Parts',
        'Misc': 'Miscellaneous Items',
        'Databases': 'Database Updates'
    };

    const dashboardItems = aircraftData.filter(row => {
        const remainingValue = getRemainingValue(row);
        const sendReminder = parseFloat(row[18]);
        return remainingValue <= sendReminder;
    });

    let currentAircraft = '';

    dashboardItems.forEach(row => {
        const nNumber = row[0];
        const year = row[2];
        const make = row[3];
        const model = row[4];
        const category = row[10];
        const itemsToTrack = row[13];
        const remainingTime = row[17];
        const remainingValue = getRemainingValue(row);
        const percentageUsed = parseFloat(row[23]);
        let progressBarColor = '#007bff';

        if (remainingValue <= 0) {
            progressBarColor = 'red';
        } else if (remainingValue <= parseFloat(row[18])) {
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
        reminder.onclick = () => openUpdateModal(itemsToTrack);

        const header = document.createElement('div');
        header.className = 'reminder-header';

        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = itemsToTrack;

        const nextMaintenanceLabel = document.createElement('div');
        nextMaintenanceLabel.className = 'label';
        nextMaintenanceLabel.textContent = 'Next:';

        const nextMaintenanceValue = document.createElement('div');
        nextMaintenanceValue.className = 'value';
        nextMaintenanceValue.textContent = row[16];

        const dueLabel = document.createElement('div');
        dueLabel.className = 'label';
        dueLabel.textContent = 'Due in:';

        const value = document.createElement('div');
        value.className = 'value';
        value.textContent = remainingTime;

        const content = document.createElement('div');
        content.className = 'maintenance-container';
        content.appendChild(nextMaintenanceLabel);
        content.appendChild(nextMaintenanceValue);
        content.appendChild(dueLabel);
        content.appendChild(value);

        header.appendChild(item);
        header.appendChild(content);

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        progress.style.width = `${percentageUsed}%`;
        progress.style.backgroundColor = progressBarColor;

        progressBar.appendChild(progress);
        reminder.appendChild(header);
        reminder.appendChild(progressBar);
        container.appendChild(reminder);
    });
}
