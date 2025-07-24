// Visual Programming Blocks for Colunn IDE

let blockCounter = 0;
let draggedBlock = null;

const blockTemplates = {
    'input-output': {
        'printf': {
            name: 'Print Output',
            code: 'printf("Hello World");',
            icon: 'fa-print',
            color: 'success',
            editable: true
        },
        'scanf': {
            name: 'Read Input',
            code: 'scanf("%d", &variable);',
            icon: 'fa-keyboard',
            color: 'info',
            editable: true
        }
    },
    'variables': {
        'int-declaration': {
            name: 'Integer Variable',
            code: 'int variable = 0;',
            icon: 'fa-hashtag',
            color: 'primary',
            editable: true
        },
        'string-declaration': {
            name: 'String Variable',
            code: 'char str[100] = "";',
            icon: 'fa-quote-right',
            color: 'warning',
            editable: true
        }
    },
    'control': {
        'if-statement': {
            name: 'If Statement',
            code: 'if (condition) {\n    // code here\n}',
            icon: 'fa-code-branch',
            color: 'danger',
            editable: true
        },
        'for-loop': {
            name: 'For Loop',
            code: 'for (int i = 0; i < 10; i++) {\n    // code here\n}',
            icon: 'fa-sync',
            color: 'secondary',
            editable: true
        },
        'while-loop': {
            name: 'While Loop',
            code: 'while (condition) {\n    // code here\n}',
            icon: 'fa-redo',
            color: 'dark',
            editable: true
        }
    },
    'functions': {
        'function-def': {
            name: 'Function',
            code: 'int functionName() {\n    return 0;\n}',
            icon: 'fa-cog',
            color: 'info',
            editable: true
        }
    }
};

function initializeVisualBlocks() {
    renderBlockPalette();
    setupDragAndDrop();
    console.log('Visual blocks initialized successfully');
}

function renderBlockPalette() {
    const palette = document.getElementById('blocks-palette');
    if (!palette) {
        console.error('Blocks palette container not found');
        return;
    }

    palette.innerHTML = '';

    for (const [category, blocks] of Object.entries(blockTemplates)) {
        // Create category header
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'block-category mb-3';
        
        const categoryHeader = document.createElement('h6');
        categoryHeader.className = 'text-muted text-uppercase fw-bold mb-2';
        categoryHeader.textContent = category.replace('-', ' & ');
        categoryDiv.appendChild(categoryHeader);

        // Create blocks for this category
        for (const [blockId, block] of Object.entries(blocks)) {
            const blockElement = createBlockElement(blockId, block);
            categoryDiv.appendChild(blockElement);
        }

        palette.appendChild(categoryDiv);
    }
}

function createBlockElement(blockId, block) {
    const blockDiv = document.createElement('div');
    blockDiv.className = `block-item btn btn-outline-${block.color} d-flex align-items-center mb-2 w-100 text-start`;
    blockDiv.draggable = true;
    blockDiv.dataset.blockId = blockId;
    blockDiv.dataset.blockCode = block.code;
    
    blockDiv.innerHTML = `
        <i class="fas ${block.icon} me-2"></i>
        <span class="flex-grow-1">${block.name}</span>
    `;

    // Add drag events
    blockDiv.addEventListener('dragstart', handleDragStart);
    blockDiv.addEventListener('click', () => addBlockToWorkspace(blockId, block));

    return blockDiv;
}

function setupDragAndDrop() {
    const workspace = document.getElementById('blocks-workspace');
    if (!workspace) return;

    workspace.addEventListener('dragover', handleDragOver);
    workspace.addEventListener('drop', handleDrop);
    workspace.addEventListener('click', handleWorkspaceClick);
}

function handleDragStart(e) {
    draggedBlock = {
        id: e.target.dataset.blockId,
        code: e.target.dataset.blockCode
    };
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedBlock) {
        const blockTemplate = findBlockTemplate(draggedBlock.id);
        if (blockTemplate) {
            addBlockToWorkspace(draggedBlock.id, blockTemplate);
        }
        draggedBlock = null;
    }
}

function findBlockTemplate(blockId) {
    for (const category of Object.values(blockTemplates)) {
        if (category[blockId]) {
            return category[blockId];
        }
    }
    return null;
}

function addBlockToWorkspace(blockId, block) {
    const workspace = document.getElementById('blocks-workspace');
    if (!workspace) return;

    const workspaceBlock = createWorkspaceBlock(blockId, block);
    workspace.appendChild(workspaceBlock);
    
    // Update Colunn state
    if (window.Colunn) {
        window.Colunn.programBlocks.push({
            id: workspaceBlock.id,
            type: blockId,
            code: block.code
        });
    }
}

function createWorkspaceBlock(blockId, block) {
    const blockDiv = document.createElement('div');
    blockDiv.className = `workspace-block card mb-2 border-${block.color}`;
    blockDiv.id = `workspace-block-${++blockCounter}`;
    
    blockDiv.innerHTML = `
        <div class="card-header bg-${block.color} text-white d-flex align-items-center">
            <i class="fas ${block.icon} me-2"></i>
            <span class="flex-grow-1">${block.name}</span>
            <button class="btn btn-sm btn-outline-light me-1" onclick="editBlock('${blockDiv.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-light" onclick="removeBlock('${blockDiv.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="card-body">
            <pre class="block-code mb-0"><code>${escapeHtml(block.code)}</code></pre>
        </div>
    `;

    return blockDiv;
}

function editBlock(blockId) {
    const block = document.getElementById(blockId);
    if (!block) return;

    const codeElement = block.querySelector('.block-code code');
    const currentCode = codeElement.textContent;

    // Create modal for editing
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Block Code</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <textarea class="form-control" rows="5" id="edit-code-textarea">${currentCode}</textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveBlockEdit('${blockId}')">Save</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function saveBlockEdit(blockId) {
    const textarea = document.getElementById('edit-code-textarea');
    const block = document.getElementById(blockId);
    
    if (textarea && block) {
        const newCode = textarea.value;
        const codeElement = block.querySelector('.block-code code');
        codeElement.textContent = newCode;
        
        // Update Colunn state
        if (window.Colunn) {
            const blockData = window.Colunn.programBlocks.find(b => b.id === blockId);
            if (blockData) {
                blockData.code = newCode;
            }
        }
    }

    // Close modal
    const modal = textarea.closest('.modal');
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
}

function removeBlock(blockId) {
    const block = document.getElementById(blockId);
    if (block) {
        block.remove();
        
        // Update Colunn state
        if (window.Colunn) {
            window.Colunn.programBlocks = window.Colunn.programBlocks.filter(b => b.id !== blockId);
        }
    }
}

function handleWorkspaceClick(e) {
    // Handle clicks on workspace but not on blocks
    if (e.target.id === 'blocks-workspace') {
        // Could add functionality for workspace-level actions
    }
}

function convertBlocksToCode() {
    if (!window.Colunn || !window.Colunn.programBlocks) {
        return '// No blocks to convert\n';
    }

    const language = window.Colunn.currentLanguage || 'c';
    let code = '';

    // Add appropriate headers based on language
    if (language === 'c') {
        code = '#include <stdio.h>\n\nint main() {\n';
    } else if (language === 'cpp') {
        code = '#include <iostream>\nusing namespace std;\n\nint main() {\n';
    } else if (language === 'java') {
        code = 'public class Main {\n    public static void main(String[] args) {\n';
    }

    // Add blocks code
    for (const block of window.Colunn.programBlocks) {
        const indent = (language === 'java') ? '        ' : '    ';
        const blockCode = block.code.split('\n').map(line => indent + line).join('\n');
        code += blockCode + '\n';
    }

    // Add appropriate footers
    if (language === 'c' || language === 'cpp') {
        code += '    return 0;\n}';
    } else if (language === 'java') {
        code += '    }\n}';
    }

    return code;
}

function clearVisualBlocks() {
    const workspace = document.getElementById('blocks-workspace');
    if (workspace) {
        workspace.innerHTML = '';
    }
    
    if (window.Colunn) {
        window.Colunn.programBlocks = [];
    }
}

function parseCodeToBlocks(code) {
    // Basic code parsing - this is a simplified implementation
    // In a real IDE, you'd want more sophisticated parsing
    clearVisualBlocks();
    
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
        if (line.includes('printf')) {
            addBlockToWorkspace('printf', blockTemplates['input-output']['printf']);
        } else if (line.includes('scanf')) {
            addBlockToWorkspace('scanf', blockTemplates['input-output']['scanf']);
        } else if (line.includes('int ') && line.includes('=')) {
            addBlockToWorkspace('int-declaration', blockTemplates['variables']['int-declaration']);
        } else if (line.includes('if (')) {
            addBlockToWorkspace('if-statement', blockTemplates['control']['if-statement']);
        } else if (line.includes('for (')) {
            addBlockToWorkspace('for-loop', blockTemplates['control']['for-loop']);
        } else if (line.includes('while (')) {
            addBlockToWorkspace('while-loop', blockTemplates['control']['while-loop']);
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions globally
window.initializeVisualBlocks = initializeVisualBlocks;
window.convertBlocksToCode = convertBlocksToCode;
window.clearVisualBlocks = clearVisualBlocks;
window.parseCodeToBlocks = parseCodeToBlocks;
window.editBlock = editBlock;
window.saveBlockEdit = saveBlockEdit;
window.removeBlock = removeBlock;
