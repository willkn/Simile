const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = 3000;

const fs = require('fs');
const { DOMParser } = require('xmldom');

// const xmlString = `<mxfile host="Electron" modified="2024-02-05T11:14:43.294Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/22.1.21 Chrome/120.0.6099.109 Electron/28.1.0 Safari/537.36" etag="AZb5tAlQN_Xwq8W_kGXj" version="22.1.21" type="device">
// <diagram name="Page-1" id="42789a77-a242-8287-6e28-9cd8cfd52e62">
//   <mxGraphModel dx="1101" dy="707" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" background="none" math="0" shadow="0">
//     <root>
//       <mxCell id="0" />
//       <mxCell id="1" parent="0" />
//       <mxCell id="1ea317790d2ca983-12" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-1" target="1ea317790d2ca983-2" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-13" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-1" target="1ea317790d2ca983-9" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-14" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-1" target="1ea317790d2ca983-3" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-1" value="Starting&amp;nbsp;&lt;div&gt;node&lt;/div&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="450" y="80" width="90" height="60" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-21" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-2" target="1ea317790d2ca983-7" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-22" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-2" target="1ea317790d2ca983-6" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-2" value="&lt;span&gt;Node 2&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="457.5" y="190" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-15" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-3" target="1ea317790d2ca983-4" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-3" value="&lt;span&gt;Node 3&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="700" y="190" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-16" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-4" target="1ea317790d2ca983-5" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-4" value="&lt;span&gt;Node 7&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="700" y="320" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-17" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-5" target="1ea317790d2ca983-8" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-5" value="&lt;span&gt;Node 9&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="700" y="470" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-23" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-6" target="1ea317790d2ca983-8" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-6" value="&lt;span&gt;Node 6&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="550" y="320" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-24" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-7" target="1ea317790d2ca983-8" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-7" value="&lt;span&gt;Node 5&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="360" y="320" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-8" value="End node" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="457.5" y="510" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-19" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-9" target="1ea317790d2ca983-10" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-9" value="Node 1" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="210" y="190" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-20" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-10" target="1ea317790d2ca983-11" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-10" value="&lt;span&gt;Node 4&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="210" y="320" width="75" height="50" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-18" value="relation" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="1ea317790d2ca983-11" target="1ea317790d2ca983-8" edge="1">
//         <mxGeometry relative="1" as="geometry" />
//       </mxCell>
//       <mxCell id="1ea317790d2ca983-11" value="&lt;span&gt;Node 8&lt;/span&gt;" style="ellipse;whiteSpace=wrap;html=1;rounded=0;shadow=1;comic=0;labelBackgroundColor=none;strokeWidth=1;fontFamily=Verdana;fontSize=12;align=center;" parent="1" vertex="1">
//         <mxGeometry x="210" y="470" width="75" height="50" as="geometry" />
//       </mxCell>
//     </root>
//   </mxGraphModel>
// </diagram>
// </mxfile>`;

const xmlString = fs.readFileSync('./graphs/graph.xml', 'utf8');
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
console.log(connections);




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