document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    let nextElementId = 0; // Variable to keep track of the next element ID
    let nextScopeId = 0; // Variable to keep track of the next element ID
    const elementSearch = document.getElementById('elementSearch');
    const elementOptions = document.getElementById('elementOptions');
    const scopeSearch = document.getElementById('scopeSearch');
    const scopeOptions = document.getElementById('scopeOptions');
    const containers = document.querySelectorAll('.container');
    let filteredElements = []; // Variable to store filtered elements
    let elements = []; // Array to store all elements fetched from JSON
    let filteredScopes = []; // Variable to store filtered scopes
    let scopes = []; // Array to store all scopes fetched from JSON

    containers.forEach(container => {
        addContainerEventListeners(container);
    });

    const addElementForm = document.getElementById('addElementForm');
    addElementForm.addEventListener('submit', addElement);

    const addScopeForm = document.getElementById('addScopeForm');
    addScopeForm.addEventListener('submit', addScope);

    fetch('elements.json')
        .then(response => response.json())
        .then(data => {
            elements = data; // Populate the elements array with data from JSON
            filteredElements = elements; // Initialize filtered elements with all elements
        })
        .catch(error => console.error('Error fetching elements:', error));

    fetch('scopes.json')
        .then(response => response.json())
        .then(data => {
            scopes = data; // Populate the scopes array with data from JSON
            filteredScopes = scopes; // Initialize filtered scopes with all scopes
        })
        .catch(error => console.error('Error fetching scopes:', error));

    // Event listener for input change in the search bar
    elementSearch.addEventListener('input', () => {
        const searchQuery = elementSearch.value.toLowerCase();
        filteredElements = searchQuery
            ? elements.filter(element => element.name.toLowerCase().includes(searchQuery))
            : elements; // Reset filtered elements to all elements if search query is empty
        populateElementOptions();
    });

    // Event listener for input change in the search bar
    scopeSearch.addEventListener('input', () => {
        const searchQuery = scopeSearch.value.toLowerCase();
        filteredScopes = searchQuery
            ? scopes.filter(scope => scope.name.toLowerCase().includes(searchQuery))
            : scopes; // Reset filtered scopes to all scopes if search query is empty
        populateScopeOptions();
    });

    // Populate the options based on the filtered elements
    function populateElementOptions() {
        elementOptions.innerHTML = ''; // Clear existing options
        filteredElements.forEach(element => {
            const option = document.createElement('div');
            option.textContent = element.name;
            option.addEventListener('click', () => selectElement(element.name));
            elementOptions.appendChild(option);
        });
    }

    // Populate the options based on the filtered scopes
    function populateScopeOptions() {
        scopeOptions.innerHTML = ''; // Clear existing options
        filteredScopes.forEach(scope => {
            const option = document.createElement('div');
            option.textContent = scope.name;
            option.addEventListener('click', () => selectScope(scope.name));
            scopeOptions.appendChild(option);
        });
    }

    function selectElement(name) {
        elementSearch.value = name;
        elementOptions.innerHTML = ''; // Clear options after selection
    }

    function selectScope(name) {
        scopeSearch.value = name;
        scopeOptions.innerHTML = ''; // Clear options after selection
    }

    function addElement(e) {
        e.preventDefault();
        const selectedElementName = elementSearch.value;
        const selectedElement = elements.find(element => element.name === selectedElementName);
        if (selectedElement) {
            const newElement = document.createElement('div');
            newElement.classList.add('element');
            newElement.classList.add(selectedElement.type); // Add the appropriate type class
            newElement.draggable = true;
            newElement.id = 'element' + nextElementId;
            nextElementId++;
    
            // Create text node for the prefix
            const prefixTextNode = document.createTextNode(selectedElement.prefix);
            newElement.appendChild(prefixTextNode);
    
            // If the element has parameters, create input fields
            // Wrap the element if the wrapped property is set to true.
            if (selectedElement.wrapped) {
                console.log('Wrapped element.')
                // Wrap in curly brackets
                const bracketContainer = document.createElement('div');
                bracketContainer.classList.add('param-container');
                newElement.appendChild(document.createTextNode(' {'));
            }

            if (selectedElement.parameters && selectedElement.parameters.length > 0) {
                if (selectedElement.parameters.length === 1) {
                    // Single parameter: just add the input field without curly brackets
                    const param = selectedElement.parameters[0];
                    let inputField;
                    if (param.inputType === 'boolean') {
                        inputField = document.createElement('select');
                        const trueOption = document.createElement('option');
                        trueOption.value = 'true';
                        trueOption.textContent = 'True';
                        const falseOption = document.createElement('option');
                        falseOption.value = 'false';
                        falseOption.textContent = 'False';
                        inputField.appendChild(trueOption);
                        inputField.appendChild(falseOption);
                    } else if (param.inputType === 'number') {
                        inputField = document.createElement('input');
                        inputField.type = 'number';
                        inputField.placeholder = 'Enter a number';
                    } else if (param.inputType === 'string') {
                        inputField = document.createElement('input');
                        inputField.type = 'text';
                        inputField.placeholder = 'Enter text';
                    }
                    inputField.classList.add('element-input');
                    inputField.name = param.name; // Set the name attribute for the input field
                    newElement.appendChild(inputField);
                } else {    
                    const paramContainer = document.createElement('div');
                    paramContainer.classList.add('param-container');
                    selectedElement.parameters.forEach((param) => {
                        const paramWrapper = document.createElement('div');
    
                        // Create label for the parameter
                        const paramLabel = document.createElement('span');
                        paramLabel.textContent = `\t${param.name} = `;
                        paramWrapper.appendChild(paramLabel);
    
                        // Create input field based on parameter type
                        let inputField;
                        if (param.inputType === 'boolean') {
                            inputField = document.createElement('select');
                            const trueOption = document.createElement('option');
                            trueOption.value = 'true';
                            trueOption.textContent = 'True';
                            const falseOption = document.createElement('option');
                            falseOption.value = 'false';
                            falseOption.textContent = 'False';
                            inputField.appendChild(trueOption);
                            inputField.appendChild(falseOption);
                        } else if (param.inputType === 'number') {
                            inputField = document.createElement('input');
                            inputField.type = 'number';
                            inputField.placeholder = 'Enter a number';
                        } else if (param.inputType === 'string') {
                            inputField = document.createElement('input');
                            inputField.type = 'text';
                            inputField.placeholder = 'Enter text';
                        }
                        inputField.classList.add('element-input');
                        inputField.name = param.name; // Set the name attribute for the input field
                        paramWrapper.appendChild(inputField);
    
                        paramContainer.appendChild(paramWrapper);
                    });
                    newElement.appendChild(paramContainer);
                }
            }
    
            // Finish wrapping the element if the wrapped property is set to true.
            if (selectedElement.wrapped) {
                const closingBraceNode = document.createElement('div');
                closingBraceNode.textContent = '}';
                newElement.appendChild(closingBraceNode);
            }

            // Store canContain property
            newElement.dataset.canContain = selectedElement.canContain.toString();
    
            // Store validScope property
            newElement.dataset.validScope = selectedElement.validScope;
    
            // Store type property
            newElement.dataset.type = selectedElement.type.toString();
    
            // Store original text property
            newElement.dataset.originalInnerHTML = newElement.innerHTML;
    
            newElement.addEventListener('dragstart', dragStart);
            newElement.addEventListener('dragover', dragOver);
            newElement.addEventListener('dragenter', dragEnter);
            newElement.addEventListener('dragleave', dragLeave);
            newElement.addEventListener('drop', drop);
    
            document.querySelector('.elements').appendChild(newElement);
            console.log('Added new element:', selectedElement.name, 'with ID:', newElement.id);
    
            // Clear search bar and filtered elements
            elementSearch.value = '';
            filteredElements = elements;
        } else {
            alert('Please select a valid element.');
        }
    }

    function addScope(e) {
        e.preventDefault();
        const selectedScopeName = scopeSearch.value;
        const selectedScope = scopes.find(scope => scope.name === selectedScopeName);
        if (selectedScope) {
            const newScope = document.createElement('div');
            newScope.classList.add('scope');
            newScope.draggable = true;
            newScope.id = 'scope' + nextScopeId;
            nextScopeId++;
    
            // Create text node for the prefix
            const prefixTextNode = document.createTextNode(selectedScope.prefix);
            newScope.appendChild(prefixTextNode);
    
            // If the scope has parameters, create input fields
            // Wrap the scope if the wrapped property is set to true.
            if (selectedScope.wrapped) {
                console.log('Wrapped scope.')
                // Wrap in curly brackets
                const bracketContainer = document.createElement('div');
                bracketContainer.classList.add('param-container');
                newScope.appendChild(document.createTextNode(' { # Scope: ' + selectedScope.scope));

                const closingBraceNode = document.createElement('div');
                closingBraceNode.textContent = '}';
                newScope.appendChild(closingBraceNode);
            }

            // Store canContain property
            newScope.dataset.canContain = selectedScope.canContain.toString();
    
            // Store validScope property
            newScope.dataset.validScope = selectedScope.validScope;
        
            // Store original text property
            newScope.dataset.scope = selectedScope.scope;
    
            newScope.addEventListener('dragstart', dragStart);
            newScope.addEventListener('dragover', dragOver);
            newScope.addEventListener('dragenter', dragEnter);
            newScope.addEventListener('dragleave', dragLeave);
            newScope.addEventListener('drop', drop);
    
            document.querySelector('.elements').appendChild(newScope);
            console.log('Added new scope:', selectedScope.name, 'with ID:', newScope.id);
    
            // Clear search bar and filtered scopes
            scopeSearch.value = '';
            filteredScopes = scopes;
        } else {
            alert('Please select a valid scope.');
        }
    }
                            
    function addContainerEventListeners(container) {
        container.addEventListener('dragover', dragOver);
        container.addEventListener('dragenter', dragEnter);
        container.addEventListener('dragleave', dragLeave);
        container.addEventListener('drop', drop);

        console.log('Added dragover, dragenter, dragleave, and drop event listeners to', container.id);
    }

    function dragStart(e) {
        console.log('Drag started for', e.target.id);
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function dragOver(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
        console.log('Drag over on', e.target.id);
    }

    function dragEnter(e) {
        e.preventDefault();
        console.log('Drag enter on', e.target.id);
    }

    function dragLeave(e) {
        e.preventDefault();
        console.log('Drag leave on', e.target.id);
        e.target.classList.remove('drag-over');
    }

    function drop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
    
        const id = e.dataTransfer.getData('text/plain');
        console.log('Dropped', id, 'on', e.target.id);
    
        const droppedElement = document.getElementById(id);
        const container = e.target.closest('.container');
    
        if (container) { // Check if the drop target is a container
            const canContain = e.target.dataset.canContain; // Check if the container can contain other elements

            let validScopeArr = droppedElement.dataset.validScope;
            let targetScope = e.target.dataset.scope;

            if (validScopeArr.includes(targetScope)) {
                if (canContain === 'true') { // Check if the dropped element is an element and if the container is a valid drop target
                    if (droppedElement.dataset.type === 'logic') {
                        droppedElement.dataset.scope = targetScope;
                        droppedElement.innerHTML = droppedElement.dataset.originalInnerHTML.replace('{<div>','{ # Scope: ' + targetScope + '<div>');
                    }

                    e.target.appendChild(droppedElement);
                    console.log('Appended', id, 'to', e.target.id);
                } else {
                    console.log('Invalid target.');
                }
            } else {
                alert('Invalid scope.')
            }

        } else {
            console.log('Tried to drop into non-container.');
        }
    
        // Update container height to fit new content
        if (container) {
            container.style.height = 'auto';
        }
    }
    // Add event listeners for delete container
    const deleteContainer = document.getElementById('delete-container');
    deleteContainer.addEventListener('dragover', dragOver);
    deleteContainer.addEventListener('dragenter', dragEnter);
    deleteContainer.addEventListener('dragleave', dragLeave);
    deleteContainer.addEventListener('drop', deleteElement);

    // Function to handle the drop event for deleting elements
    function deleteElement(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');

        const id = e.dataTransfer.getData('text/plain');
        console.log('Dropped', id, 'on delete container');

        const droppedElement = document.getElementById(id);
        droppedElement.remove();
        console.log('Deleted element:', id);
    }
        
});
