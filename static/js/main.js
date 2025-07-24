// Colunn IDE - Full Featured Implementation
console.log('🚀 Colunn IDE Loading...');

// Global application state
const Colunn = {
    currentMode: 'blocks',
    currentLanguage: 'c',
    currentFilename: 'untitled.c',
    isCompiled: false,
    programBlocks: [],
    editor: null,
    initialized: false
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM Ready - Initializing Colunn IDE');
    initializeIDE();
});

function initializeIDE() {
    try {
        console.log('🔧 Setting up IDE...');
        
        // Show progress to user
        addToConsole('logs', '🚀 Initializing Colunn IDE...');
        
        // Setup basic event listeners first
        setupEventListeners();
        
        // Initialize Monaco Editor
        setTimeout(() => {
            initializeMonacoEditor();
            addToConsole('logs', '📝 Loading Monaco Editor...');
        }, 300);
        
        // Initialize Visual Blocks
        setTimeout(() => {
            initializeVisualBlocks();
            addToConsole('logs', '🧩 Setting up Visual Blocks...');
        }, 600);
        
        // Initialize Flowchart
        setTimeout(() => {
            initializeFlowchart();
            addToConsole('logs', '📊 Preparing Flowchart...');
        }, 900);
        
        // Set default view and finalize
        setTimeout(() => {
            switchView('blocks');
            setupConsole();
            Colunn.initialized = true;
            showWelcomeMessage();
            addToConsole('logs', '✅ Colunn IDE ready!');
        }, 1200);
        
    } catch (error) {
        console.error('❌ IDE Initialization Error:', error);
        addToConsole('error', `Initialization failed: ${error.message}`);
        showErrorFallback(error);
    }
}

function setupEventListeners() {
    // View switcher buttons
    const viewButtons = [
        { id: 'visual-view-btn', mode: 'blocks' },
        { id: 'text-view-btn', mode: 'text' },
        { id: 'flowchart-view-btn', mode: 'flowchart' }
    ];
    
    viewButtons.forEach(({ id, mode }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => switchView(mode));
        }
    });
    
    // Control buttons
    const compileBtn = document.getElementById('compile-btn');
    if (compileBtn) {
        compileBtn.addEventListener('click', compileCode);
    }
    
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', runCode);
    }
    
    // Language selector
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
    }
    
    // Console tabs
    document.querySelectorAll('.console-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            switchConsoleTab(tab.dataset.tab);
        });
    });
    
    // Console clear button
    const clearConsoleBtn = document.getElementById('clear-console');
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', clearConsole);
    }
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('toggle-sidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    console.log('🔗 Event listeners set up');
}

function initializeMonacoEditor() {
    if (typeof require !== 'undefined') {
        try {
            require.config({ 
                paths: { 
                    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
                } 
            });
            
            require(['vs/editor/editor.main'], function () {
                const container = document.getElementById('monaco-editor');
                if (container) {
                    Colunn.editor = monaco.editor.create(container, {
                        value: getDefaultCode(Colunn.currentLanguage),
                        language: getMonacoLanguage(Colunn.currentLanguage),
                        theme: 'vs-dark',
                        fontSize: 14,
                        wordWrap: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                    });
                    
                    // Add change listener
                    Colunn.editor.onDidChangeModelContent(() => {
                        Colunn.isCompiled = false;
                        updateFileStatus();
                    });
                    
                    console.log('✅ Monaco Editor initialized');
                }
            });
        } catch (error) {
            console.warn('⚠️ Monaco Editor failed to load:', error);
            addToConsole('error', 'Text editor failed to load. Please refresh the page.');
        }
    }
}

function initializeVisualBlocks() {
    try {
        // Setup block palette
        setupBlockPalette();
        
        // Setup drag and drop
        setupDragAndDrop();
        
        console.log('✅ Visual blocks initialized');
    } catch (error) {
        console.warn('⚠️ Visual blocks failed:', error);
    }
}

function initializeFlowchart() {
    try {
        // Setup flowchart area
        const flowchartArea = document.getElementById('flowchart-area');
        if (flowchartArea) {
            // Add refresh button functionality
            const refreshBtn = document.getElementById('refresh-flowchart');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', generateFlowchart);
            }
        }
        
        console.log('✅ Flowchart initialized');
    } catch (error) {
        console.warn('⚠️ Flowchart failed:', error);
    }
}

function setupConsole() {
    // Ensure console exists and set default tab
    const consoleTabs = document.querySelectorAll('.console-tab');
    if (consoleTabs.length > 0) {
        switchConsoleTab('logs');
    }
    
    // Add initial welcome message
    addToConsole('logs', '🎯 Console system ready');
}

function switchView(mode) {
    if (!Colunn.initialized) {
        console.log('⚠️ IDE not initialized yet, deferring view switch');
        return;
    }
    
    Colunn.currentMode = mode;
    
    // Hide all work areas
    document.querySelectorAll('.work-area').forEach(area => {
        area.classList.add('d-none');
    });
    
    // Update buttons
    document.querySelectorAll('.view-switcher .btn').forEach(btn => {
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-outline-primary');
    });
    
    // Show selected area and activate button
    let targetArea, targetBtn;
    switch(mode) {
        case 'blocks':
            targetArea = 'visual-blocks-area';
            targetBtn = 'visual-view-btn';
            break;
        case 'text':
            targetArea = 'text-editor-area';
            targetBtn = 'text-view-btn';
            // Resize Monaco editor
            setTimeout(() => {
                if (Colunn.editor) {
                    Colunn.editor.layout();
                }
            }, 100);
            break;
        case 'flowchart':
            targetArea = 'flowchart-area';
            targetBtn = 'flowchart-view-btn';
            break;
    }
    
    const area = document.getElementById(targetArea);
    const btn = document.getElementById(targetBtn);
    
    if (area) {
        area.classList.remove('d-none');
    }
    if (btn) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary', 'active');
    }
    
    console.log(`🔄 Switched to ${mode} view`);
    addToConsole('logs', `Switched to ${mode} view`);
}

function changeLanguage(language) {
    Colunn.currentLanguage = language;
    
    const extensions = { 
        'c': '.c', 
        'cpp': '.cpp', 
        'python': '.py', 
        'java': '.java' 
    };
    
    const baseName = Colunn.currentFilename.replace(/\.[^/.]+$/, "");
    Colunn.currentFilename = baseName + extensions[language];
    
    // Update filename display
    const filenameEl = document.getElementById('current-filename');
    if (filenameEl) filenameEl.textContent = Colunn.currentFilename;
    
    // Update Monaco editor
    if (Colunn.editor) {
        const newCode = getDefaultCode(language);
        Colunn.editor.setValue(newCode);
        monaco.editor.setModelLanguage(Colunn.editor.getModel(), getMonacoLanguage(language));
    }
    
    Colunn.isCompiled = false;
    updateFileStatus();
    
    console.log(`🔧 Changed language to ${language}`);
    addToConsole('logs', `Language changed to ${language}`);
}

function compileCode() {
    let code = '';
    
    if (Colunn.currentMode === 'text' && Colunn.editor) {
        code = Colunn.editor.getValue();
    } else if (Colunn.currentMode === 'blocks') {
        code = generateCodeFromBlocks();
    }
    
    if (!code.trim()) {
        addToConsole('error', 'No code to compile!');
        return;
    }
    
    addToConsole('logs', `🔨 Compiling ${Colunn.currentLanguage} code...`);
    
    // Show loading state
    const compileBtn = document.getElementById('compile-btn');
    if (compileBtn) {
        compileBtn.disabled = true;
        compileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compiling...';
    }
    
    fetch('/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code: code,
            language: Colunn.currentLanguage,
            filename: Colunn.currentFilename
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            Colunn.isCompiled = true;
            addToConsole('logs', '✅ Compilation successful!');
            if (result.output) {
                addToConsole('output', result.output);
            }
            switchConsoleTab('output');
        } else {
            Colunn.isCompiled = false;
            addToConsole('error', result.error || 'Compilation failed');
            switchConsoleTab('errors');
        }
        updateFileStatus();
    })
    .catch(error => {
        console.error('Compilation error:', error);
        addToConsole('error', 'Network error during compilation');
        Colunn.isCompiled = false;
        updateFileStatus();
    })
    .finally(() => {
        // Reset button state
        if (compileBtn) {
            compileBtn.disabled = false;
            compileBtn.innerHTML = '<i class="fas fa-cog"></i> Compile';
        }
    });
}

function runCode() {
    let code = '';
    
    if (Colunn.currentMode === 'text' && Colunn.editor) {
        code = Colunn.editor.getValue();
    } else if (Colunn.currentMode === 'blocks') {
        code = generateCodeFromBlocks();
    }
    
    if (!code.trim()) {
        addToConsole('error', 'No code to run!');
        return;
    }
    
    addToConsole('logs', `▶️ Running ${Colunn.currentLanguage} code...`);
    
    // Show loading state
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    }
    
    fetch('/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code: code,
            language: Colunn.currentLanguage,
            filename: Colunn.currentFilename
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success || result.output) {
            addToConsole('output', result.output || 'Program executed successfully.');
            switchConsoleTab('output');
        } else {
            addToConsole('error', result.error || 'Execution failed');
            switchConsoleTab('errors');
        }
    })
    .catch(error => {
        console.error('Execution error:', error);
        addToConsole('error', 'Network error during execution');
    })
    .finally(() => {
        // Reset button state
        if (runBtn) {
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
        }
    });
}

function switchConsoleTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.console-tab').forEach(t => {
        t.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Update panels
    document.querySelectorAll('.console-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const activePanel = document.getElementById(`${tab}-panel`);
    if (activePanel) activePanel.classList.add('active');
}

function addToConsole(type, message) {
    const panelMap = {
        'logs': 'logs-text',
        'error': 'error-text', 
        'errors': 'error-text',
        'output': 'output-text'
    };
    
    const panelId = panelMap[type] || 'output-text';
    const panel = document.getElementById(panelId);
    
    if (panel) {
        const div = document.createElement('div');
        div.className = `console-${type}`;
        div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        panel.appendChild(div);
        panel.scrollTop = panel.scrollHeight;
    }
}

function updateFileStatus() {
    const statusEl = document.getElementById('file-status');
    if (statusEl) {
        statusEl.textContent = Colunn.isCompiled ? '✓' : '●';
        statusEl.style.color = Colunn.isCompiled ? '#28a745' : '#dc3545';
        statusEl.title = Colunn.isCompiled ? 'Compiled' : 'Not compiled';
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainArea = document.querySelector('.main-area');
    const toggleBtn = document.getElementById('toggle-sidebar');
    
    if (sidebar && mainArea && toggleBtn) {
        sidebar.classList.toggle('d-none');
        
        if (sidebar.classList.contains('d-none')) {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            toggleBtn.title = 'Show sidebar';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            toggleBtn.title = 'Hide sidebar';
        }
        
        // Resize Monaco editor if visible
        if (Colunn.currentMode === 'text' && Colunn.editor) {
            setTimeout(() => Colunn.editor.layout(), 300);
        }
        
        addToConsole('logs', sidebar.classList.contains('d-none') ? 'Sidebar hidden' : 'Sidebar shown');
    }
}

function showWelcomeMessage() {
    addToConsole('logs', '🎉 Welcome to Colunn IDE!');
    addToConsole('logs', '💡 Choose between Visual Blocks, Text Editor, or Flowchart view');
    addToConsole('logs', '🚀 Start coding in C, C++, Python, or Java');
    addToConsole('logs', '⚡ Use Compile & Run buttons to test your code');
}

function showErrorFallback(error) {
    document.body.innerHTML = `
        <div class="container mt-5">
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle"></i> Colunn IDE Error</h4>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>The IDE failed to initialize properly. Please try:</p>
                <ul>
                    <li>Refreshing the page</li>
                    <li>Checking your internet connection</li>
                    <li>Clearing browser cache</li>
                </ul>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Reload Page
                </button>
            </div>
        </div>`;
}

// Helper functions
function getDefaultCode(language) {
    const templates = {
        'c': '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
        'cpp': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
        'python': 'print("Hello, World!")',
        'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
    };
    return templates[language] || templates['c'];
}

function getMonacoLanguage(language) {
    const mapping = {
        'c': 'c',
        'cpp': 'cpp',
        'python': 'python',
        'java': 'java'
    };
    return mapping[language] || 'c';
}

function setupBlockPalette() {
    // Placeholder for visual blocks setup
    console.log('Setting up block palette...');
}

function setupDragAndDrop() {
    // Placeholder for drag and drop setup
    console.log('Setting up drag and drop...');
}

function generateCodeFromBlocks() {
    // Placeholder for block to code conversion
    return getDefaultCode(Colunn.currentLanguage);
}

function generateFlowchart() {
    // Placeholder for flowchart generation
    addToConsole('logs', 'Flowchart refresh requested');
}

function clearConsole() {
    // Clear all console panels
    const panels = ['logs-text', 'output-text', 'error-text'];
    panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.innerHTML = '';
        }
    });
    
    addToConsole('logs', 'Console cleared');
    console.log('🧹 Console cleared');
}

// Expose globally
window.Colunn = Colunn;

console.log('📁 Colunn main.js loaded successfully');
