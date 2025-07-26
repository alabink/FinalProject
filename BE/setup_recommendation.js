const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    console.log('Creating temp directory for recommendation system...');
    fs.mkdirSync(tempDir, { recursive: true });
}

// Check for Python dependencies
console.log('Checking Python dependencies...');

const checkPython = spawn('python', ['-c', 'import sys; print(sys.version)']);

checkPython.stdout.on('data', (data) => {
    console.log(`Python version: ${data.toString().trim()}`);
    
    // Check for required libraries
    const checkDeps = spawn('python', [
        '-c', 
        'import sys; import pkgutil; missing = [p for p in ["numpy", "pandas", "sklearn"] if not pkgutil.find_loader(p)]; sys.exit(1 if missing else 0)'
    ]);
    
    checkDeps.on('close', (code) => {
        if (code !== 0) {
            console.error('Error: Missing Python dependencies. Please run:');
            console.error('npm run install-python-deps');
        } else {
            console.log('All Python dependencies are installed.');
        }
    });
});

checkPython.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
});

checkPython.on('close', (code) => {
    if (code !== 0) {
        console.error('Python is not installed or not in the PATH. Please install Python 3.6+ and try again.');
        process.exit(1);
    }
});

// Create initial interactions file if it doesn't exist
const interactionsFile = path.join(tempDir, 'initial_interactions.json');
if (!fs.existsSync(interactionsFile)) {
    console.log('Creating initial interactions file...');
    fs.writeFileSync(interactionsFile, '[]');
}

console.log('Setup complete. Run `npm run install-python-deps` if required dependencies are missing.'); 