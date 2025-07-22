// Code Editor functionality for CodeQuest

let monacoEditor = null;
let currentLanguage = 'c';
let autoSaveTimer = null;

// Monaco Editor configuration
const editorConfig = {
    value: '',
    language: currentLanguage,
    theme: 'vs',
    automaticLayout: true,
    fontSize: 14,
    fontFamily: '"Cascadia Code", "Fira Code", "Monaco", "Consolas", monospace',
    minimap: { 
        enabled: false 
    },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    selectOnLineNumbers: true,
    matchBrackets: 'always',
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    renderWhitespace: 'selection',
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    quickSuggestions: true,
    parameterHints: {
        enabled: true
    },
    hover: {
        enabled: true
    }
};

// C language specific snippets
const cSnippets = {
    'printf': {
        prefix: 'printf',
        body: 'printf("${1:Hello, World!}");$0',
        description: 'Print formatted text'
    },
    'scanf': {
        prefix: 'scanf',
        body: 'scanf("${1:%d}", &${2:variable});$0',
        description: 'Read formatted input'
    },
    'for': {
        prefix: 'for',
        body: 'for (${1:int i = 0}; ${2:i < n}; ${3:i++}) {\n\t$0\n}',
        description: 'For loop'
    },
    'while': {
        prefix: 'while',
        body: 'while (${1:condition}) {\n\t$0\n}',
        description: 'While loop'
    },
    'if': {
        prefix: 'if',
        body: 'if (${1:condition}) {\n\t$0\n}',
        description: 'If statement'
    },
    'ifelse': {
        prefix: 'ifelse',
        body: 'if (${1:condition}) {\n\t$2\n} else {\n\t$0\n}',
        description: 'If-else statement'
    },
    'main': {
        prefix: 'main',
        body: '#include <stdio.h>\n\nint main() {\n\t$0\n\treturn 0;\n}',
        description: 'Main function template'
    },
    'include': {
        prefix: 'include',
        body: '#include <${1:stdio.h}>$0',
        description: 'Include header'
    }
};

// Initialize the Monaco Editor
function initializeCodeEditor(elementId, initialCode = '') {
    if (!window.monaco) {
        console.error('Monaco editor not loaded');
        return null;
    }

    const container = document.getElementById(elementId);
    if (!container) {
        console.error('Editor container not found:', elementId);
        return null;
    }

    // Set up C language support
    setupCLanguageSupport();

    // Create the editor
    editorConfig.value = initialCode;
    monacoEditor = monaco.editor.create(container, editorConfig);

    // Set up event listeners
    setupEditorEventListeners();

    // Set up auto-save
    setupAutoSave();

    console.log('Monaco editor initialized');
    return monacoEditor;
}

function setupCLanguageSupport() {
    // Register C language if not already registered
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'c')) {
        monaco.languages.register({ id: 'c' });
    }

    // Set up syntax highlighting for C
    monaco.languages.setMonarchTokensProvider('c', {
        tokenizer: {
            root: [
                [/\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/, 'keyword'],
                [/\b(printf|scanf|malloc|free|strlen|strcpy|strcmp|strcat|fopen|fclose|fprintf|fscanf|fgets|fputs)\b/, 'keyword.library'],
                [/#\s*(include|define|ifdef|ifndef|endif|if|else|elif|pragma)\b/, 'keyword.directive'],
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/"/, 'string', '@string'],
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],
                [/[;,.]/, 'delimiter'],
                [/[{}()\[\]]/, '@brackets'],
                [/[<>!~?:&|+\-*\/\^%=]+/, 'operator']
            ],
            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment', '@push'],
                ["\\*/", 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],
            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ]
        },
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/
    });

    // Set up autocompletion
    monaco.languages.registerCompletionItemProvider('c', {
        provideCompletionItems: function(model, position) {
            const suggestions = [];
            
            Object.keys(cSnippets).forEach(key => {
                const snippet = cSnippets[key];
                suggestions.push({
                    label: snippet.prefix,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    documentation: snippet.description,
                    insertText: snippet.body,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endColumn: position.column
                    }
                });
            });

            return { suggestions: suggestions };
        }
    });

    // Set up hover provider
    monaco.languages.registerHoverProvider('c', {
        provideHover: function(model, position) {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const documentation = getCDocumentation(word.word);
            if (documentation) {
                return {
                    range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                    ),
                    contents: [
                        { value: `**${word.word}**` },
                        { value: documentation }
                    ]
                };
            }
            return null;
        }
    });
}

function getCDocumentation(word) {
    const docs = {
        'printf': 'Prints formatted output to stdout\n\nSyntax: printf(format, ...)',
        'scanf': 'Reads formatted input from stdin\n\nSyntax: scanf(format, ...)',
        'int': 'Integer data type (typically 32 bits)',
        'char': 'Character data type (8 bits)',
        'float': 'Floating-point data type (32 bits)',
        'double': 'Double-precision floating-point (64 bits)',
        'if': 'Conditional statement\n\nSyntax: if (condition) { ... }',
        'for': 'Loop statement\n\nSyntax: for (init; condition; update) { ... }',
        'while': 'Loop statement\n\nSyntax: while (condition) { ... }',
        'return': 'Returns a value from a function',
        'main': 'Entry point of a C program'
    };
    
    return docs[word] || null;
}

function setupEditorEventListeners() {
    if (!monacoEditor) return;

    // Content change listener
    monacoEditor.onDidChangeModelContent(() => {
        // Trigger auto-save
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        autoSaveTimer = setTimeout(autoSaveCode, 2000);

        // Real-time syntax validation
        validateCodeSyntax();
    });

    // Focus/blur listeners
    monacoEditor.onDidFocusEditorText(() => {
        console.log('Editor focused');
    });

    monacoEditor.onDidBlurEditorText(() => {
        console.log('Editor blurred');
        autoSaveCode();
    });

    // Key binding for quick actions
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        autoSaveCode();
        showNotification('Code saved', 'success', 2000);
    });

    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (typeof runCode === 'function') {
            runCode();
        }
    });
}

function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        if (monacoEditor && monacoEditor.hasTextFocus()) {
            autoSaveCode();
        }
    }, 30000);
}

function autoSaveCode() {
    if (!monacoEditor) return;

    const code = monacoEditor.getValue();
    const taskId = window.currentTask;

    if (code.trim() && taskId) {
        localStorage.setItem(`codequest-autosave-${taskId}`, code);
        console.log('Code auto-saved');
    }
}

function loadAutoSavedCode(taskId) {
    const saved = localStorage.getItem(`codequest-autosave-${taskId}`);
    if (saved && monacoEditor) {
        monacoEditor.setValue(saved);
        console.log('Auto-saved code loaded');
    }
}

function validateCodeSyntax() {
    if (!monacoEditor) return;

    const code = monacoEditor.getValue();
    const model = monacoEditor.getModel();
    
    // Basic C syntax validation
    const errors = [];
    const lines = code.split('\n');
    
    let braceCount = 0;
    let parenCount = 0;
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        // Check for balanced braces
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        // Check for balanced parentheses
        parenCount += (line.match(/\(/g) || []).length;
        parenCount -= (line.match(/\)/g) || []).length;
        
        // Check for missing semicolons (basic check)
        if (trimmed.length > 0 && 
            !trimmed.startsWith('#') && 
            !trimmed.startsWith('//') &&
            !trimmed.endsWith('{') && 
            !trimmed.endsWith('}') &&
            !trimmed.endsWith(';') &&
            trimmed.includes('printf')) {
            errors.push({
                startLineNumber: lineNum,
                startColumn: 1,
                endLineNumber: lineNum,
                endColumn: line.length + 1,
                message: 'Missing semicolon',
                severity: monaco.MarkerSeverity.Warning
            });
        }
    });
    
    // Check for unbalanced braces at the end
    if (braceCount !== 0) {
        errors.push({
            startLineNumber: lines.length,
            startColumn: 1,
            endLineNumber: lines.length,
            endColumn: lines[lines.length - 1].length + 1,
            message: 'Unbalanced braces',
            severity: monaco.MarkerSeverity.Error
        });
    }
    
    // Set markers
    monaco.editor.setModelMarkers(model, 'syntax', errors);
}

function formatCode() {
    if (!monacoEditor) return;
    
    monacoEditor.getAction('editor.action.formatDocument').run();
    showNotification('Code formatted', 'success', 2000);
}

function insertCodeSnippet(snippetKey) {
    if (!monacoEditor || !cSnippets[snippetKey]) return;
    
    const snippet = cSnippets[snippetKey];
    const position = monacoEditor.getPosition();
    
    monacoEditor.executeEdits('insert-snippet', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: snippet.body.replace(/\$\d+/g, '').replace(/\$0/, '')
    }]);
    
    monacoEditor.focus();
}

function toggleTheme() {
    if (!monacoEditor) return;
    
    const currentTheme = monacoEditor._themeService._theme.themeName;
    const newTheme = currentTheme === 'vs' ? 'vs-dark' : 'vs';
    
    monaco.editor.setTheme(newTheme);
    
    // Save preference
    const preferences = JSON.parse(localStorage.getItem('codequest-preferences') || '{}');
    preferences.editorTheme = newTheme;
    localStorage.setItem('codequest-preferences', JSON.stringify(preferences));
}

function increaseFontSize() {
    if (!monacoEditor) return;
    
    const currentSize = monacoEditor.getOptions().get(monaco.editor.EditorOption.fontSize);
    const newSize = Math.min(currentSize + 1, 24);
    
    monacoEditor.updateOptions({ fontSize: newSize });
    
    // Save preference
    const preferences = JSON.parse(localStorage.getItem('codequest-preferences') || '{}');
    preferences.editorFontSize = newSize;
    localStorage.setItem('codequest-preferences', JSON.stringify(preferences));
}

function decreaseFontSize() {
    if (!monacoEditor) return;
    
    const currentSize = monacoEditor.getOptions().get(monaco.editor.EditorOption.fontSize);
    const newSize = Math.max(currentSize - 1, 10);
    
    monacoEditor.updateOptions({ fontSize: newSize });
    
    // Save preference
    const preferences = JSON.parse(localStorage.getItem('codequest-preferences') || '{}');
    preferences.editorFontSize = newSize;
    localStorage.setItem('codequest-preferences', JSON.stringify(preferences));
}

function getEditorValue() {
    return monacoEditor ? monacoEditor.getValue() : '';
}

function setEditorValue(value) {
    if (monacoEditor) {
        monacoEditor.setValue(value || '');
    }
}

function focusEditor() {
    if (monacoEditor) {
        monacoEditor.focus();
    }
}

// Export functions for global use
window.initializeCodeEditor = initializeCodeEditor;
window.formatCode = formatCode;
window.insertCodeSnippet = insertCodeSnippet;
window.toggleTheme = toggleTheme;
window.increaseFontSize = increaseFontSize;
window.decreaseFontSize = decreaseFontSize;
window.getEditorValue = getEditorValue;
window.setEditorValue = setEditorValue;
window.focusEditor = focusEditor;
window.loadAutoSavedCode = loadAutoSavedCode;
