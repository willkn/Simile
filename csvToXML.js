function csvToXML(csvData) {
    const rows = csvData.trim().split('\n').map(row => row.split(','));
    const nodeIds = {};
    let cellId = 2; // Start from 2 to avoid conflict with predefined cells
    let xmlParts = [
        '<mxCell id="0" />',
        '<mxCell id="1" parent="0" />'
    ];

    // Initial positions for the nodes
    let x = 100, y = 100;
    const xIncrement = 200; // Increment x to place nodes horizontally
    const yIncrement = 150; // Increment y to move nodes to a new row
    let toggleRow = false; // Helper to alternate rows

    // Track nodes to avoid duplicating them in the XML
    let nodesProcessed = {};

    rows.forEach(([startNode, relation, endNode]) => {
        // Ensure each node has a unique ID and define it if not already processed
        [startNode, endNode].forEach(node => {
            if (!nodeIds[node]) {
                nodeIds[node] = `node_${Object.keys(nodeIds).length + 1}`;
                if (!nodesProcessed[nodeIds[node]]) {
                    nodesProcessed[nodeIds[node]] = true;

                    // Define each node as a square with specific geometry, alternating position
                    xmlParts.push(`
                    <mxCell id="${nodeIds[node]}" value="${node}" style="shape=rectangle;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;" vertex="1" parent="1">
                        <mxGeometry x="${x}" y="${y}" width="80" height="80" as="geometry" />
                    </mxCell>`.trim());

                    // Increment x for the next node
                    x += xIncrement;

                    // Alternate y for every other node to create a staggered layout
                    if (toggleRow) {
                        y += yIncrement;
                    } else {
                        y -= yIncrement / 2; // Adjust to keep within a reasonable vertical space
                    }
                    toggleRow = !toggleRow;

                    // Reset x and adjust y after every few nodes to avoid going off the screen
                    if (x > 800) { // Assuming a limit for demonstration
                        x = 100;
                        y += 2 * yIncrement; // Move down to a new 'row'
                    }
                }
            }
        });

        // Define the edge
        const xml = `
        <mxCell id="${cellId++}" value="${relation}" style="edgeStyle=none;rounded=1;html=1;labelBackgroundColor=none;startArrow=none;startFill=0;startSize=5;endArrow=classicThin;endFill=1;endSize=5;jettySize=auto;orthogonalLoop=1;strokeColor=#B3B3B3;strokeWidth=1;fontFamily=Verdana;fontSize=12" parent="1" source="${nodeIds[startNode]}" target="${nodeIds[endNode]}" edge="1">
            <mxGeometry relative="1" as="geometry" />
        </mxCell>`.trim();

        xmlParts.push(xml);
    });

    // Combine XML parts into the full document structure
    return `
<?xml version="1.0"?>
<mxfile>
  <diagram>
    <mxGraphModel>
        <root>
            ${xmlParts.join('\n')}
        </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`.trim();
}


module.exports = csvToXML;
