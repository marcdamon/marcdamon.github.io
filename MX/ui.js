function updateDisplay(nNumber) {
    selectedAircraft = nNumber;
    const aircraft = aircraftData.filter(row => row[0] === nNumber);

    if (aircraft.length > 0) {
        console.log('Displaying data for:', nNumber);
        document.getElementById('mainContainer').style.display = 'block';
        document.getElementById('dashboardContainer').style.display = 'none';

        updateHeader(aircraft[0]);
        updateCurrentFlightHours(aircraft[0]);
        updateMaintenanceReminders(aircraft);
        updateSquawks(aircraft);
    } else {
        console.log('No data found for:', nNumber);
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

    console.log("Updating maintenance reminders");

    for (let i = 0; i < values.length; i++) {
        const row = values[i];
        const category = row[10];
        const itemsToTrack = row[13];
        const remainingTime = row[17];
        const sendReminder = parseFloat(row[18]);
        const remainingHours = parseFloat(row[21]);
        const remainingDays = parseFloat(row[20]);
        const percentageUsed = parseFloat(row[23]);
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
            reminder.onclick = () => openUpdateModal(itemsToTrack);

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

function openUpdateModal(itemsToTrack) {
    console.log(`Opening update modal for item: ${itemsToTrack}`);
    const selectedRow = aircraftData.find(row => row[13] === itemsToTrack);

    if (selectedRow) {
        document.getElementById('modalHeader').textContent = itemsToTrack;

        document.getElementById('mxDate').value = selectedRow[14];
        document.getElementById('mxFlightHours').value = selectedRow[15];

        if (selectedRow[12] === 'manual') {
            console.log('Manual entry detected, showing nextServiceDueContainer');
            document.getElementById('nextServiceDueContainer').style.display = 'flex';
            document.getElementById('nextServiceDueAt').type = 'date';
            document.getElementById('nextServiceDueAt').value = selectedRow[16];
        } else {
            console.log('Non-manual entry, hiding nextServiceDueContainer');
            document.getElementById('nextServiceDueContainer').style.display = 'none';
        }

        const updateModal = document.getElementById('updateModal');
        updateModal.style.display = 'block';

        document.getElementById('itemUpdateForm').onsubmit = function(event) {
            event.preventDefault();
            const mxDate = document.getElementById('mxDate').value;
            const mxFlightHours = document.getElementById('mxFlightHours').value;
            const nextServiceDueAt = document.getElementById('nextServiceDueAt').value;
            const rowIndex = aircraftData.findIndex(row => row[13] === itemsToTrack);

            if (rowIndex !== -1) {
                aircraftData[rowIndex][14] = mxDate;
                aircraftData[rowIndex][15] = mxFlightHours;
                if (aircraftData[rowIndex][12] === 'manual') {
                    aircraftData[rowIndex][16] = nextServiceDueAt;
                }

                updateGoogleSheet(rowIndex, mxDate, mxFlightHours, nextServiceDueAt, selectedRow[12] === 'manual');
                closeUpdateModal();
            } else {
                console.error('Row not found for update.');
            }
        };
    } else {
        console.error('Row not found for modal:', itemsToTrack);
    }
}

function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('updateModal');
    if (event.target === modal) {
        closeUpdateModal();
    }
};

async function updateGoogleSheet(rowIndex, mxDate, mxFlightHours, nextServiceDueAt, isManual) {
    const range = isManual ? `Sheet1!O${rowIndex + 2}:Q${rowIndex + 2}` : `Sheet1!O${rowIndex + 2}:P${rowIndex + 2}`;
    const values = isManual ? [[mxDate, mxFlightHours, nextServiceDueAt]] : [[mxDate, mxFlightHours]];

    try {
        const response = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values
            }
        });
        console.log(`${response.result.updatedCells} cells updated.`);
        fetchSheetData();
    } catch (error) {
        console.error('Error updating Google Sheets:', error);
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
        const sendReminder = parseFloat(row[18]);

        return remainingHours <= sendReminder || remainingDays <= sendReminder;
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
        const percentageUsed = parseFloat(row[23]);
        let progressBarColor = '#007bff';

        if (parseFloat(row[21]) <= 0 || parseFloat(row[20]) <= 0) {
            progressBarColor = 'red';
        } else if (parseFloat(row[21]) <= parseFloat(row[18]) || parseFloat(row[20]) <= parseFloat(row[18])) {
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

// Ensure the openDashboard function is correctly called from the dashboard link in the sidebar menu.
document.querySelector("#aircraftList a[href='javascript:void(0)']").addEventListener("click", openDashboard);

document.addEventListener('DOMContentLoaded', function() {
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
