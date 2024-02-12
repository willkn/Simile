const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = 3000;

const fs = require('fs');
const { DOMParser } = require('xmldom');

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

    // Check if the mxCell represents an edge (has both source and target)
    if (sourceId && targetId) {
      if (!connections[sourceId]) {
        connections[sourceId] = [];
      }
      connections[sourceId].push(targetId);
    }
  }
  // Print the connections
  return connections
}

function extractNodes(pathToGraph)
{
  const xmlString = fs.readFileSync(pathToGraph, 'utf8');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Find all <mxCell> elements within the <mxGraphModel> element
  const mxGraphModel = xmlDoc.getElementsByTagName('mxGraphModel')[0];
  const mxCellNodes = Array.from(mxGraphModel.getElementsByTagName('mxCell'));

  let nodes = {};

  for (const mxCellNode of mxCellNodes) 
  {
    const sourceId = mxCellNode.getAttribute('source');
    const targetId = mxCellNode.getAttribute('target');

    const value = mxCellNode.getAttribute('value');
    //check if it's a node
    if (!sourceId && !targetId && value)
    {
      const id = mxCellNode.getAttribute('id');

      nodes[id] = value;

    }
  }
  return nodes;
}

function xmlToCSV3(connections, nodes)
{
  console.log(connections);
  //go through every array of connection
  for (const [key, value] of Object.entries(connections))
  {
    for(const connection of value)
    {
      console.log(nodes[key] + "---->" + nodes[connection]);
    }
    //nodeConnections = connection.value
  }
}


let listOfConnections = xmlToGraph('./graphs/graph.xml');

let nodes = extractNodes('./graphs/graph.xml');

xmlToCSV3(listOfConnections, nodes);

app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For URL-encoded body parsing

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post('/cgfca', (req, res) => {
    const initialInput = req.body.initialInput; // Expect initial input from the request body
    interactWithCppProgram(initialInput, res);
});

// Queue for storing input that will be sent to the C++ application
let inputQueue = [];

// Endpoint for C++ application to send output
app.post('/output', (req, res) => {
  console.log('C++ Output:', req.body.message);
  res.status(200).send({status: 'Received'});
});

// Endpoint for C++ application to request input
app.get('/input', (req, res) => {
  if (inputQueue.length > 0) {
      const input = inputQueue.shift(); // Get the first item from the queue
      res.status(200).send({input: input});
  } else {
      res.status(404).send({error: 'No input available'});
  }
});