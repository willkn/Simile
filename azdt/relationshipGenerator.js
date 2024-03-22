const fs = require('fs');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');

// Function to read graph data from CSV file and generate the desired format
function readGraphDataFromCSV(csvFilePath, callback) {
    const graphData = new Map(); // Using a map to ensure unique modelID entries
    const relationships = []; // Array to store relationships

    // Read CSV file and parse data
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            // Parse CSV row and create graph data object
            const startingNode = row['Starting node'];
            const relation = row['relation'];
            const endNode = row['Node 2'];

            // Skip rows with missing data
            if (!startingNode || !relation || !endNode) {
                console.error('Missing data in CSV row:', row);
                return;
            }

            // Add starting node to graph data
            if (!graphData.has(startingNode)) {
                const id = `${startingNode.replace(' ', '_')}_${generateUniqueID()}`;
                graphData.set(startingNode, {
                    modelID: startingNode,
                    id: id,
                    from: '',
                    relationship: ''
                });
            }

            // Add end node to graph data if it's not an end node
            if (endNode !== 'End node' && !graphData.has(endNode)) {
                const id = `${endNode.replace(' ', '_')}_${generateUniqueID()}`;
                graphData.set(endNode, {
                    modelID: endNode,
                    id: id,
                    from: '',
                    relationship: ''
                });
            }

            // Store relationships parsed from the CSV file
            relationships.push({
                startingNode: startingNode,
                relation: relation,
                endNode: endNode
            });
        })
        .on('end', () => {
            console.log('CSV file successfully processed');

            // Update relationships in graph data
            relationships.forEach(({ startingNode, relation, endNode }) => {
                graphData.get(startingNode).relationship = relation;
                console.log(`Relationship added: ${startingNode} -> ${endNode}: ${relation}`);
            });

            console.log('Graph data:', graphData);
            console.log('Relationships:', relationships);

            // Update 'from' values in graph data based on relationships
            graphData.forEach(node => {
                relationships.forEach(({ startingNode, endNode }) => {
                    if (node.modelID === endNode) {
                        node.from = graphData.get(startingNode).id; // Use the ID instead of modelID
                    }
                });
            });

            callback(Array.from(graphData.values()), relationships); // Pass graph data and relationships to the callback function
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

// Function to generate a random unique ID
function generateUniqueID() {
    return Math.random().toString(36).substring(2, 10);
}

async function writeGraphToExcel(graphData, relationships, filePath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Graph');

    // Define column headers
    worksheet.columns = [
        { header: 'ModelID', key: 'modelID', width: 30 },
        { header: 'ID (must be unique)', key: 'id', width: 20 },
        { header: 'Relationship (From)', key: 'from', width: 20 },
        { header: 'Relationship Name', key: 'relationship', width: 20 },
    ];

    // Add graph data rows
    graphData.forEach(data => {
        const rowData = {
            modelID: data.modelID,
            id: data.id,
            from: data.from ? data.from : '', // Set the 'from' field, handle empty values
            relationship: data.relationship
        };
        worksheet.addRow(rowData);
    });

    // Add relationship (from) values
    relationships.forEach(rel => {
        const modelID = rel.startingNode;
        const from = rel.from || '';
        console.log(`Adding relationship: ${modelID} - From: ${from}`);
        const row = worksheet.findRow(modelID, 'modelID');
        if (row) {
            row.getCell('Relationship (From)').value = from;
        }
    });

    // Save workbook to file
    await workbook.xlsx.writeFile(filePath);
    console.log(`Graph data written to ${filePath}`);
}

// File path to save the Excel file
const excelFilePath = 'graph_data.xlsx';

// Read graph data from CSV and write to Excel file
readGraphDataFromCSV('../test.csv', (graphData, relationships) => {
    // Write graph data to Excel file
    writeGraphToExcel(graphData, relationships, excelFilePath)
        .then(() => console.log('Excel file created successfully'))
        .catch(err => console.error('Error writing Excel file:', err));
});