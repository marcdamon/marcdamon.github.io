export function updateAircraftList(data) {
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

export function updateDisplay(nNumber) {
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

export function updateHeader(values) {
    const registration = values[0]; // Column A
    const make = values[3]; // Column D
    const model = values[4]; // Column E

    document.getElementById('registration').textContent = registration;
    document.getElementById('makeModel').textContent = `${make} ${model}`;
}

export function updateCurrentFlightHours(values) {
    const flightHours = values[6]; // Assuming flight hours are in cell G2
    document.getElementById('currentFlightHours').textContent = flightHours;
}

export function updateMaintenanceReminders(values) {
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
        const category = row[11]; // Column L for Category
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

export function updateSquawks(values) {
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
