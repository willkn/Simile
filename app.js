const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;
const multer = require('multer');
app.use(express.static('public'));


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '.\\cgfca\\uploads') // Specify the directory where uploaded files will be stored
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Use the original file name for the uploaded file
    }
});

const upload = multer({ storage });


const fs = require('fs');
const { DOMParser } = require('xmldom');

const content = 'Some content!';

function runCGFCA(arg1, arg2) {
    return new Promise((resolve, reject) => {
        // Replace 'program' with the actual name of your compiled C++ program
        exec(`./cgfca/cgfca ${arg1} ${arg2}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error running C++ program:', error);
                reject(error);
            } else {
                console.log('C++ program output:', stdout);
                resolve(stdout);
            }
        });
    });
}

function xmlToGraph(pathToGraph) {
    // Read from our collection of graphs
    const xmlString = fs.readFileSync(pathToGraph, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text\\xml');

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
    const xmlDoc = parser.parseFromString(xmlString, 'text\\xml');

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


let listOfConnections = xmlToGraph('.\\graphs\\graph.xml');

let nodes = extractNodes('.\\graphs\\graph.xml');

// let result = xmlToCSV3(listOfConnections, nodes);
// fs.writeFile('test.txt', result, err => {
//     if (err) {
//         console.error(err);
//     } else {
//         // file written successfully
//     }
// });

app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For URL-encoded body parsing

app.listen(port, () => {
    console.log(`Example app listening at http:\\localhost:${port}`);
});

app.post('/cgfca', upload.single('draw.ioInput'), (req, res) => {
    try {
        runCGFCA(req.file.path);
        res.send('File uploaded successfully');
    } catch (error) {
        console.error('Error running CGFCA:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for C++ application to request input
app.get('\\input', (req, res) => {
    if (inputQueue.length > 0) {
        const input = inputQueue.shift(); // Get the first item from the queue
        res.status(200).send({ input: input });
    } else {
        res.status(404).send({ error: 'No input available' });
    }
});