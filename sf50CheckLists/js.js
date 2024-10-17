document.addEventListener('DOMContentLoaded', function () {
    let checklistsData = {}; // Store all checklists data

    // Load checklists from JSON
    async function loadChecklists() {
        try {
            const response = await fetch('checklists.json');
            const data = await response.json();
            checklistsData = data.checklists; // Store checklists globally

            // By default, load warnings
            populateChecklistList(checklistsData.warnings);

            // Automatically display the first checklist from "Warnings" by default
            if (checklistsData.warnings.length > 0) {
                displayChecklist(checklistsData.warnings[0], 'warning'); // Display the first warning by default
            }
        } catch (error) {
            console.error('Error loading checklists:', error);
        }
    }

    // Populate the list with checklists (Warning, Emergency, etc.)
    function populateChecklistList(checklistType) {
        const checklistItems = document.getElementById('warning-items');
        checklistItems.innerHTML = ''; // Clear existing list

        checklistType.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.innerText = item.title;
            listItem.classList.add('warning-item');
            listItem.addEventListener('click', () => displayChecklist(item, checklistType)); // Pass checklist type
            checklistItems.appendChild(listItem);
        });
    }

    function displayChecklist(item, type) {
        const title = document.getElementById('checklist-title');
        const description = document.getElementById('checklist-description');
        const stepsList = document.getElementById('checklist-steps');
        const notesList = document.getElementById('checklist-notes');
        const label = document.getElementById('checklist-type'); // For displaying the "Warning", "Emergency", etc.

        // Set the checklist type label based on the passed type
        if (type === checklistsData.warnings) {
            label.innerText = 'Warning';
        } else if (type === checklistsData.emergencies) {
            label.innerText = 'Emergency';
        } else if (type === checklistsData.abnormalProcedures) {
            label.innerText = 'Abnormal';
        } else if (type === checklistsData.cautionAF) {
            label.innerText = 'Caution A-F';
        } else if (type === checklistsData.cautionGZ) {
            label.innerText = 'Caution G-Z';
        } else {
            label.innerText = ''; // Clear the label if no type matches
        }

        // Update the checklist title and content
        title.innerText = item.title;
        description.innerText = item.description;
        stepsList.innerHTML = '';
        notesList.innerHTML = '';

        // Render steps
        item.steps.forEach(step => {
            const stepItem = document.createElement('li');
            stepItem.classList.add('step-item');

            if (step.stepType === 'checkbox' || step.stepType === 'substep') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                stepItem.appendChild(checkbox);

                const stepText = document.createElement('span');
                stepText.classList.add('step-text');
                stepText.innerText = step.step;

                const actionText = document.createElement('span');
                actionText.classList.add('action-text');
                if (step.action) {
                    actionText.innerText = step.action;
                }

                stepItem.appendChild(stepText);
                stepItem.appendChild(actionText);

                // Add event listener for checkbox to toggle text color
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        stepItem.classList.add('checked'); // Add checked class for styling
                        stepText.style.color = '#3cb62e'; // Apply green color to text
                        actionText.style.color = '#3cb62e'; // Apply green color to action text
                    } else {
                        stepItem.classList.remove('checked'); // Remove checked class
                        stepText.style.color = 'white'; // Revert text color
                        actionText.style.color = 'white'; // Revert action text color
                    }
                });
            } else if (step.stepType === 'note' || step.stepType === 'special') {
                const specialText = document.createElement('span');
                specialText.classList.add('special-text');
                specialText.innerText = step.text;
                stepItem.appendChild(specialText);
            } else if (step.stepType === 'procedureComplete') {
                stepItem.classList.add('procedure-complete');
                stepItem.innerText = step.text;
            } else if (step.stepType === 'warning' || step.stepType === 'caution') {
                const warningText = document.createElement('span');
                warningText.classList.add('warning-text');
                warningText.innerText = step.text;
                stepItem.appendChild(warningText);
            }

            stepsList.appendChild(stepItem);
        });

        // Display notes after steps
        if (item.notes && item.notes.length > 0) {
            item.notes.forEach(note => {
                const noteItem = document.createElement('p');
                noteItem.classList.add('note-item');
                noteItem.innerText = note.text;
                notesList.appendChild(noteItem);
            });
        }

        // Add "Procedure Complete" if present
        if (item.procedureComplete) {
            const completeItem = document.createElement('li');
            completeItem.classList.add('procedure-complete');
            completeItem.innerText = "Procedure Complete";
            stepsList.appendChild(completeItem);
        }
    }

    // Event listeners for the side buttons
    document.querySelector('.button-left[data-type="warning"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.warnings); // Load warnings when "Warning" button is clicked
        if (checklistsData.warnings.length > 0) {
            displayChecklist(checklistsData.warnings[0], checklistsData.warnings); // Automatically display the first warning when clicked
        }
    });

    document.querySelector('.button-left[data-type="emergency"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.emergencies); // Load emergencies when "Emergency" button is clicked
        if (checklistsData.emergencies.length > 0) {
            displayChecklist(checklistsData.emergencies[0], checklistsData.emergencies); // Automatically display the first emergency when clicked
        }
    });

    // Add listeners for the other checklist types (e.g., Abnormal Procedures, Caution A-F, Caution G-Z)
    document.querySelector('.button-left[data-type="abnormal procedures"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.abnormalProcedures);
        if (checklistsData.abnormalProcedures.length > 0) {
            displayChecklist(checklistsData.abnormalProcedures[0], checklistsData.abnormalProcedures);
        }
    });

    document.querySelector('.button-left[data-type="caution a-f"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.cautionAF);
        if (checklistsData.cautionAF.length > 0) {
            displayChecklist(checklistsData.cautionAF[0], checklistsData.cautionAF);
        }
    });

    document.querySelector('.button-left[data-type="caution g-z"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.cautionGZ);
        if (checklistsData.cautionGZ.length > 0) {
            displayChecklist(checklistsData.cautionGZ[0], checklistsData.cautionGZ);
        }
    });

    // Add listeners for right-side buttons (if you have separate data for Advisory, Normal, etc.)
    document.querySelector('.button-right[data-type="advisory"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.advisory);
    });

    document.querySelector('.button-right[data-type="normal"]').addEventListener('click', function () {
        populateChecklistList(checklistsData.normal);
    });

    document.querySelector('.button-right[data-type="checklist options"]').addEventListener('click', function () {
        console.log('Checklist Options button clicked');
    });

    // Initial call to load the checklists
    loadChecklists();
});
