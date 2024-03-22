const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const tmp = require('tmp');
const os = require('os');
const { exec } = require('child_process');
const { DOMParser } = require('xmldom');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const csvToMxCellXml = require('./csvToXML');
const zip = require('express-zip');

const app = express();
const port = 3000;

app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'cgfca', 'uploads'));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Function to run CGFCA
function runCGFCA(arg1, arg2) {
    const platform = os.platform();
    if (platform !== 'win32') {
        const command = path.join('.', 'cgfca', 'cgfca_u') + ` ${arg1} ${arg2}`;
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error running C++ program:', error);
                    reject(error);
                } else {
                    console.log('C++ program output: ', stdout);
                    resolve(stdout);
                }
            });
        });
    } else {
        console.log('Skipping execution on Windows platform.');
        return Promise.resolve();
    }
}

// Function to convert XML to graph
function xmlToGraph(pathToGraph) {
    const xmlString = fs.readFileSync(pathToGraph, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const mxGraphModel = xmlDoc.getElementsByTagName('mxGraphModel')[0];
    const mxCellNodes = Array.from(mxGraphModel.getElementsByTagName('mxCell'));

    let connections = {};

    for (const mxCellNode of mxCellNodes) {
        const sourceId = mxCellNode.getAttribute('source');
        const targetId = mxCellNode.getAttribute('target');
        const valueId = mxCellNode.getAttribute('value');

        if (sourceId && targetId) {
            if (!connections[sourceId]) {
                connections[sourceId] = [];
            }
            const temp = [targetId, valueId];
            connections[sourceId].push(temp);
        }
    }
    return connections;
}

// Function to extract nodes from XML
function extractNodes(pathToGraph) {
    const xmlString = fs.readFileSync(pathToGraph, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const mxGraphModel = xmlDoc.getElementsByTagName('mxGraphModel')[0];
    const mxCellNodes = Array.from(mxGraphModel.getElementsByTagName('mxCell'));

    let nodes = {};

    for (const mxCellNode of mxCellNodes) {
        const sourceId = mxCellNode.getAttribute('source');
        const targetId = mxCellNode.getAttribute('target');
        const value = mxCellNode.getAttribute('value');

        if (!sourceId && !targetId && value) {
            const id = mxCellNode.getAttribute('id');
            nodes[id] = removeHTMLSymbols(value);
        }
    }
    return nodes;
}

// Function to convert XML to CSV
function xmlToCSV3(connections, nodes) {
    let toTxt = "";

    for (const [key, value] of Object.entries(connections)) {
        for (const connection of value) {
            const targetId = connection[0];
            const value = connection[1];

            toTxt = toTxt.concat(nodes[key] + "," + value + "," + nodes[targetId] + "\n");
        }
    }
    return toTxt;
}

// Function to remove HTML symbols from a string
function removeHTMLSymbols(str) {
    const htmlSymbols = ["&nbsp;", "&lt;", "&gt;", "&amp;", "&quot;", "<div>", "</div>", "<span>", "</span>"];

    for (i = 0; i < htmlSymbols.length; i++) {
        if (htmlSymbols[i] == "<div>") {
            str = str.replace(htmlSymbols[i], " ");
        } else {
            str = str.replace(htmlSymbols[i], "");
        }
    }
    return str;
}

// Route to handle file upload
app.post('/cgfca', upload.single('draw.ioInput'), async (req, res) => {
    console.log("received!");
    if (!req.file || !req.file.path) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = req.file.path;

    try {
        let tempData;
        let tempFilePath;

        // Determine the file type
        const fileType = getFileType(filePath);
        const tempDir = tmp.dirSync();

        if (fileType === 'text.xml') {   
            // Convert XML to CSV
            const listOfConnections = xmlToGraph(filePath);
            const nodes = extractNodes(filePath);
            tempData = xmlToCSV3(listOfConnections, nodes);
            tempFilePath = path.join(tempDir.name, 'data.csv');
        } else if (fileType === 'application.cgif' || fileType === 'text/csv') {
            tempData = fs.readFileSync(filePath, 'utf8'); 
            tempFilePath = path.join(tempDir.name, 'data' + path.extname(filePath));
        } else {
            return res.status(400).send('Unsupported file type');
        }

        // Write the file data to the temporary file
        fs.writeFileSync(tempFilePath, tempData, 'utf8');

        // Run CGFCA asynchronously
        await runCGFCA(tempFilePath);

        // Specify the directory for the generated files
        const generatedDir = path.join(__dirname, './cgfca/cxt');
        const originalFileName = path.basename(filePath);
        const fileExtension = path.extname(originalFileName);
        var originalFileNameCopy = originalFileName;
        originalFileNameCopy = originalFileNameCopy.replace(fileExtension, '');
        const fileName = originalFileNameCopy + '.cxt';
        const reportFileName = originalFileName.replace(fileExtension, ".txt");
        const generatedFilePath = path.join(generatedDir, fileName);
        const generatedReportFilePath = path.join(generatedDir, reportFileName);

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        const cxtContent = fs.readFileSync(path.join(__dirname, './cgfca/cxt/.cxt'), 'utf8');

        // Write the generated files
        fs.writeFileSync(generatedReportFilePath, cxtContent, 'utf8');
        fs.writeFileSync(generatedFilePath, cxtContent, 'utf8');

        // Respond with a zip file containing the generated files
        res.zip([
            { path: generatedFilePath, name: fileName },
            { path: generatedReportFilePath, name: reportFileName }
        ], (err) => {
            if (err) {

                console.error('Error zipping files:', err);
                res.sendStatus(500); // Internal server error
            } else {
                console.log('Files zipped successfully');
            }
        });
    
    } catch (error) {
        console.error('Error processing file', error);
    }
});

// Function to determine file type
function getFileType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    switch(extension) {
        case '.xml':
            return 'text.xml';
        case '.csv':
            return 'text/csv';
        case '.cgif':
            return 'application.cgif';
        default:
            return null; // Unknown file type 
    }
}

// Route to handle dropped CSV data
app.post('/test', (req, res) => {
    // Get the CSV data from the request body
    const csvData = req.body;

    // Parse the CSV data
    const parsedData = csvData.split('\n').map(line => line.split(','));

    // Write the CSV data to a file
    const fileName = 'received_data.csv';
    const fileStream = fs.createWriteStream(fileName);
    parsedData.forEach(row => fileStream.write(row.join(',') + '\n'));
    fileStream.end();

    // Run CGFCA
    runCGFCA(fileName);

    // Respond with status code 200
    res.sendStatus(200);
});

// Route to serve XML file
app.post('/getXML', (req, res) => {
    const filePath = path.join(__dirname, './output.xml'); // Adjust the path as necessary
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading XML file:', err);
            res.sendStatus(500); // Internal Server Error
            return;
        }
        res.type('application/xml');
        res.send(data);
    });
});

// Route to serve CSV data
app.post('/getCSV', (req, res) => {
    try {
        // Respond with the CSV data
        res.type('text/csv');
        res.send(csvResult);
    } catch (error) {
        console.error('Error converting XML to CSV', error);
        res.status(500).send('Error converting XML to CSV.');
    }
});

// Example CSV data for testing
const csvData = `
Organisation,owns,Organisational Function
Organisational Function,executed by,Role
Role,produces/consumes,Business Object
Role,operates at,Location
Business Object,generalisation of,Product
Location,at,Product
Product,at,Location
Product,transforms/accountable for value of,Business Service
Business Service,transforms/accountable for value of,Product
Business Service,delivered by,Process
Process,uses to indicate options/choices,Gateway
Gateway,partially or fully automates,Application/System
Application/System,implements,Application Function
Application Function,implemented by,Application Task
Information Object,provided by,Application Task
Application/System,includes,Application Task
Application Task,interacts with,Data Entity
Application Service,partially or fully automates,Information Object
Application/System,includes,Application Service
Data Object,generalisation of,Data Component
Data Component,distributed through,Data Channel
Data Entity,included in,Data Object
Data Object,encapsulated by,Data Service
Data Entity,logically specifies,Data Table
Data Service,instantiated in,Data Table
Data Table,specified by,Data Media
Data Service,uses,Data Media
Data Channel,means of distribution for,Data Service
Data Media,hosted on,Platform Device
Platform Device,specified by,Platform Component
Platform Component,specifies,Infrastructure Service
Infrastructure Service,instantiates behaviour of,Infrastructure Component
`;

// Convert CSV data to XML
const mxCellXml = csvToMxCellXml(csvData);

// Write XML to file
fs.writeFile('./output.xml', mxCellXml, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
               