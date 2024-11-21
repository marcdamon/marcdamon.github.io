document.addEventListener('DOMContentLoaded', function () {
    let checklistsData = {}; // Store all checklists data
    let selectedChecklistIndex = 0; // Keep track of selected checklist index
    let selectedChecklistType = 'normalProcedures'; // Updated default checklist type
    let currentStepIndex = 0; // Keep track of current step in the checklist

    /**
     * Handles the selection styling for category buttons.
     * Excludes the "Go to Next Checklist?" button to prevent interference.
     * @param {HTMLElement} button - The button element that was clicked.
     */
    function handleButtonSelection(button) {
        // Select all category buttons (exclude "Go to Next Checklist?" button)
        const allButtons = document.querySelectorAll('.button-left, .button-right');

        // Remove 'selected' class and set 'aria-pressed' to false for all buttons
        allButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
        });

        // Add 'selected' class and set 'aria-pressed' to true for the clicked button
        button.classList.add('selected');
        button.setAttribute('aria-pressed', 'true');
    }

    /**
     * Moves to the next checklist within the current category.
     * If at the end, wraps around to the first checklist.
     */
    function moveToNextChecklist() {
        const checklistArray = checklistsData[selectedChecklistType];
        if (!checklistArray || checklistArray.length === 0) return;

        selectedChecklistIndex++;
        if (selectedChecklistIndex >= checklistArray.length) {
            // If at the end of the current category, wrap to the first checklist
            selectedChecklistIndex = 0;
        }

        // Display the next checklist
        displayChecklist(checklistArray[selectedChecklistIndex], selectedChecklistType, selectedChecklistIndex);

        // Highlight the selected checklist in the list
        highlightSelectedChecklist(selectedChecklistIndex);
    }

    /**
     * Loads checklists from the JSON file and initializes the default view.
     */
    async function loadChecklists() {
        try {
            const response = await fetch('checklists.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            checklistsData = data.checklists; // Store checklists globally

            // By default, load normal procedures
            populateChecklistList(checklistsData.normalProcedures, 'normalProcedures');

            // Automatically display the first checklist from "Normal" by default
            if (checklistsData.normalProcedures.length > 0) {
                displayChecklist(checklistsData.normalProcedures[0], 'normalProcedures', 0); // Display the first normal procedure by default
            }

            // Highlight the "Normal" button by default
            const normalButton = document.querySelector('.button-right[data-type="normal"]');
            if (normalButton) {
                handleButtonSelection(normalButton);
            }

            // Attach event listeners to all category buttons after loading checklists
            attachButtonListeners();
        } catch (error) {
            console.error('Error loading checklists:', error);
            alert('Failed to load checklists. Please try again later.');
        }
    }

    /**
     * Populates the checklist list based on the selected category.
     * @param {Array} checklistType - Array of checklists for the selected category.
     * @param {string} typeKey - Key representing the selected category.
     */
    function populateChecklistList(checklistType, typeKey) {
        const checklistItems = document.getElementById('warning-items');
        checklistItems.innerHTML = ''; // Clear existing list

        checklistType.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerText = item.title;
            listItem.classList.add('warning-item');

            // Add event listener for highlighting the selected checklist
            listItem.addEventListener('click', () => {
                displayChecklist(item, typeKey, index);
                highlightSelectedChecklist(index);
            });

            checklistItems.appendChild(listItem);
        });

        // Automatically highlight the first checklist item by default
        if (checklistType.length > 0) {
            highlightSelectedChecklist(0);
        }

        // Reset scroll position of the checklist titles list to the top
        const checklistContainer = document.querySelector('.checklist-items-container');
        if (checklistContainer) {
            checklistContainer.scrollTop = 0;
        }
    }

    /**
     * Highlights the selected checklist item in the list and scrolls it into view.
     * @param {number} selectedIndex - Index of the selected checklist.
     */
    function highlightSelectedChecklist(selectedIndex) {
        const checklistItems = document.querySelectorAll('.warning-item');

        checklistItems.forEach((item, index) => {
            // Remove highlight and ARIA attribute from all items
            item.classList.remove('selected-item');
            item.setAttribute('aria-selected', 'false');

            // Add highlight and ARIA attribute only to the selected item
            if (index === selectedIndex) {
                console.log(`Highlighting checklist at index: ${index}`);
                item.classList.add('selected-item');
                item.setAttribute('aria-selected', 'true');

                // Scroll the selected item into view within the checklist list container
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // 'start', 'center', 'end', 'nearest'
                    inline: 'nearest'
                });
            }
        });

        selectedChecklistIndex = selectedIndex; // Update the selected index
    }

    /**
     * Displays the selected checklist and manages the "Go to Next Checklist?" button.
     * @param {Object} item - The checklist item to display.
     * @param {string} typeKey - Key representing the selected category.
     * @param {number} selectedIndex - Index of the selected checklist.
     */
    function displayChecklist(item, typeKey, selectedIndex) {
        const title = document.getElementById('checklist-title');
        const description = document.getElementById('checklist-description');
        const stepsList = document.getElementById('checklist-steps');
        const notesList = document.getElementById('checklist-notes');
        const label = document.getElementById('checklist-type'); // For displaying the "Normal", "Emergency", etc.
        const checklistDisplay = document.querySelector('.checklist-display'); // Existing container
        const goNextButton = document.getElementById('go-next-checklist'); // Reference to the button

        // Set the checklist type label based on the passed typeKey
        switch (typeKey) {
            case 'warnings':
                label.innerText = 'Warning';
                break;
            case 'emergencies':
                label.innerText = 'Emergency';
                break;
            case 'abnormalProcedures':
                label.innerText = 'Abnormal';
                break;
            case 'cautionAF':
                label.innerText = 'Caution A-F';
                break;
            case 'cautionGZ':
                label.innerText = 'Caution G-Z';
                break;
            case 'normalProcedures':
                label.innerText = 'Normal';
                break;
            default:
                label.innerText = '';
                break;
        }

        // Update global variables
        selectedChecklistType = typeKey;
        selectedChecklistIndex = selectedIndex;
        currentStepIndex = 0; // Reset current step index when a new checklist is displayed

        // Update the checklist title and content
        title.innerText = item.title;
        description.innerText = item.description || '';
        stepsList.innerHTML = '';
        notesList.innerHTML = '';

        // Render steps
        item.steps.forEach((step, index) => {
            const stepItem = document.createElement('li');
            stepItem.classList.add('step-item');

            if (step.stepType === 'checkbox' || step.stepType === 'substep') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `step-${index}`;
                stepItem.appendChild(checkbox);

                const label = document.createElement('label');
                label.htmlFor = `step-${index}`; // Ensure the label is correctly linked
                label.classList.add('step-text');
                label.innerText = step.step;

                // **Conditional Dots Span**
                let dots;
                if (step.action) {
                    dots = document.createElement('span');
                    dots.classList.add('dots');
                }

                const actionText = document.createElement('span');
                actionText.classList.add('action-text');
                if (step.action) {
                    actionText.innerText = step.action;
                }

                stepItem.appendChild(label);
                if (step.action) {
                    stepItem.appendChild(dots); // Append dots only if action exists
                }
                stepItem.appendChild(actionText);

                // Add event listener for checkbox to toggle text color and auto-scroll
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        markStepAsChecked(index);
                    } else {
                        unmarkStepAsChecked(index);
                    }
                });
            } else if (step.stepType === 'note' || step.stepType === 'special') {
                const specialText = document.createElement('span');
                specialText.classList.add('special-text');
                specialText.innerText = step.text;
                stepItem.appendChild(specialText);
            } else if (step.stepType === 'procedureComplete') {
                const completeItem = document.createElement('li');
                completeItem.classList.add('procedure-complete');
                completeItem.innerText = step.text;
                stepsList.appendChild(completeItem);
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

        // Remove 'selected-item' from all steps (in case of reloading)
        const allSteps = document.querySelectorAll('#checklist-steps .step-item');
        allSteps.forEach(step => step.classList.remove('selected-item'));

        // Assign 'selected-item' to the first checkbox step
        const firstCheckboxStep = findNextCheckboxStep(0, allSteps);
        if (firstCheckboxStep) {
            firstCheckboxStep.classList.add('selected-item');
            currentStepIndex = Array.from(allSteps).indexOf(firstCheckboxStep);
            scrollToSelectedItem(firstCheckboxStep); // Center the first step
        }

        // Scroll the checklist display area to the top
        setTimeout(() => {
            const checklistContent = document.querySelector('.checklist-display');
            if (checklistContent) {
                checklistContent.scrollTop = 0;
            }
        }, 0);

        // Highlight the selected checklist in the list
        highlightSelectedChecklist(selectedIndex);
    }

    /**
     * Finds the next checklist step that includes a checkbox starting from a given index.
     * @param {number} startIndex - The index to start searching from.
     * @param {NodeList} stepItems - The list of step items.
     * @returns {HTMLElement|null} - The next checkbox step item or null if none found.
     */
    function findNextCheckboxStep(startIndex, stepItems) {
        for (let i = startIndex; i < stepItems.length; i++) {
            const checkbox = stepItems[i].querySelector('input[type="checkbox"]');
            if (checkbox) {
                return stepItems[i];
            }
        }
        return null;
    }

    /**
     * Scrolls the selected step item into view, centering it within the scrollable container.
     * @param {HTMLElement} element - The selected step item element.
     */
    function scrollToSelectedItem(element) {
        if (!element) {
            console.error('Element to scroll to is not defined.');
            return;
        }

        // Use scrollIntoView with 'center' to keep the element in the middle
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // Centers the element vertically
            inline: 'nearest' // No horizontal scrolling
        });

        console.log(`Scrolled to element:`, element);
    }

    /**
     * Marks a step as checked and moves the selection to the next checkbox step.
     * @param {number} index - The index of the step to mark as checked.
     */
    function markStepAsChecked(index) {
        const stepItems = document.querySelectorAll('#checklist-steps .step-item');
        const currentStep = stepItems[index];
        if (currentStep) {
            currentStep.classList.add('checked'); // Add checked class for styling

            // Remove 'selected-item' from the current step
            currentStep.classList.remove('selected-item');

            // Find and assign 'selected-item' to the next checkbox step
            const nextStep = findNextCheckboxStep(index + 1, stepItems);
            if (nextStep) {
                nextStep.classList.add('selected-item');
                currentStepIndex = Array.from(stepItems).indexOf(nextStep);

                // Scroll to the next step, centering it
                scrollToSelectedItem(nextStep);
            } else {
                // If no more checkbox steps, optionally handle end of checklist
                console.log('All steps completed.');
            }
        }
    }

    /**
     * Unmarks a step as checked and updates the selection.
     * @param {number} index - The index of the step to unmark.
     */
    function unmarkStepAsChecked(index) {
        const stepItems = document.querySelectorAll('#checklist-steps .step-item');
        const step = stepItems[index];
        if (step) {
            step.classList.remove('checked'); // Remove checked class

            // Reassign 'selected-item' to this step if it's not already selected
            if (!step.classList.contains('selected-item')) {
                step.classList.add('selected-item');
                currentStepIndex = index;
                scrollToSelectedItem(step);
            }
        }
    }

    /**
     * Attaches event listeners to all category buttons dynamically.
     */
    function attachButtonListeners() {
        const allButtons = document.querySelectorAll('.button-left, .button-right');

        allButtons.forEach(button => {
            button.addEventListener('click', function () {
                handleButtonSelection(this); // Manage selection styling

                const typeKey = this.getAttribute('data-type'); // Get the data-type attribute

                // Map data-type to the corresponding key in checklistsData
                let mappedTypeKey = '';
                switch (typeKey) {
                    case 'warning':
                        mappedTypeKey = 'warnings';
                        break;
                    case 'emergency':
                        mappedTypeKey = 'emergencies';
                        break;
                    case 'abnormal procedures':
                        mappedTypeKey = 'abnormalProcedures';
                        break;
                    case 'caution a-f':
                        mappedTypeKey = 'cautionAF';
                        break;
                    case 'caution g-z':
                        mappedTypeKey = 'cautionGZ';
                        break;
                    case 'normal':
                        mappedTypeKey = 'normalProcedures';
                        break;
                    // Add more cases if there are more categories
                    default:
                        mappedTypeKey = '';
                }

                if (mappedTypeKey && checklistsData[mappedTypeKey]) {
                    populateChecklistList(checklistsData[mappedTypeKey], mappedTypeKey); // Load selected category
                    if (checklistsData[mappedTypeKey].length > 0) {
                        displayChecklist(checklistsData[mappedTypeKey][0], mappedTypeKey, 0); // Display the first checklist in the selected category
                    }
                }
            });
        });
    }

    /**
     * Event listener for the 'Select' button to check off items.
     */
    document.getElementById('select-button').addEventListener('click', function () {
        checkNextCheckbox();
    });

    /**
     * Function to check the next unchecked checkbox. If none are left, move to the next checklist.
     */
    function checkNextCheckbox() {
        // Get the current checklist array
        let checklistArray = checklistsData[selectedChecklistType];
        if (!checklistArray || checklistArray.length === 0) return;

        let currentChecklist = checklistArray[selectedChecklistIndex];
        let steps = currentChecklist.steps;
        let stepItems = document.querySelectorAll('#checklist-steps .step-item');

        // Flag to indicate whether we found a checkbox to check
        let foundCheckbox = false;

        while (currentStepIndex < steps.length) {
            // Get the corresponding step item in the DOM
            let stepItem = stepItems[currentStepIndex];
            if (stepItem) {
                // Find the checkbox in the step item
                let checkbox = stepItem.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) {
                    // Check the checkbox
                    checkbox.checked = true;
                    // Trigger the change event
                    checkbox.dispatchEvent(new Event('change'));
                    foundCheckbox = true;
                    break;
                }
            }
            // Move to the next step
            currentStepIndex++;
        }

        if (!foundCheckbox) {
            // At the end of the steps, or no more checkboxes, move to the next checklist
            moveToNextChecklist();
            currentStepIndex = 0;
        }
    }

    /**
     * Event listener for the "Go to Next Checklist?" button.
     * Simplified: No class manipulation.
     */
    document.getElementById('go-next-checklist').addEventListener('click', function () {
        moveToNextChecklist();
    });

    // Initial call to load the checklists
    loadChecklists();
});