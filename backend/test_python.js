const { spawn } = require('child_process');
const path = require('path');

// Test if Python is installed and accessible
console.log('Testing Python installation...');

const pythonTest = spawn('python', ['--version']);

pythonTest.stdout.on('data', (data) => {
    console.log(`Python version: ${data.toString().trim()}`);
});

pythonTest.stderr.on('data', (data) => {
    console.error(`Error: ${data.toString().trim()}`);
});

pythonTest.on('close', (code) => {
    if (code !== 0) {
        console.error('Python is not installed or not in PATH');
        process.exit(1);
    } else {
        console.log('Python is installed and accessible');
        
        // Test if required packages are installed
        console.log('\nTesting required Python packages...');
        const packageTest = spawn('python', [
            '-c', 
            'import sys; import numpy; import pandas; import sklearn; print("All required packages are installed")'
        ]);
        
        packageTest.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });
        
        packageTest.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString().trim()}`);
            console.error('\nPlease install required packages with:');
            console.error('npm run install-python-deps');
        });
        
        packageTest.on('close', (code) => {
            if (code !== 0) {
                console.error('Required Python packages are missing');
                process.exit(1);
            } else {
                console.log('All Python requirements are met');
                
                // Test the recommendation engine script
                console.log('\nTesting recommendation engine script...');
                
                // Create a simple test data file
                const fs = require('fs');
                const testData = [
                    {
                        userId: '123',
                        productId: '456',
                        click: 1,
                        view: 2,
                        favorite: 0,
                        purchase: 0,
                        timestamp: new Date().toISOString()
                    }
                ];
                
                const tempDir = path.join(__dirname, 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const testFile = path.join(tempDir, 'test_data.json');
                fs.writeFileSync(testFile, JSON.stringify(testData));
                
                // Run the recommendation engine
                const scriptPath = path.join(__dirname, 'src', 'utils', 'recommendation_engine.py');
                const engineTest = spawn('python', [
                    scriptPath,
                    testFile,
                    '123',
                    '5'
                ]);
                
                engineTest.stdout.on('data', (data) => {
                    console.log(`Output: ${data.toString().trim()}`);
                });
                
                engineTest.stderr.on('data', (data) => {
                    console.error(`Error: ${data.toString().trim()}`);
                });
                
                engineTest.on('close', (code) => {
                    // Clean up test file
                    try {
                        fs.unlinkSync(testFile);
                    } catch (err) {
                        console.error(`Error deleting test file: ${err.message}`);
                    }
                    
                    if (code !== 0) {
                        console.error('Recommendation engine script test failed');
                        process.exit(1);
                    } else {
                        console.log('Recommendation engine script test passed');
                        console.log('\nAll tests passed! The recommendation system should be working correctly.');
                    }
                });
            }
        });
    }
}); 