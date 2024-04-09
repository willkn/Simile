const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const csv = require('csv-parser');
const csvToMxCellXml = require('./csvToXML');
const os = require('os'); // Required to check the operating system
const fs = require('fs');
const { DOMParser } = require('xmldom');
const tmp = require('tmp');
var zip = require('express-zip');


const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'cgfca', 'uploads')) // Use path.join() for cross-platform compatibility
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Use the original file name for the uploaded file
    }
});

const upload = multer({ storage });

function runCGFCA(arg1, arg2) {
    let command;
    if (os.platform() === 'linux' || os.platform() === 'darwin') {
        // For Unix-like systems (Linux, macOS)
        command = path.join('.', 'cgfca', 'cgfca_u') + ` ${arg1} ${arg2}`;
    } else {
        // For other systems (e.g., Windows)
        command = path.join('.', 'cgfca', 'cgfca_v7') + ` ${arg1} ${arg2}`;
    }

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
}

function xmlToGraph(pathToGraph) {
    // Read from our collection of graphs
    const xmlString = fs.readFileSync(pathToGraph, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Find all <mxCell> elements within the <mxGraphModel> element
    const mxGraphModel = xmlDoc.getElementsByTagName('mxGraphModel')[0];
    const mxCellNodes = Array.from(mxGraphModel.getElementsByTagName('mxCell'));

    // Create a dictionary to store the connections
    const connections = {};

    // Iterate through each <mxCell> and identify its source and target
    for (const mxCellNode of mxCellNodes) {
        const sourceId = mxCellNode.getAttribute('source');
        const targetId = mxCellNode.getAttribute('target');
        const valueId = mxCellNode.getAttribute('value');

        // Check if the mxCell represents an edge (has both source and target)
        if (sourceId && targetId) {
            if (!connections[sourceId]) {
                connections[sourceId] = [];
            }
            const temp = [targetId, valueId]
            connections[sourceId].push(temp);
        }
    }
    // Print the connections
    return connections
}

function extractNodes(pathToGraph) {
    const xmlString = fs.readFileSync(pathToGraph, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Find all <mxCell> elements within the <mxGraphModel> element
    const mxGraphModel = xmlDoc.getElementsByTagName('mxGraphModel')[0];
    const mxCellNodes = Array.from(mxGraphModel.getElementsByTagName('mxCell'));

    let nodes = {};

    for (const mxCellNode of mxCellNodes) {
        const sourceId = mxCellNode.getAttribute('source');
        const targetId = mxCellNode.getAttribute('target');

        const value = mxCellNode.getAttribute('value');
        //check if it's a node
        if (!sourceId && !targetId && value) {
            const id = mxCellNode.getAttribute('id');

            nodes[id] = removeHTMLSymbols(value);;
        }
    }
    return nodes;
}

function xmlToCSV3(connections, nodes) {
    console.log(connections);
    //go through every array of connection
    let toTxt = "";

    for (const [key, value] of Object.entries(connections)) {
        for (const connection of value) {
            const targetId = connection[0];
            const value = connection[1];

            toTxt = toTxt.concat(nodes[key] + "," + value + "," + nodes[targetId] + "\n");
        }
        //nodeConnections = connection.value
    }
    return toTxt;
}

function removeHTMLSymbols(str) {
    const htmlSymbols = ["&nbsp;", "&lt;", "&gt;", "&amp;", "&quot;", "<div>", "</div>", "<span>", "</span>"];

    for (i = 0; i < htmlSymbols.length; i++) {
        //check if you need <span> in the if condition too 
        if (htmlSymbols[i] == "<div>") {
            str = str.replace(htmlSymbols[i], " ");
        } else {
            str = str.replace(htmlSymbols[i], "");
        }
    }
    return str;
}

// Function to delete every file in a directory
function purgeDirectory(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Iterate through each file in the directory
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileExtension = path.extname(file);

            // Check if the path is a file and if the extension is not .txt
            if (fileExtension !== '.txt') {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error('Error getting file stats:', err);
                        return;
                    }
                    if (stats.isFile()) {
                        // Delete the file
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error('Error deleting file:', err);
                                return;
                            }
                            console.log(`Deleted file: ${filePath}`);
                        });
                    }
                });
            } else {
                // Log skipping .txt files
                console.log(`Skipped .txt file: ${filePath}`);
            }
        }
    });
}

function getFileType(filePath)
{
    const extension = path.extname(filePath).toLowerCase();
    switch(extension)
    {
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


//let listOfConnections = xmlToGraph(path.join('.', 'graphs', 'graph.xml'));

//let nodes = extractNodes(path.join('.', 'graphs', 'graph.xml'));

//let csvResult = xmlToCSV3(listOfConnections, nodes);
/*
fs.writeFile(path.join('.', 'test.txt'), csvResult, err => {
    if (err) {
        console.error(err);
    } else {
        // file written successfully
    }
});
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/will', (req, res) => {
    console.log('hello');
    res.send('Hello from the server!');
});

app.post('/will', (req, res) => {
    console.log('hello', req.body);
    res.send('Hello from the server!');
});

app.post('/cgfca', upload.single('draw.ioInput'), async (req, res) => {
    console.log("received!");
    if (!req.file || !req.file.path) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = req.file.path;
    console.log(filePath);
    csvToXML(filePath);

    try { 
        let fileData;
        let tempFilePath;

        // Determine the file type
        const fileType = getFileType(filePath);

        const tempDir = tmp.dirSync();
        // Check if uploaded file is XML
        if (fileType === 'text.xml') 
        {   
            //Convert XML to CSV
            const listOfConnections = xmlToGraph(filePath);
            const nodes = extractNodes(filePath);

            tempData = xmlToCSV3(listOfConnections, nodes);
            tempFilePath = path.join(tempDir.name, 'data.csv');
        } 
        else if (fileType === 'application.cgif' || fileType === 'text/csv')
        {
           tempData = fs.readFileSync(filePath, 'utf8'); 
           tempFilePath = path.join(tempDir.name, 'data' + path.extname(filePath));
        }
        else
        {
            return res.status(400).send('Unsupported file type');
        }

        // Write the file data to the temporary file
        fs.writeFileSync(tempFilePath, tempData, 'utf8');

        // Pass CSV data to CGFCA program

        
        // Run CGFCA asynchronously
        await runCGFCA(tempFilePath);
    
        // Specify the directory to be purged and the one for the generated file
        const purgeDir = './cgfca/cxt'; // Directory to purge
        const generatedDir = path.join(__dirname, './cgfca/cxt');
        const originalFileName = path.basename(filePath);
        const fileExtension = path.extname(originalFileName);
        var originalFileNameCopy = originalFileName;
        originalFileNameCopy = originalFileNameCopy.replace(fileExtension, '');
        const fileName = originalFileNameCopy + '.cxt';
        const reportFileName = originalFileName.replace(fileExtension, ".txt");
    
        const reportFilePath = path.join(path.dirname(filePath), reportFileName);        
    
        const generatedFilePath = path.join(generatedDir, fileName);
        const generatedReportFilePath = path.join(generatedDir, reportFileName);
    
        // Purge the specified directory
        // await purgeDirectory(purgeDir);

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        console.log('Generated file path:', generatedFilePath);
        console.log('Generated report file path:', generatedReportFilePath);

        const cxtContent = await runCGFCA(tempFilePath);

        const cxtFilePath = path.join(__dirname, './cgfca/cxt/.cxt');
        let fileContents;

        // Read the file asynchronously
        try {
            fileContents = fs.readFileSync(cxtFilePath, 'utf8');
        } catch (err) {
            console.error('Error reading file:', err);
            // Handle error appropriately
            return;
        }

        fs.writeFileSync(generatedReportFilePath, fileContents, 'utf8');
        fs.writeFileSync(generatedFilePath, fileContents, 'utf8');
        console.log('Generated files exist:', fs.existsSync(generatedFilePath), fs.existsSync(generatedReportFilePath));

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
    
    } catch (error)
    {
        console.error('Error processing file', error);
    }
});

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

    runCGFCA(fileName);

    // Respond with status code 200
    res.sendStatus(200);
});


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

app.post('/getCSV', (req, res) => {
    const xmlData =  req.body;

    try {
        const csvData = csvResult;

        // Respond with the CSV data
        res.type('text/csv');
        res.send(csvData);
    } catch (error) {
        console.error('Error converting XML to CSV', error);
        res.status(500).send('Error converting XML to CSV.');
    }
});

//excel add-in end point 
app.post('/excel', (req, res) => {
    // Get the CSV data from the request body
    const csvData = req.body;

    // Parse the CSV data
    const parsedData = csvData.split('\n').map(line => line.split(','));

    // Write the CSV data to a file
    const fileName = 'received_data.csv';
    const fileStream = fs.createWriteStream(fileName);
    parsedData.forEach(row => fileStream.write(row.join(',') + '\n'));
    fileStream.end();

    runCGFCA(fileName);

    // Respond with status code 200
    res.sendStatus(200);
  });

  function csvToXML(filepath) {
    let csvData = '';

    // Read the CSV file at the specified filepath
    fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (row) => {
            // Concatenate CSV data row by row
            // Convert each row object to a string and concatenate with line break
            csvData += Object.values(row).join(',') + '\n';
        })
        .on('end', () => {
            // After processing all rows, generate XML from the CSV data
            const mxCellXml = csvToMxCellXml(csvData);

            // Write the XML data to the output file
            fs.writeFile('./output.xml', mxCellXml, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        });
}