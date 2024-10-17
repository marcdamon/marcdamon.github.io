document.addEventListener('DOMContentLoaded', function() {
    // Load checklists from JSON
    async function loadChecklists() {
        try {
            const response = await fetch('checklists.json');
            const data = await response.json();
            const warnings = data.checklists.warnings;
            populateWarningList(warnings);

            // Automatically display the first checklist when the page loads
            if (warnings.length > 0) {
                displayChecklist(warnings[0]); // Display the first checklist by default
            }
        } catch (error) {
            console.error('Error loading checklists:', error);
        }
    }

    // Populate the warning list
    function populateWarningList(warnings) {
        const warningList = document.getElementById('warning-items');
        warningList.innerHTML = ''; // Clear existing list

        warnings.forEach((warning) => {
            const listItem = document.createElement('li');
            listItem.innerText = warning.title;
            listItem.classList.add('warning-item');
            listItem.addEventListener('click', () => displayChecklist(warning));
            warningList.appendChild(listItem);
        });
    }

    function displayChecklist(warning) {
        const title = document.getElementById('checklist-title');
        const description = document.getElementById('checklist-description');
        const stepsList = document.getElementById('checklist-steps');
        const notesList = document.getElementById('checklist-notes');
        const label = document.getElementById('checklist-type'); // New element for "Warning" label

        // Clear previous content
        label.innerText = ''; // Clear previous label
        title.innerText = warning.title;
        description.innerText = warning.description;
        stepsList.innerHTML = ''; 
        notesList.innerHTML = ''; 

        // Set the type of checklist (e.g., 'Warning', 'Emergency')
        if (warning.title.includes("Warning")) {
            label.innerText = 'Warning'; // Only change the text
        } else if (warning.title.includes("Emergency")) {
            label.innerText = 'Emergency'; // You can expand this for different types
        } else {
            label.innerText = ''; // Clear the label if no type
        }

        // Render steps in the correct order
        warning.steps.forEach(step => {
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
                warningText.classList.add('warning-text'); // Adjust for type, but keep visible
                warningText.innerText = step.text;
                stepItem.appendChild(warningText);
            }

            stepsList.appendChild(stepItem);
        });

        // Display notes after steps
        if (warning.notes && warning.notes.length > 0) {
            warning.notes.forEach(note => {
                const noteItem = document.createElement('p');
                noteItem.classList.add('note-item');
                noteItem.innerText = note.text;
                notesList.appendChild(noteItem);
            });
        }

        // Add "Procedure Complete" if present
        if (warning.procedureComplete) {
            const completeItem = document.createElement('li');
            completeItem.classList.add('procedure-complete');
            completeItem.innerText = "Procedure Complete";
            stepsList.appendChild(completeItem);
        }
    }

    // Initial call to load the checklists
    loadChecklists();
});
