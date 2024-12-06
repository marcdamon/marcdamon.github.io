document.addEventListener('DOMContentLoaded', function () {
    let checklistsData = {}; // Store all checklists data
    let selectedChecklistIndex = 0; // Keep track of selected checklist index
    let selectedChecklistType = 'normalProcedures'; // Updated default checklist type
    let currentStepIndex = 0; // Keep track of current step in the checklist

    /**
     * Debounce function to limit the rate at which a function can fire.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    function debounce(func, delay) {
        let inDebounce;
        return function(...args) {
            if (inDebounce) return;
            func.apply(this, args);
            inDebounce = true;
            setTimeout(() => inDebounce = false, delay);
        }
    }

    /**
     * Handles the selection styling for category buttons.
     * @param {HTMLElement} button - The button element that was clicked.
     */
    function handleButtonSelection(button) {
        const allButtons = document.querySelectorAll('.button-left, .button-right');
        allButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('selected');
        button.setAttribute('aria-pressed', 'true');
    }

    /**
     * Moves to the next checklist within the current category.
     */
    function moveToNextChecklist() {
        const checklistArray = checklistsData[selectedChecklistType];
        if (!checklistArray || checklistArray.length === 0) return;

        selectedChecklistIndex++;
        if (selectedChecklistIndex >= checklistArray.length) {
            selectedChecklistIndex = 0;
        }

        displayChecklist(checklistArray[selectedChecklistIndex], selectedChecklistType, selectedChecklistIndex);
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
                displayChecklist(checklistsData.normalProcedures[0], 'normalProcedures', 0);
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
        checklistItems.innerHTML = '';

        checklistType.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerText = item.title;
            listItem.classList.add('warning-item');

            listItem.addEventListener('click', () => {
                displayChecklist(item, typeKey, index);
                highlightSelectedChecklist(index);
            });

            checklistItems.appendChild(listItem);
        });

        if (checklistType.length > 0) {
            highlightSelectedChecklist(0);
        }

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
            item.classList.remove('selected-item');
            item.setAttribute('aria-selected', 'false');
            if (index === selectedIndex) {
                item.classList.add('selected-item');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        });

        selectedChecklistIndex = selectedIndex;
    }

    /**
     * Displays the selected checklist.
     */
    function displayChecklist(item, typeKey, selectedIndex) {
        const title = document.getElementById('checklist-title');
        const description = document.getElementById('checklist-description');
        const stepsList = document.getElementById('checklist-steps');
        const notesList = document.getElementById('checklist-notes');
        const label = document.getElementById('checklist-type');
        const goNextButton = document.getElementById('go-next-checklist');

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
            case 'advisories':
                label.innerText = 'Advisory';
                break;
            default:
                label.innerText = '';
                break;
        }

        selectedChecklistType = typeKey;
        selectedChecklistIndex = selectedIndex;
        currentStepIndex = 0;

        title.innerText = item.title;
        description.innerText = item.description || '';
        stepsList.innerHTML = '';
        notesList.innerHTML = '';

        const subStepRegex = /^[a-zA-Z]\./;

        item.steps.forEach((step, index) => {
            if (step.stepType === 'checkbox' || step.stepType === 'substep') {
                const stepItem = document.createElement('li');
                stepItem.classList.add('step-item');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `step-${selectedChecklistIndex}-${index}`;
                stepItem.appendChild(checkbox);

                const labelElement = document.createElement('label');
                labelElement.htmlFor = `step-${selectedChecklistIndex}-${index}`;
                labelElement.classList.add('step-label');
                labelElement.innerText = step.step;

                if (subStepRegex.test(step.step.trim())) {
                    labelElement.classList.add('sub-step');
                }

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

                stepItem.appendChild(labelElement);
                if (step.action) {
                    stepItem.appendChild(dots);
                }
                stepItem.appendChild(actionText);

                checkbox.addEventListener('change', function () {
                    const stepItem = this.parentElement;
                    if (this.checked) {
                        markStepAsChecked(stepItem);
                    } else {
                        unmarkStepAsChecked(stepItem);
                    }
                });

                stepsList.appendChild(stepItem);
            } else if (step.stepType === 'note' || step.stepType === 'special') {
                const specialText = document.createElement('span');
                specialText.classList.add('special-text');
                specialText.innerText = step.text;
                stepsList.appendChild(specialText);
            } else if (step.stepType === 'procedureComplete') {
                const completeItem = document.createElement('li');
                completeItem.classList.add('procedure-complete');
                completeItem.innerText = step.text;
                stepsList.appendChild(completeItem);
            } else if (step.stepType === 'warning' || step.stepType === 'caution') {
                const warningText = document.createElement('span');
                warningText.classList.add('warning-text');
                warningText.innerText = step.text;
                stepsList.appendChild(warningText);
            }
        });

        if (item.notes && item.notes.length > 0) {
            item.notes.forEach(note => {
                const noteItem = document.createElement('p');
                noteItem.classList.add('note-item');
                noteItem.innerText = note.text;
                notesList.appendChild(noteItem);
            });
        }

        if (item.procedureComplete) {
            const completeItem = document.createElement('li');
            completeItem.classList.add('procedure-complete');
            completeItem.innerText = "Procedure Complete";
            stepsList.appendChild(completeItem);
        }

        const allSteps = document.querySelectorAll('#checklist-steps .step-item');
        allSteps.forEach(step => step.classList.remove('selected-item'));

        const firstCheckboxStep = findNextCheckboxStep(0, allSteps);
        if (firstCheckboxStep) {
            firstCheckboxStep.classList.add('selected-item');
            currentStepIndex = Array.from(allSteps).indexOf(firstCheckboxStep);
            scrollToSelectedItem(firstCheckboxStep);
        }

        setTimeout(() => {
            const checklistContent = document.querySelector('.checklist-display');
            if (checklistContent) {
                checklistContent.scrollTop = 0;
            }
        }, 0);

        highlightSelectedChecklist(selectedIndex);
    }

    /**
     * Finds the next checklist step that includes a checkbox.
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
     * Scrolls the selected step item into view, centering it.
     */
    function scrollToSelectedItem(element) {
        if (!element) {
            console.error('Element to scroll to is not defined.');
            return;
        }
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }

    /**
     * Marks a step as checked and moves to the next checkbox step.
     */
    function markStepAsChecked(stepItem) {
        if (stepItem) {
            stepItem.classList.add('checked');
            stepItem.classList.remove('selected-item');

            const stepItems = Array.from(document.querySelectorAll('#checklist-steps .step-item'));
            const currentIndex = stepItems.indexOf(stepItem);
            const nextStep = findNextCheckboxStep(currentIndex + 1, stepItems);

            if (nextStep) {
                nextStep.classList.add('selected-item');
                scrollToSelectedItem(nextStep);
            } else {
                console.log('All steps completed.');
            }
        }
    }

    /**
     * Unmarks a step as checked and updates the selection.
     */
    function unmarkStepAsChecked(stepItem) {
        if (stepItem) {
            stepItem.classList.remove('checked');
            if (!stepItem.classList.contains('selected-item')) {
                stepItem.classList.add('selected-item');
                scrollToSelectedItem(stepItem);
            }
        }
    }

    /**
     * Attaches event listeners to category buttons.
     */
    function attachButtonListeners() {
        const allButtons = document.querySelectorAll('.button-left, .button-right');
        allButtons.forEach(button => {
            button.addEventListener('click', function () {
                handleButtonSelection(this);
                const typeKey = this.getAttribute('data-type');
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
                    case 'advisory':
                        mappedTypeKey = 'advisories';
                        break;
                    default:
                        mappedTypeKey = '';
                }

                if (mappedTypeKey && checklistsData[mappedTypeKey]) {
                    populateChecklistList(checklistsData[mappedTypeKey], mappedTypeKey);
                    if (checklistsData[mappedTypeKey].length > 0) {
                        displayChecklist(checklistsData[mappedTypeKey][0], mappedTypeKey, 0);
                    }
                }
            });
        });
    }

    document.getElementById('select-button').addEventListener('click', function () {
        checkNextCheckbox();
    });

    function checkNextCheckbox() {
        let checklistArray = checklistsData[selectedChecklistType];
        if (!checklistArray || checklistArray.length === 0) return;

        let currentChecklist = checklistArray[selectedChecklistIndex];
        let steps = currentChecklist.steps;
        let stepItems = document.querySelectorAll('#checklist-steps .step-item');

        let foundCheckbox = false;

        while (currentStepIndex < steps.length) {
            let stepItem = stepItems[currentStepIndex];
            if (stepItem) {
                let checkbox = stepItem.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                    foundCheckbox = true;
                    break;
                }
            }
            currentStepIndex++;
        }

        if (!foundCheckbox) {
            moveToNextChecklist();
            currentStepIndex = 0;
        }
    }

    document.getElementById('go-next-checklist').addEventListener('click', debounce(function () {
        moveToNextChecklist();
    }, 300));

    // Load the checklists on DOMContentLoaded
    loadChecklists();

    // Now, define the Random Issue button event listener INSIDE DOMContentLoaded
    document.getElementById('random-issue-button').addEventListener('click', function() {
        if (!checklistsData) {
            console.error("Checklists data not loaded");
            return;
        }
        
        const categoryMapping = [
            { key: 'issues',       cassClass: 'cass-issue',   weight: 1 },
            { key: 'warnings',     cassClass: 'cass-warning', weight: 1 },
            { key: 'advisories',   cassClass: 'cass-advisory', weight: 0.3 },
            { key: 'cautionAF',    cassClass: 'cass-caution', weight: 1 },
            { key: 'cautionGZ',    cassClass: 'cass-caution', weight: 1 }
        ];
    
        // Calculate total weight
        let totalWeight = 0;
        for (let cat of categoryMapping) {
            totalWeight += cat.weight;
        }
    
        // Pick a category based on weight
        const randomNum = Math.random() * totalWeight;
        let cumulative = 0;
        let chosenCategory = null;
    
        for (let cat of categoryMapping) {
            cumulative += cat.weight;
            if (randomNum < cumulative) {
                chosenCategory = cat;
                break;
            }
        }
    
        // Proceed as before
        const categoryArray = checklistsData[chosenCategory.key];
        if (!categoryArray || categoryArray.length === 0) {
            console.warn(`No data found for category ${chosenCategory.key}`);
            return;
        }
    
        const randomItemIndex = Math.floor(Math.random() * categoryArray.length);
        const selectedItem = categoryArray[randomItemIndex];
    
        const cassMessageEl = document.getElementById('cass-message');
        const cassTextEl = document.getElementById('cass-text');
    
        cassMessageEl.classList.remove('cass-issue', 'cass-warning', 'cass-caution', 'cass-advisory');
        cassMessageEl.classList.add(chosenCategory.cassClass);
        cassTextEl.textContent = selectedItem.title;
        cassMessageEl.style.display = 'block';
    });

});

document.getElementById('clear-cass-button').addEventListener('click', function() {
    const cassMessageEl = document.getElementById('cass-message');
    cassMessageEl.style.display = 'none';
});