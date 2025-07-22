// Visual Blocks Programming Interface for CodeQuest

let draggedBlock = null;
let programBlocks = [];
let blockIdCounter = 0;

// Block templates with editable parts
const blockTemplates = {
    'printf': {
        template: 'printf("${text}");',
        display: 'printf("...")',
        category: 'io',
        editableFields: [
            { name: 'text', type: 'text', placeholder: 'Hello, World!', default: 'Hello, World!' }
        ]
    },
    'scanf': {
        template: 'scanf("${format}", &${variable});',
        display: 'scanf("...", &...)',
        category: 'io',
        editableFields: [
            { name: 'format', type: 'text', placeholder: '%d', default: '%d' },
            { name: 'variable', type: 'text', placeholder: 'number', default: 'number' }
        ]
    },
    'variable': {
        template: '${type} ${name} = ${value};',
        display: 'variable declaration',
        category: 'variables',
        editableFields: [
            { name: 'type', type: 'select', options: ['int', 'float', 'char', 'double', 'long', 'short'], default: 'int' },
            { name: 'name', type: 'text', placeholder: 'variable', default: 'number' },
            { name: 'value', type: 'text', placeholder: '0', default: '0' }
        ]
    },
    'assign': {
        template: '${variable} = ${value};',
        display: 'assignment',
        category: 'variables',
        editableFields: [
            { name: 'variable', type: 'text', placeholder: 'variable', default: 'number' },
            { name: 'value', type: 'text', placeholder: 'value', default: '42' }
        ]
    },
    'array': {
        template: '${type} ${name}[${size}];',
        display: 'array declaration',
        category: 'variables',
        editableFields: [
            { name: 'type', type: 'select', options: ['int', 'float', 'char', 'double'], default: 'int' },
            { name: 'name', type: 'text', placeholder: 'array', default: 'numbers' },
            { name: 'size', type: 'text', placeholder: '10', default: '10' }
        ]
    },
    'if': {
        template: 'if (${condition}) {',
        display: 'if (...) {',
        category: 'control',
        editableFields: [
            { name: 'condition', type: 'text', placeholder: 'number % 2 == 0', default: 'number % 2 == 0' }
        ]
    },
    'else': {
        template: 'else {',
        display: 'else {',
        category: 'control',
        editableFields: []
    },
    'elseif': {
        template: 'else if (${condition}) {',
        display: 'else if (...) {',
        category: 'control',
        editableFields: [
            { name: 'condition', type: 'text', placeholder: 'condition', default: 'number > 0' }
        ]
    },
    'for': {
        template: 'for (${init}; ${condition}; ${update}) {',
        display: 'for (...; ...; ...) {',
        category: 'loops',
        editableFields: [
            { name: 'init', type: 'text', placeholder: 'int i = 0', default: 'int i = 0' },
            { name: 'condition', type: 'text', placeholder: 'i < n', default: 'i < n' },
            { name: 'update', type: 'text', placeholder: 'i++', default: 'i++' }
        ]
    },
    'while': {
        template: 'while (${condition}) {',
        display: 'while (...) {',
        category: 'loops',
        editableFields: [
            { name: 'condition', type: 'text', placeholder: 'condition', default: 'i < 10' }
        ]
    },
    'dowhile': {
        template: 'do {',
        display: 'do {',
        category: 'loops',
        editableFields: []
    },
    'whileend': {
        template: '} while (${condition});',
        display: '} while (...);',
        category: 'loops',
        editableFields: [
            { name: 'condition', type: 'text', placeholder: 'condition', default: 'i < 10' }
        ]
    },
    'break': {
        template: 'break;',
        display: 'break;',
        category: 'control',
        editableFields: []
    },
    'continue': {
        template: 'continue;',
        display: 'continue;',
        category: 'control',
        editableFields: []
    },
    'function': {
        template: '${returnType} ${name}(${parameters}) {',
        display: 'function declaration',
        category: 'functions',
        editableFields: [
            { name: 'returnType', type: 'select', options: ['void', 'int', 'float', 'char', 'double'], default: 'int' },
            { name: 'name', type: 'text', placeholder: 'functionName', default: 'calculate' },
            { name: 'parameters', type: 'text', placeholder: 'int a, int b', default: 'int x, int y' }
        ]
    },
    'return': {
        template: 'return ${value};',
        display: 'return ...',
        category: 'functions',
        editableFields: [
            { name: 'value', type: 'text', placeholder: 'value', default: '0' }
        ]
    },
    'switch': {
        template: 'switch (${variable}) {',
        display: 'switch (...) {',
        category: 'control',
        editableFields: [
            { name: 'variable', type: 'text', placeholder: 'variable', default: 'choice' }
        ]
    },
    'case': {
        template: 'case ${value}:',
        display: 'case ...:',
        category: 'control',
        editableFields: [
            { name: 'value', type: 'text', placeholder: '1', default: '1' }
        ]
    },
    'default': {
        template: 'default:',
        display: 'default:',
        category: 'control',
        editableFields: []
    },
    'comment': {
        template: '// ${text}',
        display: '// comment',
        category: 'misc',
        editableFields: [
            { name: 'text', type: 'text', placeholder: 'Comment text', default: 'This is a comment' }
        ]
    },
    'multicomment': {
        template: '/* ${text} */',
        display: '/* comment */',
        category: 'misc',
        editableFields: [
            { name: 'text', type: 'text', placeholder: 'Comment text', default: 'Multi-line comment' }
        ]
    },
    'define': {
        template: '#define ${name} ${value}',
        display: '#define ...',
        category: 'preprocessor',
        editableFields: [
            { name: 'name', type: 'text', placeholder: 'CONSTANT', default: 'MAX_SIZE' },
            { name: 'value', type: 'text', placeholder: '100', default: '100' }
        ]
    },
    'include': {
        template: '#include <${header}>',
        display: '#include <...>',
        category: 'preprocessor',
        editableFields: [
            { name: 'header', type: 'select', options: ['stdio.h', 'stdlib.h', 'string.h', 'math.h', 'time.h', 'ctype.h'], default: 'stdio.h' }
        ]
    },
    'sizeof': {
        template: 'sizeof(${type})',
        display: 'sizeof(...)',
        category: 'operators',
        editableFields: [
            { name: 'type', type: 'text', placeholder: 'int', default: 'int' }
        ]
    },
    'malloc': {
        template: '${variable} = (${type}*)malloc(${size} * sizeof(${type}));',
        display: 'malloc(...)',
        category: 'memory',
        editableFields: [
            { name: 'variable', type: 'text', placeholder: 'ptr', default: 'ptr' },
            { name: 'type', type: 'select', options: ['int', 'float', 'char', 'double'], default: 'int' },
            { name: 'size', type: 'text', placeholder: '10', default: '10' }
        ]
    },
    'free': {
        template: 'free(${variable});',
        display: 'free(...)',
        category: 'memory',
        editableFields: [
            { name: 'variable', type: 'text', placeholder: 'ptr', default: 'ptr' }
        ]
    }
};

// Initialize drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('blocks-palette')) {
        initializeVisualBlocks();
        setupBlockFiltering();
        addSearchFunctionality();
    }
});

function initializeVisualBlocks() {
    console.log('Initializing visual blocks...');
    
    // Setup draggable blocks
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    blocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
    });
    
    // Setup drop zones
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('click', handleZoneClick);
    });
    
    // Add remove functionality to existing blocks in drop zones
    updateRemoveButtons();
    
    console.log('Visual blocks initialized');
}

function handleDragStart(e) {
    const blockType = this.getAttribute('data-block-type');
    const code = this.getAttribute('data-code');
    
    draggedBlock = {
        element: this,
        code: code,
        text: this.textContent.trim(),
        blockType: blockType,
        isEditable: !!blockType
    };
    
    this.style.opacity = '0.5';
    this.classList.add('dragging');
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/html', this.outerHTML);
    e.dataTransfer.setData('text/plain', draggedBlock.code);
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    this.classList.remove('dragging');
    draggedBlock = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    // Only remove drag-over if we're actually leaving the drop zone
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (!draggedBlock) return;
    
    // Clear the drop zone if it's empty
    if (this.children.length === 0) {
        this.innerHTML = '';
    }
    
    // Create a new block element for the drop zone
    let newBlock;
    if (draggedBlock.isEditable && draggedBlock.blockType) {
        const template = blockTemplates[draggedBlock.blockType];
        const defaultData = {};
        template.editableFields.forEach(field => {
            defaultData[field.name] = field.default;
        });
        newBlock = createDroppedBlock(draggedBlock.code, draggedBlock.text, draggedBlock.blockType, defaultData);
    } else {
        newBlock = createDroppedBlock(draggedBlock.code, draggedBlock.text);
    }
    
    this.appendChild(newBlock);
    
    // Check if this is the last drop zone and add a new one if needed
    addDropZoneIfNeeded();
    
    // Update the program structure
    updateProgramStructure();
    updateTextEditor();
    
    // Show success animation
    newBlock.classList.add('fade-in-up');
    
    console.log('Block dropped:', draggedBlock.code);
}

function handleZoneClick(e) {
    if (e.target.classList.contains('btn-close') || e.target.closest('.btn-close')) {
        return; // Don't handle zone click if clicking remove button
    }
    
    if (this.children.length === 0) {
        showBlockSelector(this);
    }
}

function createDroppedBlock(code, text, blockType = null, blockData = {}) {
    const blockId = `block_${++blockIdCounter}`;
    const block = document.createElement('div');
    block.className = 'code-block dropped-block';
    block.setAttribute('data-code', code);
    block.setAttribute('data-block-id', blockId);
    
    if (blockType && blockTemplates[blockType]) {
        block.setAttribute('data-block-type', blockType);
        block.setAttribute('data-block-data', JSON.stringify(blockData));
        
        const template = blockTemplates[blockType];
        let generatedCode = template.template;
        
        // Replace placeholders with actual values
        template.editableFields.forEach(field => {
            const value = blockData[field.name] || field.default;
            generatedCode = generatedCode.replace(`\${${field.name}}`, value);
        });
        
        block.setAttribute('data-code', generatedCode);
        
        block.innerHTML = `
            <span class="block-content">${generatedCode}</span>
            <button type="button" class="btn btn-sm btn-outline-light ms-2" 
                    onclick="editBlock('${blockId}')" title="Edit block">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn-close btn-close-white ms-1" 
                    onclick="removeBlock(this)" title="Remove block"></button>
        `;
    } else {
        block.innerHTML = `
            <span class="block-content">${text}</span>
            <button type="button" class="btn-close btn-close-white float-end" 
                    onclick="removeBlock(this)" title="Remove block"></button>
        `;
    }
    
    return block;
}

function removeBlock(button) {
    const block = button.closest('.code-block');
    const dropZone = button.closest('.drop-zone');
    
    if (block && dropZone) {
        // Add removal animation
        block.style.transition = 'all 0.3s ease';
        block.style.opacity = '0';
        block.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            block.remove();
            
            // Restore placeholder if zone is empty
            if (dropZone.children.length === 0) {
                dropZone.innerHTML = '';
            }
            
            // Clean up excess empty drop zones
            setTimeout(() => {
                removeEmptyDropZones();
            }, 100);
            
            updateProgramStructure();
            updateTextEditor();
        }, 300);
    }
}

function updateTextEditor() {
    if (typeof editor !== 'undefined' && editor) {
        const code = generateCodeFromBlocks();
        const currentValue = editor.getValue();
        
        // Only update if the code has actually changed
        if (currentValue !== code) {
            const position = editor.getPosition();
            editor.setValue(code);
            
            // Try to restore cursor position
            if (position && code.split('\n').length >= position.lineNumber) {
                editor.setPosition(position);
            }
        }
    }
}

function showBlockSelector(dropZone) {
    const palette = document.getElementById('blocks-palette');
    const blocks = palette.querySelectorAll('.code-block');
    
    const selector = document.createElement('div');
    selector.className = 'block-selector';
    selector.innerHTML = `
        <div class="dropdown show">
            <div class="dropdown-menu show position-static w-100">
                <h6 class="dropdown-header">Select a block:</h6>
                ${Array.from(blocks).map(block => `
                    <a class="dropdown-item" href="#" 
                       onclick="selectBlock('${block.getAttribute('data-code')}', '${block.textContent.trim()}', this)">
                        <code>${block.textContent.trim()}</code>
                    </a>
                `).join('')}
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-muted" href="#" onclick="cancelBlockSelection(this)">
                    <i class="fas fa-times me-2"></i>Cancel
                </a>
            </div>
        </div>
    `;
    
    dropZone.appendChild(selector);
}

function selectBlock(code, text, element) {
    const selector = element.closest('.block-selector');
    const dropZone = selector.closest('.drop-zone');
    
    selector.remove();
    
    const newBlock = createDroppedBlock(code, text);
    dropZone.appendChild(newBlock);
    
    // Check if we need to add a new drop zone
    addDropZoneIfNeeded();
    
    updateProgramStructure();
    updateTextEditor();
    newBlock.classList.add('fade-in-up');
}

function editBlock(blockId) {
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!block) return;
    
    const blockType = block.getAttribute('data-block-type');
    const blockData = JSON.parse(block.getAttribute('data-block-data') || '{}');
    const template = blockTemplates[blockType];
    
    if (!template) return;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    
    const fieldsHtml = template.editableFields.map(field => {
        const currentValue = blockData[field.name] || field.default;
        
        if (field.type === 'select') {
            const options = field.options.map(option => 
                `<option value="${option}" ${option === currentValue ? 'selected' : ''}>${option}</option>`
            ).join('');
            return `
                <div class="mb-3">
                    <label class="form-label">${field.name.charAt(0).toUpperCase() + field.name.slice(1)}:</label>
                    <select class="form-select" data-field="${field.name}">
                        ${options}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="mb-3">
                    <label class="form-label">${field.name.charAt(0).toUpperCase() + field.name.slice(1)}:</label>
                    <input type="text" class="form-control" data-field="${field.name}" 
                           value="${currentValue}" placeholder="${field.placeholder}">
                </div>
            `;
        }
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit ${blockType.charAt(0).toUpperCase() + blockType.slice(1)} Block</h5>
                    <button type="button" class="btn-close" onclick="closeEditModal()"></button>
                </div>
                <div class="modal-body">
                    ${fieldsHtml}
                    <div class="alert alert-info">
                        <strong>Preview:</strong> <code id="code-preview">${template.template}</code>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveBlockEdit('${blockId}')">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.id = 'edit-modal';
    
    // Add live preview
    const inputs = modal.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
    
    updatePreview();
    
    function updatePreview() {
        const preview = modal.querySelector('#code-preview');
        let previewCode = template.template;
        
        inputs.forEach(input => {
            const fieldName = input.getAttribute('data-field');
            const value = input.value || input.placeholder;
            previewCode = previewCode.replace(`\${${fieldName}}`, value);
        });
        
        preview.textContent = previewCode;
    }
}

function saveBlockEdit(blockId) {
    const modal = document.getElementById('edit-modal');
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    
    if (!modal || !block) return;
    
    const blockType = block.getAttribute('data-block-type');
    const template = blockTemplates[blockType];
    const inputs = modal.querySelectorAll('input, select');
    
    const newBlockData = {};
    let newCode = template.template;
    
    inputs.forEach(input => {
        const fieldName = input.getAttribute('data-field');
        const value = input.value;
        newBlockData[fieldName] = value;
        newCode = newCode.replace(`\${${fieldName}}`, value);
    });
    
    // Update block
    block.setAttribute('data-code', newCode);
    block.setAttribute('data-block-data', JSON.stringify(newBlockData));
    block.querySelector('.block-content').textContent = newCode;
    
    // Update program structure and text editor
    updateProgramStructure();
    updateTextEditor();
    
    closeEditModal();
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.remove();
    }
}

function cancelBlockSelection(element) {
    const selector = element.closest('.block-selector');
    selector.remove();
}

function updateProgramStructure() {
    const dropZones = document.querySelectorAll('.drop-zone');
    programBlocks = [];
    
    dropZones.forEach((zone, index) => {
        const block = zone.querySelector('.code-block.dropped-block');
        if (block) {
            programBlocks.push({
                line: index + 1,
                code: block.getAttribute('data-code'),
                text: block.textContent.replace('×', '').replace(/\s*Edit\s*/, '').trim(),
                blockType: block.getAttribute('data-block-type'),
                blockData: block.getAttribute('data-block-data')
            });
        }
    });
    
    console.log('Program structure updated:', programBlocks);
    
    // Enhanced event dispatch with more context
    document.dispatchEvent(new CustomEvent('programStructureUpdated', {
        detail: { 
            blocks: programBlocks,
            timestamp: Date.now(),
            totalBlocks: programBlocks.length
        }
    }));
    
    // Trigger flowchart update with debouncing
    clearTimeout(window.flowchartUpdateTimeout);
    window.flowchartUpdateTimeout = setTimeout(() => {
        if (typeof updateFlowchart === 'function') {
            updateFlowchart();
        }
    }, 100);
}

function generateCodeFromBlocks() {
    updateProgramStructure();
    
    if (programBlocks.length === 0) {
        return '';
    }
    
    let code = '';
    let indentLevel = 0;
    
    programBlocks.forEach(block => {
        const blockCode = block.code;
        
        // Handle indentation
        if (blockCode === '}') {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indent = '    '.repeat(indentLevel);
        code += indent + blockCode + '\n';
        
        // Increase indent for opening braces
        if (blockCode.includes('{')) {
            indentLevel++;
        }
    });
    
    return code;
}

function clearVisualBlocks() {
    const programBuilder = document.getElementById('program-builder');
    const dropZones = programBuilder.querySelectorAll('.drop-zone');
    
    // Clear all zones
    dropZones.forEach(zone => {
        zone.innerHTML = '';
    });
    
    // Remove extra zones, keep only 8
    const extraZones = Array.from(dropZones).slice(8);
    extraZones.forEach(zone => {
        zone.remove();
    });
    
    // Ensure we have exactly 8 drop zones
    const remainingZones = programBuilder.querySelectorAll('.drop-zone');
    const neededZones = 8 - remainingZones.length;
    
    for (let i = 0; i < neededZones; i++) {
        const newDropZone = document.createElement('div');
        newDropZone.className = 'drop-zone';
        newDropZone.setAttribute('data-line', remainingZones.length + i + 1);
        
        // Add event listeners
        newDropZone.addEventListener('dragover', handleDragOver);
        newDropZone.addEventListener('dragenter', handleDragEnter);
        newDropZone.addEventListener('dragleave', handleDragLeave);
        newDropZone.addEventListener('drop', handleDrop);
        newDropZone.addEventListener('click', handleZoneClick);
        
        programBuilder.appendChild(newDropZone);
    }
    
    programBlocks = [];
    updateTextEditor();
    console.log('Visual blocks cleared');
}

function updateRemoveButtons() {
    const droppedBlocks = document.querySelectorAll('.code-block.dropped-block');
    droppedBlocks.forEach(block => {
        if (!block.querySelector('.btn-close')) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-close btn-close-white float-end';
            removeBtn.title = 'Remove block';
            removeBtn.onclick = function() { removeBlock(this); };
            block.appendChild(removeBtn);
        }
    });
}

function addDropZoneIfNeeded() {
    const programBuilder = document.getElementById('program-builder');
    const dropZones = programBuilder.querySelectorAll('.drop-zone');
    const lastDropZone = dropZones[dropZones.length - 1];
    
    // Check if the last drop zone has a block in it
    if (lastDropZone && lastDropZone.querySelector('.dropped-block')) {
        const newDropZone = document.createElement('div');
        const nextLine = dropZones.length + 1;
        newDropZone.className = 'drop-zone';
        newDropZone.setAttribute('data-line', nextLine);
        
        // Add event listeners
        newDropZone.addEventListener('dragover', handleDragOver);
        newDropZone.addEventListener('dragenter', handleDragEnter);
        newDropZone.addEventListener('dragleave', handleDragLeave);
        newDropZone.addEventListener('drop', handleDrop);
        newDropZone.addEventListener('click', handleZoneClick);
        
        // Add with animation
        newDropZone.style.opacity = '0';
        newDropZone.style.transform = 'translateY(-10px)';
        programBuilder.appendChild(newDropZone);
        
        // Animate in
        setTimeout(() => {
            newDropZone.style.transition = 'all 0.3s ease';
            newDropZone.style.opacity = '1';
            newDropZone.style.transform = 'translateY(0)';
        }, 100);
        
        console.log('Added new drop zone at line', nextLine);
    }
}

function removeEmptyDropZones() {
    const programBuilder = document.getElementById('program-builder');
    const dropZones = programBuilder.querySelectorAll('.drop-zone');
    
    // Keep at least 8 drop zones, remove empty ones beyond that
    if (dropZones.length > 8) {
        for (let i = dropZones.length - 1; i >= 8; i--) {
            const zone = dropZones[i];
            if (!zone.querySelector('.dropped-block')) {
                // Check if it's the last zone and there's at least one empty zone before it
                const hasEmptyBefore = Array.from(dropZones).slice(0, i).some(z => !z.querySelector('.dropped-block'));
                if (hasEmptyBefore) {
                    zone.style.transition = 'all 0.3s ease';
                    zone.style.opacity = '0';
                    zone.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        if (zone.parentNode) {
                            zone.parentNode.removeChild(zone);
                        }
                    }, 300);
                }
            }
        }
    }
}

// Auto-suggestion system
function suggestNextBlock() {
    const lastBlock = programBlocks[programBlocks.length - 1];
    if (!lastBlock) return null;
    
    const suggestions = {
        '#include <stdio.h>': ['int main() {'],
        'int main() {': ['printf("Hello, World!");', 'int number;', 'return 0;'],
        'printf("Hello, World!");': ['return 0;'],
        'int number;': ['scanf("%d", &number);'],
        'scanf("%d", &number);': ['if (number % 2 == 0) {', 'printf("%d", number);'],
        'if (number % 2 == 0) {': ['printf("Even");', 'printf("%d is even", number);'],
        'for (int i = 1; i <= n; i++) {': ['printf("%d\\n", i);'],
        'return 0;': ['}']
    };
    
    return suggestions[lastBlock.code] || null;
}

function showSuggestions() {
    const suggestions = suggestNextBlock();
    if (!suggestions) return;
    
    const suggestionPanel = document.createElement('div');
    suggestionPanel.className = 'alert alert-info mt-2';
    suggestionPanel.innerHTML = `
        <h6><i class="fas fa-lightbulb me-2"></i>Suggestions:</h6>
        <div class="d-flex flex-wrap gap-2">
            ${suggestions.map(suggestion => `
                <button class="btn btn-outline-primary btn-sm" 
                        onclick="applySuggestion('${suggestion}')">
                    <code>${suggestion}</code>
                </button>
            `).join('')}
        </div>
    `;
    
    const container = document.querySelector('.visual-blocks-container');
    const existingSuggestions = container.querySelector('.alert-info');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    container.appendChild(suggestionPanel);
}

function applySuggestion(code) {
    const emptyZone = document.querySelector('.drop-zone:empty');
    if (emptyZone) {
        const block = createDroppedBlock(code, code);
        emptyZone.appendChild(block);
        updateProgramStructure();
        block.classList.add('fade-in-up');
    }
    
    // Remove suggestions panel
    const suggestionPanel = document.querySelector('.visual-blocks-container .alert-info');
    if (suggestionPanel) {
        suggestionPanel.remove();
    }
}

// Validation system
function validateBlockSequence() {
    const errors = [];
    let hasInclude = false;
    let hasMain = false;
    let braceCount = 0;
    
    programBlocks.forEach(block => {
        const code = block.code;
        
        if (code.includes('#include')) {
            hasInclude = true;
        }
        
        if (code.includes('int main()')) {
            hasMain = true;
        }
        
        if (code.includes('{')) {
            braceCount++;
        }
        
        if (code === '}') {
            braceCount--;
        }
    });
    
    if (!hasInclude) {
        errors.push('Missing #include <stdio.h> directive');
    }
    
    if (!hasMain) {
        errors.push('Missing main() function');
    }
    
    if (braceCount !== 0) {
        errors.push('Mismatched braces { }');
    }
    
    return errors;
}

function showValidationErrors(errors) {
    const container = document.querySelector('.visual-blocks-container');
    const existingErrors = container.querySelector('.alert-danger');
    if (existingErrors) {
        existingErrors.remove();
    }
    
    if (errors.length > 0) {
        const errorPanel = document.createElement('div');
        errorPanel.className = 'alert alert-danger mt-2';
        errorPanel.innerHTML = `
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Validation Errors:</h6>
            <ul class="mb-0">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        container.appendChild(errorPanel);
    }
}

// Block category filtering
function setupBlockFiltering() {
    const categoryRadios = document.querySelectorAll('input[name="blockCategory"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            filterBlocksByCategory(this.id);
        });
    });
}

function filterBlocksByCategory(selectedCategory) {
    const categories = document.querySelectorAll('.block-category');
    const blocks = document.querySelectorAll('#blocks-palette .code-block');
    
    if (selectedCategory === 'allBlocks') {
        categories.forEach(cat => cat.style.display = 'block');
        blocks.forEach(block => block.style.display = 'inline-block');
    } else {
        const categoryMap = {
            'basicBlocks': ['basic'],
            'ioBlocks': ['io'],
            'controlBlocks': ['control'],
            'loopBlocks': ['loops'],
            'advancedBlocks': ['functions', 'preprocessor', 'misc', 'memory', 'variables', 'operators']
        };
        
        const allowedCategories = categoryMap[selectedCategory] || [];
        
        categories.forEach(cat => {
            const categoryName = cat.getAttribute('data-category');
            if (allowedCategories.includes(categoryName)) {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        });
        
        // Also show blocks that don't have categories (basic blocks)
        blocks.forEach(block => {
            const category = block.closest('.block-category');
            if (!category) {
                block.style.display = allowedCategories.includes('basic') ? 'inline-block' : 'none';
            }
        });
    }
}

// Add search functionality
function addSearchFunctionality() {
    const palette = document.getElementById('blocks-palette');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mb-2';
    searchContainer.innerHTML = `
        <div class="input-group input-group-sm">
            <span class="input-group-text">
                <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" id="blockSearch" placeholder="Search blocks...">
            <button class="btn btn-outline-secondary" type="button" onclick="clearSearch()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    palette.parentNode.insertBefore(searchContainer, palette);
    
    const searchInput = document.getElementById('blockSearch');
    searchInput.addEventListener('input', function() {
        searchBlocks(this.value);
    });
}

function searchBlocks(searchTerm) {
    const blocks = document.querySelectorAll('#blocks-palette .code-block');
    const term = searchTerm.toLowerCase();
    
    blocks.forEach(block => {
        const blockText = block.textContent.toLowerCase();
        const blockType = block.getAttribute('data-block-type') || '';
        const blockCode = block.getAttribute('data-code') || '';
        
        if (blockText.includes(term) || blockType.includes(term) || blockCode.toLowerCase().includes(term)) {
            block.style.display = 'inline-block';
        } else {
            block.style.display = 'none';
        }
    });
}

function clearSearch() {
    const searchInput = document.getElementById('blockSearch');
    searchInput.value = '';
    searchBlocks('');
}

// Enhanced auto-suggestion system with more patterns
function suggestNextBlock() {
    const lastBlock = programBlocks[programBlocks.length - 1];
    if (!lastBlock) return ['#include <stdio.h>', 'int main() {'];
    
    const suggestions = {
        '#include <stdio.h>': ['int main() {', '#include <stdlib.h>', '#define MAX_SIZE 100'],
        'int main() {': ['printf("Hello, World!");', 'int number = 0;', 'scanf("%d", &number);'],
        'printf("Hello, World!");': ['return 0;', 'scanf("%d", &number);'],
        'int number = 0;': ['scanf("%d", &number);', 'printf("%d", number);'],
        'scanf("%d", &number);': ['if (number % 2 == 0) {', 'printf("%d", number);', 'while (number > 0) {'],
        'if (number % 2 == 0) {': ['printf("Even");', 'printf("%d is even", number);', '}'],
        'else {': ['printf("Odd");', 'printf("%d is odd", number);'],
        'for (int i = 0; i < n; i++) {': ['printf("%d\\n", i);', 'scanf("%d", &number);', '}'],
        'while (i < 10) {': ['printf("%d ", i);', 'i++;', '}'],
        'switch (choice) {': ['case 1:', 'default:', '}'],
        'case 1:': ['printf("Option 1");', 'break;'],
        'break;': ['case 2:', 'default:', '}'],
        'default:': ['printf("Invalid option");', 'break;'],
        'return 0;': ['}'],
        '// This is a comment': ['int number = 0;', 'printf("Hello, World!");']
    };
    
    return suggestions[lastBlock.code] || null;
}

// Block validation with more comprehensive checks
function validateBlockSequence() {
    const errors = [];
    let hasInclude = false;
    let hasMain = false;
    let braceCount = 0;
    let parenCount = 0;
    let inSwitch = false;
    let hasReturn = false;
    
    programBlocks.forEach((block, index) => {
        const code = block.code;
        
        // Check for includes
        if (code.includes('#include')) {
            hasInclude = true;
        }
        
        // Check for main function
        if (code.includes('int main()') || code.includes('void main()')) {
            hasMain = true;
        }
        
        // Check for return statement
        if (code.includes('return')) {
            hasReturn = true;
        }
        
        // Count braces
        if (code.includes('{')) {
            braceCount++;
        }
        
        if (code === '}') {
            braceCount--;
            if (inSwitch && code === '}') {
                inSwitch = false;
            }
        }
        
        // Check switch statements
        if (code.includes('switch')) {
            inSwitch = true;
        }
        
        // Check for break in switch
        if (inSwitch && code.includes('case') && index < programBlocks.length - 1) {
            const nextBlock = programBlocks[index + 1];
            if (nextBlock && !nextBlock.code.includes('break') && !nextBlock.code.includes('return')) {
                // Look ahead for break
                let foundBreak = false;
                for (let i = index + 1; i < programBlocks.length && i < index + 3; i++) {
                    if (programBlocks[i].code.includes('break') || programBlocks[i].code.includes('return')) {
                        foundBreak = true;
                        break;
                    }
                }
                if (!foundBreak) {
                    errors.push(`Missing 'break;' after case at line ${index + 1}`);
                }
            }
        }
        
        // Check for semicolons
        if (!code.includes('#') && !code.includes('//') && !code.includes('/*') && 
            !code.endsWith('{') && !code.endsWith('}') && !code.endsWith(':') &&
            !code.endsWith(';') && code.trim().length > 0) {
            errors.push(`Missing semicolon at line ${index + 1}`);
        }
    });
    
    if (!hasInclude) {
        errors.push('Missing #include <stdio.h> directive');
    }
    
    if (!hasMain) {
        errors.push('Missing main() function');
    }
    
    if (hasMain && !hasReturn) {
        errors.push('Main function should have a return statement');
    }
    
    if (braceCount !== 0) {
        errors.push(`Mismatched braces: ${braceCount > 0 ? 'missing closing' : 'extra closing'} brace(s)`);
    }
    
    return errors;
}

// Advanced code analysis
function analyzeCodeComplexity() {
    let complexity = 0;
    let lines = 0;
    
    programBlocks.forEach(block => {
        lines++;
        const code = block.code;
        
        // Increase complexity for control structures
        if (code.includes('if') || code.includes('while') || code.includes('for') || 
            code.includes('switch') || code.includes('case')) {
            complexity++;
        }
        
        // Nested structures increase complexity more
        if (code.includes('else if')) {
            complexity += 0.5;
        }
    });
    
    return {
        complexity: Math.round(complexity * 10) / 10,
        lines: lines,
        difficulty: complexity < 2 ? 'Beginner' : complexity < 5 ? 'Intermediate' : 'Advanced'
    };
}

// Export functions for use in task.html
window.generateCodeFromBlocks = generateCodeFromBlocks;
window.clearVisualBlocks = clearVisualBlocks;
window.removeBlock = removeBlock;
window.selectBlock = selectBlock;
window.cancelBlockSelection = cancelBlockSelection;
window.applySuggestion = applySuggestion;
window.filterBlocksByCategory = filterBlocksByCategory;
window.searchBlocks = searchBlocks;
window.clearSearch = clearSearch;
window.analyzeCodeComplexity = analyzeCodeComplexity;
