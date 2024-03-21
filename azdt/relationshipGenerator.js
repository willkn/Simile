const fs = require('fs');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');

// Function to generate a random unique ID
function generateUniqueID() {
    return Math.random().toString(36).substring(2, 10);
}

// Function to read graph data from CSV file
function readGraphDataFromCSV(csvFilePath, callback) {
    const nodeSet = new Set(); // Set to store unique nodes
    const relationships = []; // Array to store relationships

    // Read CSV file and parse data
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            // Parse CSV row and extract node and relationship data
            const startingNode = row['Starting node'];
            const relation = row['relation'];
            const endNode = row['Node 2'];

            // Add nodes to the node set
            nodeSet.add(startingNode);
            nodeSet.add(endNode);

            // Add relationship to the array
            relationships.push({ startingNode, relation, endNode });
        })
        .on('end', () => {
            console.log('CSV file successfully processed');

            // Convert the node set to an array of unique nodes
            const nodes = Array.from(nodeSet);

            // Create graph data from unique nodes and relationships
            const graphData = nodes.map(node => ({
                modelID: node,
                id: `${node.replace(' ', '_')}_${generateUniqueID()}`,
                from: '',
                relationship: ''
            }));

            // Update relationships with node IDs
            relationships.forEach(({ startingNode, relation, endNode }) => {
                const startingNodeId = graphData.find(node => node.modelID === startingNode).id;
                const endNodeId = graphData.find(node => node.modelID === endNode).id;

                // Add relationship to the respective node in graphData
                graphData.push({
                    modelID: endNode,
                    id: `${endNode.replace(' ', '_')}_${generateUniqueID()}`,
                    from: startingNodeId,
                    relationship: relation
                });
            });

            callback(graphData); // Pass graph data to the callback function
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

// Function to write graph data to XLSX file
async function writeGraphToExcel(graphData, filePath) {
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
        worksheet.addRow(data);
    });

    // Save workbook to file
    await workbook.xlsx.writeFile(filePath);
    console.log(`Graph data written to ${filePath}`);
}

// File path to save the Excel file
const excelFilePath = 'graph_data.xlsx';

// Read graph data from CSV and write to Excel file
readGraphDataFromCSV('../test.csv', (data) => {
    // Write graph data to Excel file
    writeGraphToExcel(data, excelFilePath)
        .then(() => console.log('Excel file created successfully'))
        .catch(err => console.error('Error writing Excel file:', err));
});
