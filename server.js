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
app.use(express.static('public'));

app.post('/compile', (req, res) => {
    const { code, language } = req.body;

    if (language === 'java') {
        const fileName = 'Main.java';
        const filePath = path.join(fileName);

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing Java file: ' + err.message);

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

                    try {
                        fs.unlinkSync(filePath);
                        fs.unlinkSync(`${className}.class`);
                    } catch (unlinkErr) {
                        console.error('Error cleaning up files:', unlinkErr.message);
                    }
                });
            });
        });
    } else if (language === 'python') {
        const fileName = 'TempCode.py';
        const filePath = path.join(fileName);

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing Python file: ' + err.message);

            exec(`python3 ${filePath}`, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    return res.status(500).send(`Python Execution Error: ${runStderr}`);
                }
                res.send(runStdout);
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error cleaning up Python file:', unlinkErr.message);
                }
            });
        });
    } else {
        res.status(400).send('Unsupported language. Please use "java", "python", or "html".');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
