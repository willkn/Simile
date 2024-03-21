const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Function to convert model data to JSON and write to file
function writeModelToFile(modelData, fileName) {
    const jsonData = {
        "@id": `dtmi:example:${modelData.id.replace(' ', '_')};1`,
        "@type": "Interface",
        "displayName": modelData.id,
        "@context": "dtmi:dtdl:context;2"
    };

    const filePath = path.join('models', fileName);
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log(`Model data written to ${filePath}`);
}

// Function to delete all files from the model directory
function deleteAllModelFiles() {
    const directoryPath = 'models';
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        });
    });
}

// Delete all files from the model directory before generating new ones
deleteAllModelFiles();

// Read the CSV file and convert each line to JSON
fs.createReadStream('../test.csv')
    .pipe(csv())
    .on('data', (row) => {
        const modelData = {
            id: row['Starting node'],
            displayName: row['Starting node']
        };
        const fileName = `${row['Starting node'].replace(' ', '_')}_model.json`;
        writeModelToFile(modelData, fileName);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });
    