document.addEventListener('DOMContentLoaded', async function () {
    let checklistsData = {};
    let cassData = {};
    let selectedChecklistIndex = 0;
    let selectedChecklistType = 'normalProcedures';
    let currentStepIndex = 0;
    let memoryItemsHighlighted = false;
    let noMoreSteps = false; // End-of-checklist flag

    async function loadChecklists() {
        const response = await fetch('checklists.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        checklistsData = data.checklists;
    }

    async function loadCassMessages() {
        const response = await fetch('cassMessages.json');
        if (!response.ok) {
            throw new Error(`Failed to load CASS messages: ${response.status}`);
        }
        const data = await response.json();
        cassData = data.cassMessages;
    }

    function debounce(func, delay) {
        let inDebounce;
        return function(...args) {
            if (inDebounce) return;
            func.apply(this, args);
            inDebounce = true;
            setTimeout(() => inDebounce = false, delay);
        }
    }

    function handleButtonSelection(button) {
        const allButtons = document.querySelectorAll('.button-left, .button-right');
        allButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('selected');
        button.setAttribute('aria-pressed', 'true');
    }

    function moveToNextChecklist() {
        const checklistArray = checklistsData[selectedChecklistType];
        if (!checklistArray || checklistArray.length === 0) return;

        selectedChecklistIndex++;
        if (selectedChecklistIndex >= checklistArray.length) {
            selectedChecklistIndex = 0;
        }

        displayChecklist(checklistArray[selectedChecklistIndex], selectedChecklistType, selectedChecklistIndex);
        highlightSelectedChecklist(selectedChecklistIndex);
        noMoreSteps = false; 
    }

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

    function displayChecklist(item, typeKey, selectedIndex) {
        const title = document.getElementById('checklist-title');
        const description = document.getElementById('checklist-description');
        const stepsList = document.getElementById('checklist-steps');
        const notesList = document.getElementById('checklist-notes');
        const label = document.getElementById('checklist-type');

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
            let stepItem;

            if (step.stepType === 'checkbox' || step.stepType === 'substep') {
                stepItem = document.createElement('li');
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

            } else if (step.stepType === 'note' || step.stepType === 'special') {
                stepItem = document.createElement('span');
                stepItem.classList.add('special-text');
                stepItem.innerText = step.text;
            } else if (step.stepType === 'procedureComplete') {
                stepItem = document.createElement('li');
                stepItem.classList.add('procedure-complete');
                stepItem.innerText = step.text;
            } else if (step.stepType === 'warning' || step.stepType === 'caution') {
                stepItem = document.createElement('span');
                stepItem.classList.add('warning-text');
                stepItem.innerText = step.text;
            }

            if (step.memoryItem && stepItem) {
                stepItem.dataset.memoryItem = "true";
                if (memoryItemsHighlighted) {
                    stepItem.classList.add('memory-item-highlight');
                }
            }

            if (stepItem) {
                stepsList.appendChild(stepItem);
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

    function findNextCheckboxStep(startIndex, stepItems) {
        for (let i = startIndex; i < stepItems.length; i++) {
            const checkbox = stepItems[i].querySelector('input[type="checkbox"]');
            if (checkbox) {
                return stepItems[i];
            }
        }
        return null;
    }

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

    // Always include go-next-checklist in selectable items
    function getSelectableItems() {
        const stepItems = Array.from(document.querySelectorAll('#checklist-steps .step-item'));
        const nextButton = document.getElementById('go-next-checklist');
        const items = [...stepItems];
        if (nextButton) {
            items.push(nextButton);
        }
        return items;
    }

    function getHighlightedItem() {
        const items = getSelectableItems();
        return items.find(item => item.classList.contains('selected-item'));
    }

    function highlightItem(item) {
        const items = getSelectableItems();
        items.forEach(el => el.classList.remove('selected-item'));
        if (item) {
            item.classList.add('selected-item');
            scrollToSelectedItem(item);
        }
    }

    function moveHighlightUp() {
        const items = getSelectableItems();
        const highlighted = getHighlightedItem();
        if (!highlighted || items.length === 0) return;
        const index = items.indexOf(highlighted);
        if (index > 0) {
            highlightItem(items[index - 1]);
        }
    }

    function moveHighlightDown() {
        const items = getSelectableItems();
        const highlighted = getHighlightedItem();
        if (items.length === 0) return;
        if (!highlighted) {
            // If nothing highlighted yet, highlight first item
            highlightItem(items[0]);
            return;
        }
        const index = items.indexOf(highlighted);
        if (index < items.length - 1) {
            highlightItem(items[index + 1]);
        }
    }

    function markStepAsChecked(stepItem) {
        if (stepItem) {
            stepItem.classList.add('checked');
            stepItem.classList.remove('selected-item');

            const stepItems = Array.from(document.querySelectorAll('#checklist-steps .step-item'));
            const currentIndex = stepItems.indexOf(stepItem);
            const nextStep = findNextCheckboxStep(currentIndex + 1, stepItems);

            if (nextStep) {
                highlightItem(nextStep);
            } else {
                // Last step checked, highlight go-next-checklist immediately
                const nextChecklistButton = document.getElementById('go-next-checklist');
                if (nextChecklistButton) {
                    nextChecklistButton.classList.add('selected-item');
                }
                noMoreSteps = true;
            }
        }
    }

    function unmarkStepAsChecked(stepItem) {
        if (stepItem) {
            stepItem.classList.remove('checked');
            if (!stepItem.classList.contains('selected-item')) {
                stepItem.classList.add('selected-item');
                scrollToSelectedItem(stepItem);
            }
        }
    }

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

    await loadChecklists();
    await loadCassMessages();

    attachButtonListeners();

    if (checklistsData.normalProcedures && checklistsData.normalProcedures.length > 0) {
        populateChecklistList(checklistsData.normalProcedures, 'normalProcedures');
        displayChecklist(checklistsData.normalProcedures[0], 'normalProcedures', 0);
    }

    document.getElementById('go-next-checklist').addEventListener('click', function() {
        moveToNextChecklist();
    });

    document.getElementById('random-issue-button').addEventListener('click', function() {
        if (!cassData) {
            console.error("CASS data not loaded");
            return;
        }
        
        const categoryMapping = [
            { key: 'issues',     cassClass: 'cass-issue',   weight: 0.5 },
            { key: 'warnings',   cassClass: 'cass-warning', weight: 1 },
            { key: 'advisories', cassClass: 'cass-advisory', weight: 0.3 },
            { key: 'cautions',   cassClass: 'cass-caution', weight: 1 },
        ];
    
        let totalWeight = 0;
        for (let cat of categoryMapping) {
            totalWeight += cat.weight;
        }
    
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
    
        const categoryArray = cassData[chosenCategory.key];
        if (!categoryArray || categoryArray.length === 0) {
            console.warn(`No data found for category ${chosenCategory.key}`);
            return;
        }
    
        const randomItemIndex = Math.floor(Math.random() * categoryArray.length);
        const selectedMessage = categoryArray[randomItemIndex];
    
        const cassMessageEl = document.getElementById('cass-message');
        const cassTextEl = document.getElementById('cass-text');
    
        cassMessageEl.classList.remove('cass-issue', 'cass-warning', 'cass-caution', 'cass-advisory');
        cassMessageEl.classList.add(chosenCategory.cassClass);
        cassTextEl.textContent = selectedMessage;
        cassMessageEl.style.display = 'block';
    });

    document.getElementById('clear-cass-button').addEventListener('click', function() {
        const cassMessageEl = document.getElementById('cass-message');
        cassMessageEl.style.display = 'none';
    });

    document.getElementById('memory-items-button').addEventListener('click', function() {
        memoryItemsHighlighted = !memoryItemsHighlighted;
        this.textContent = memoryItemsHighlighted ? 'Memory Items Highlighted' : 'Memory Items';

        const displayedItems = document.querySelectorAll('#checklist-steps .step-item, #checklist-steps .special-text, #checklist-steps .procedure-complete, #checklist-steps .warning-text');
        displayedItems.forEach(stepEl => {
            if (stepEl.dataset.memoryItem === "true") {
                if (memoryItemsHighlighted) {
                    stepEl.classList.add('memory-item-highlight');
                } else {
                    stepEl.classList.remove('memory-item-highlight');
                }
            }
        });
    });

    document.getElementById('select-button').addEventListener('click', function () {
        if (noMoreSteps) {
            noMoreSteps = false;
            const nextChecklistButton = document.getElementById('go-next-checklist');
            if (nextChecklistButton) {
                nextChecklistButton.classList.remove('selected-item');
            }
            moveToNextChecklist();
        } else {
            const highlighted = getHighlightedItem();
            if (highlighted) {
                if (highlighted.id === 'go-next-checklist') {
                    moveToNextChecklist();
                } else {
                    // Toggle check state of the highlighted step
                    const checkbox = highlighted.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        if (checkbox.checked) {
                            // Uncheck the item
                            checkbox.checked = false;
                            highlighted.classList.remove('checked');
                            // Highlight stays on this step
                        } else {
                            // Check the item
                            checkbox.checked = true;
                            checkbox.dispatchEvent(new Event('change'));
                        }
                    }
                }
            } else {
                // If nothing highlighted, just run checkNextCheckbox
                checkNextCheckbox();
            }
        }
    });

    document.getElementById('up-button').addEventListener('click', moveHighlightUp);
    document.getElementById('down-button').addEventListener('click', moveHighlightDown);

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
        // No changes needed here since markStepAsChecked handles end-of-checklist logic
    }

});