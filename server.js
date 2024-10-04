const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// POST /compile to handle code execution
app.post('/compile', (req, res) => {
    const { code, language } = req.body;

    if (language === 'java') {
        // Handle Java code
        const fileName = 'TempCode.java';
        const filePath = path.join(fileName);

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing Java file.');

            exec(`javac ${filePath}`, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    return res.status(500).send(`Java Compilation Error: ${compileStderr}`);
                }

                const className = path.basename(fileName, '.java');
                exec(`java ${className}`, (runErr, runStdout, runStderr) => {
                    if (runErr) {
                        return res.status(500).send(`Java Execution Error: ${runStderr}`);
                    }
                    res.send(runStdout);
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(`${className}.class`);
                });
            });
        });
    } else if (language === 'python') {
        const fileName = 'TempCode.py';
        const filePath = path.join(fileName);

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing Python file.');

            exec(`python ${filePath}`, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    return res.status(500).send(`Python Execution Error: ${runStderr}`);
                }
                res.send(runStdout);
                fs.unlinkSync(filePath);
            });
        });
    } else if (language === 'html') {
        res.setHeader('Content-Type', 'text/html');
        res.send(code);
    } else {
        res.status(400).send('Unsupported language. Please use "java", "python", or "html".');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
