const express = require('express');
const app = express();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.post('/execute', (req, res) => {
    const { code, language } = req.body;
    var tempFilePath = '';
    switch (language) {
        case 'javascript':
            tempFilePath = path.join(__dirname, 'temp_files/temp_code.js');
            break;
        case 'python':
            tempFilePath = path.join(__dirname, 'temp_files/temp_code.py');
            break;
        case 'java':
            tempFilePath = path.join(__dirname, 'temp_files/temp_code.java');
            break;
        case 'cpp':
            tempFilePath = path.join(__dirname, 'temp_files/temp_code.cpp');
            break;
            // Add other languages as needed
        default:
            return res.status(400).send('Language not supported');
    }

    // Write the code to a temporary file
    fs.writeFile(tempFilePath, code, (err) => {
        if (err) {
            console.error(`File write error: ${err.message}`);
            return res.status(500).send('File write error');
        }

        let command = '';
        if (language === 'javascript') {
            command = `node ${tempFilePath}`;
        } else if (language === 'python') {
            // For Python, write code to temp file and execute it
            command = `python ${tempFilePath}`;
        } else if (language === 'java') {
            command = `javac ${tempFilePath} && java -cp ${path.dirname(tempFilePath)} ${path.basename(tempFilePath, '.java')}`;
        } else if (language === 'cpp') {
            // For C++, compile and run the code
            command = `g++ ${tempFilePath} -o ${tempFilePath}.out && ${tempFilePath}.out`;
        
        } else {
            return res.status(400).send('Language not supported');
        }

        exec(command, (error, stdout, stderr) => {
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error(`Error deleting temp file: ${err.message}`);
            });

            if (error) {
                console.error(`Execution error: ${error.message}`);
                return res.status(500).send(error.message);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            res.send(stdout);
        });
    });
});

app.listen(3000, () => {
    console.log('Backend server is running on http://localhost:3000');
});
