
function getBoilerplateCode(language, userCode) {
    switch (language) {
        case 'java':
            return `
public class Main {
    public static void main(String[] args) {
        ${userCode}
    }
}
            `;
        case 'cpp':
            return `
            #include <iostream>
            using namespace std;

            int main() {
                ${userCode}
                return 0;
            }
            `;
        case 'javascript':
        case 'python':
            return '/* Write your code here */';
        default:
            return userCode; // Default to user code if language is not recognized
    }
}
function updateEditorWithBoilerplate(language) {

    const boilerplateCode = getBoilerplateCode(language, '');
    editor.setValue(boilerplateCode);
}


// Initialize CodeMirror for code input (assuming CodeMirror is already loaded)
const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    lineNumbers: true,
    mode: 'javascript',  // Default language mode
    theme: 'default',
    matchBrackets: true
});

// Add event listener to the "Run Code" button
document.getElementById('run-code').addEventListener('click', async () => {
    const code = editor.getValue();
    const language = document.getElementById('language-select').value;

    // Generate the full code with boilerplate
    const fullCode = getBoilerplateCode(language, userCode);

    try {
        const response = await fetch('http://localhost:3000/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullCode, language })
        });

        if (!response.ok) {
            throw new Error('Error executing code: ' + await response.text());
        }

        const result = await response.text();
        console.log('Result:', result);
        document.getElementById('output').textContent = result;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('output').textContent = 'Execution failed: ' + error.message;
    }
});


// Handle language change in the dropdown to update CodeMirror mode
document.getElementById('language-select').addEventListener('change', (event) => {
    const language = event.target.value;
    let mode = 'javascript';  // Default mode
    const userConfirmation = confirm('Changing the language will clear the existing code. Continue?');
    
    if (userConfirmation) {
        updateEditorWithBoilerplate(language);
    } else {
        // Revert to previous language or take no action
    }

    // Set CodeMirror mode based on selected language
    switch (language) {
        case 'python':
            mode = 'python';
            break;
        case 'java':
            mode = 'text/x-java';
            break;
        case 'cpp':
            mode = 'text/x-c++src';
            break;
        // Add other languages as needed
    }

    // Update CodeMirror mode
    editor.setOption('mode', mode);
});
document.getElementById('theme-select').addEventListener('change', (event) => {
    const selectedTheme = event.target.value;
    editor.setOption('theme', selectedTheme);
});