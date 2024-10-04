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

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.post('/compile', (req, res) => {
    const { code, language } = req.body;

    // Handler for Java
    if (language === 'java') {
        const fileName = 'Main.java';
        const __dirname = 'compile';
        const filePath = path.join(__dirname, fileName);

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

                    // Cleanup
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(`${className}.class`);
                });
            });
        });
    } 
    // Handler for Python
    else if (language === 'python') {
        const fileName = 'TempCode.py';
        const filePath = path.join(fileName);

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing Python file: ' + err.message);

            exec(`python3 ${filePath}`, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    return res.status(500).send(`Python Execution Error: ${runStderr}`);
                }
                res.send(runStdout);

                // Cleanup
                fs.unlinkSync(filePath);
            });
        });
    }
    // Handler for C
    else if (language === 'c') {
        const fileName = 'TempCode.c';
        const filePath = path.join(fileName);
        const executable = 'TempCode.out';

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing C file: ' + err.message);

            exec(`gcc ${filePath} -o ${executable}`, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    return res.status(500).send(`C Compilation Error: ${compileStderr}`);
                }

                exec(`./${executable}`, (runErr, runStdout, runStderr) => {
                    if (runErr) {
                        return res.status(500).send(`C Execution Error: ${runStderr}`);
                    }

                    res.send(runStdout);

                    // Cleanup
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(executable);
                });
            });
        });
    }
    // Handler for C++
    else if (language === 'cpp') {
        const fileName = 'TempCode.cpp';
        const filePath = path.join(fileName);
        const executable = 'TempCode.out';

        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing C++ file: ' + err.message);

            exec(`g++ ${filePath} -o ${executable}`, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    return res.status(500).send(`C++ Compilation Error: ${compileStderr}`);
                }

                exec(`./${executable}`, (runErr, runStdout, runStderr) => {
                    if (runErr) {
                        return res.status(500).send(`C++ Execution Error: ${runStderr}`);
                    }

                    res.send(runStdout);

                    // Cleanup
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(executable);
                });
            });
        });
    } 
    else {
        res.status(400).send('Unsupported language. Please use "java", "python", "c", or "cpp".');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Phase 2