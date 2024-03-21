const fs = require('fs');
const path = require('path');

function extractRectCoordinates(rectString) {
  // Use regular expressions to extract the x, y, width, and height coordinates
  const regex = /x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/;
  const match = rectString.match(regex);

  // If a match is found, extract the coordinates and return as an object
  if (match && match.length === 5) {
    1;
    const x = parseInt(match[1]);
    const y = parseInt(match[2]);
    const width = parseInt(match[3]);
    const height = parseInt(match[4]);
    const x2 = x + width;
    const y2 = y + height;
    return { x1: x, y1: y, x2: x2, y2: y2 };
  } else {
    // Return null if no match is found
    return null;
  }
}

function extractPathPoints(pathString) {
  // Use regular expressions to extract the start and end points
  const regex = /M (\d+(\.\d+)?) (\d+(\.\d+)?) L (\d+(\.\d+)?) (\d+(\.\d+)?)/;
  const match = pathString.match(regex);

  // If a match is found, extract the points and return as an object
  if (match && match.length === 9) {
    const startX = parseFloat(match[1]);
    const startY = parseFloat(match[3]);
    const endX = parseFloat(match[5]);
    const endY = parseFloat(match[7]);
    return { startX, startY, endX, endY };
  } else {
    // Return null if no match is found
    return null;
  }
}

// console.log(extractPathPoints(path));
// console.log(extractRectCoordinates(rect2));
function checkIfPathInRectangle(path, rect, threshold = 15) {
  // Extract coordinates of path and rectangle
  const pathPoints = extractPathPoints(path);
  const rectCoords = extractRectCoordinates(rect);

  // Check if path points are within rectangle boundaries
  if (
    pathPoints.startX >= rectCoords.x1 &&
    pathPoints.startX <= rectCoords.x2 &&
    pathPoints.startY >= rectCoords.y1 &&
    pathPoints.startY <= rectCoords.y2
  ) {
    return { position: "start", x: pathPoints.startX, y: pathPoints.startY };
  }

  if (
    pathPoints.endX >= rectCoords.x1 &&
    pathPoints.endX <= rectCoords.x2 &&
    pathPoints.endY >= rectCoords.y1 &&
    pathPoints.endY <= rectCoords.y2
  ) {
    return { position: "end", x: pathPoints.endX, y: pathPoints.endY };
  }

  // Check if path intersects or is close to any of the rectangle's edges
  const rectEdges = [
    {
      x1: rectCoords.x1,
      y1: rectCoords.y1,
      x2: rectCoords.x2,
      y2: rectCoords.y1,
    },
    {
      x1: rectCoords.x1,
      y1: rectCoords.y2,
      x2: rectCoords.x2,
      y2: rectCoords.y2,
    },
    {
      x1: rectCoords.x1,
      y1: rectCoords.y1,
      x2: rectCoords.x1,
      y2: rectCoords.y2,
    },
    {
      x1: rectCoords.x2,
      y1: rectCoords.y1,
      x2: rectCoords.x2,
      y2: rectCoords.y2,
    },
  ];

  for (const edge of rectEdges) {
    if (isPathIntersectingEdge(pathPoints, edge)) {
      return { position: "edge", x: pathPoints.startX, y: pathPoints.startY };
    }
  }

  // Check if path is fairly close to rectangle edges
  if (isPathCloseToRectEdges(pathPoints, rectCoords, threshold)) {
    return true;
  }

  return false;
}

// Function to check if path intersects with edge
function isPathIntersectingEdge(pathPoints, edge) {
  // Check if path intersects with edge
  const minX = Math.min(edge.x1, edge.x2);
  const maxX = Math.max(edge.x1, edge.x2);
  const minY = Math.min(edge.y1, edge.y2);
  const maxY = Math.max(edge.y1, edge.y2);

  // Check if start or end point of path lies on the edge
  const isStartOnEdge =
    pathPoints.startX >= minX &&
    pathPoints.startX <= maxX &&
    pathPoints.startY >= minY &&
    pathPoints.startY <= maxY;
  const isEndOnEdge =
    pathPoints.endX >= minX &&
    pathPoints.endX <= maxX &&
    pathPoints.endY >= minY &&
    pathPoints.endY <= maxY;

  return isStartOnEdge || isEndOnEdge;
}

// Function to check if path is close to rectangle edges
function isPathCloseToRectEdges(pathPoints, rectCoords, threshold) {
  // Check if path is within threshold distance from any rectangle edge
  const distanceFromEdges = [
    Math.abs(pathPoints.startX - rectCoords.x1),
    Math.abs(pathPoints.startY - rectCoords.y1),
    Math.abs(pathPoints.startX - rectCoords.x2),
    Math.abs(pathPoints.startY - rectCoords.y2),
  ];

  return distanceFromEdges.some((distance) => distance <= threshold);
}

// Sample data
const rect1 =
  '<rect x="1087" y="904" width="60" height="30" fill="none" stroke="white" pointer-events="stroke" visibility="hidden" stroke-width="9"></rect>';
const rect2 =
  '<rect x="957" y="914" width="60" height="30" fill="none" stroke="white" pointer-events="stroke" visibility="hidden" stroke-width="9"></rect>';
const rect3 =
  '<rect x="1107" y="994" width="60" height="30" fill="none" stroke="white" pointer-events="stroke" visibility="hidden" stroke-width="9"></rect>';

const path1 =
  '<path d="M 1023.35 926.2 L 1080.65 921.8" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"></path>';
const path2 =
  '<path d="M 1137 987.63 L 1137 930.37" fill="none" stroke="white" stroke-miterlimit="10" pointer-events="stroke" visibility="hidden" stroke-width="9"></path>';

// Function to find connections between rectangles based on paths
function findConnections(rectangles, paths) {
  const connections = [];
  const processedPaths = new Set();

  for (const rect of rectangles) {
    for (const path of paths) {
      // Check if path is already processed
      if (processedPaths.has(path)) {
        continue;
      }

      // Check if path connects with current rectangle
      const pathRect1Connection = checkIfPathInRectangle(path, rect);

      if (pathRect1Connection) {
        // Check if path connects with other rectangles
        for (const otherRect of rectangles) {
          if (otherRect !== rect) {
            const pathRect2Connection = checkIfPathInRectangle(path, otherRect);
            if (pathRect2Connection) {
              // If both rectangles are connected by the same path, add to connections
              connections.push({ rect1, rect2: otherRect, path });
              processedPaths.add(path);
              break;
            }
          }
        }
      }
    }
  }

  return connections;
}

// Usage
const connections = findConnections([rect1, rect2, rect3], [path1, path2]);
console.log(connections);


function extractBackgroundPageHTML(htmlString) {
  // Create a regular expression to match the content within the geBackgroundpage div
  const regex = /<div class="geBackgroundpage">(.*?)<\/div>/s;

  // Use the regular expression to extract the inner HTML
  const match = htmlString.match(regex);

  if (match && match[1]) {
      // Return the extracted HTML content
      return match[1];
  } else {
      // If geBackgroundpage class is not found, return null
      console.error('Element with class geBackgroundpage not found.');
      return null;
  }
}

// Path to the HTML file
const filePath = path.join(__dirname, 'drawio.html');

// Read the contents of the HTML file synchronously
const html = fs.readFileSync(filePath, 'utf8');

// Extract the HTML content using the function
const extractedHTML = extractBackgroundPageHTML(html);

console.log(extractedHTML); // Output the extracted HTML content
