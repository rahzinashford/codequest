// Monaco Editor Integration for Colunn IDE

let monacoEditor = null;
const languageMapping = {
    'c': 'c',
    'cpp': 'cpp',
    'python': 'python',
    'java': 'java'
};

function initializeCodeEditor() {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });
    
    require(['vs/editor/editor.main'], function () {
        const container = document.getElementById('monaco-editor');
        if (!container) {
            console.error('Monaco editor container not found');
            return;
        }

        monacoEditor = monaco.editor.create(container, {
            value: getInitialCode(),
            language: languageMapping[window.Colunn?.currentLanguage || 'c'],
            theme: 'vs-dark',
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            }
        });

        // Add resize observer for better layout
        const resizeObserver = new ResizeObserver(() => {
            if (monacoEditor) {
                monacoEditor.layout();
            }
        });
        resizeObserver.observe(container);

        // Store editor reference globally
        if (window.Colunn) {
            window.Colunn.editor = monacoEditor;
        }

        console.log('Monaco Editor initialized successfully');
    });
}

function getInitialCode() {
    const language = window.Colunn?.currentLanguage || 'c';
    
    const templates = {
        'c': `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
        'cpp': `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
        'python': `print("Hello, World!")`,
        'java': `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
    };
    
    return templates[language] || templates['c'];
}

function updateEditorLanguage(language) {
    if (monacoEditor && languageMapping[language]) {
        const model = monacoEditor.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, languageMapping[language]);
        }
        
        // Update template code if editor is empty or has default content
        const currentContent = monacoEditor.getValue().trim();
        if (!currentContent || isDefaultTemplate(currentContent)) {
            monacoEditor.setValue(getInitialCode());
        }
    }
}

function isDefaultTemplate(content) {
    const templates = [
        '#include <stdio.h>',
        '#include <iostream>',
        'print("Hello, World!")',
        'public class Main'
    ];
    
    return templates.some(template => content.includes(template));
}

function getEditorContent() {
    return monacoEditor ? monacoEditor.getValue() : '';
}

function setEditorContent(content) {
    if (monacoEditor) {
        monacoEditor.setValue(content);
    }
}

function insertAtCursor(text) {
    if (monacoEditor) {
        const position = monacoEditor.getPosition();
        const range = new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
        );
        
        monacoEditor.executeEdits('insert-text', [{
            range: range,
            text: text,
            forceMoveMarkers: true
        }]);
        
        monacoEditor.focus();
    }
}

function formatCode() {
    if (monacoEditor) {
        monacoEditor.getAction('editor.action.formatDocument').run();
    }
}

function findInCode(searchTerm) {
    if (monacoEditor) {
        monacoEditor.getAction('actions.find').run();
    }
}

// Expose functions globally
window.initializeCodeEditor = initializeCodeEditor;
window.updateEditorLanguage = updateEditorLanguage;
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;
window.insertAtCursor = insertAtCursor;
window.formatCode = formatCode;
window.findInCode = findInCode;
