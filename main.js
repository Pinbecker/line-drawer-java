// Create a canvas element and set its dimensions
const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// Get the canvas context for drawing
const ctx = canvas.getContext('2d');

// Variables to store the current drawing state
let isDrawing = false;
let currentLine = null;
let currentAnchorPoint = null;
let counter = 0;


// Add event listeners to the canvas
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('mouseup', onMouseUp, false);

// Add these variables to store existing lines and anchor points
const lines = [];
const anchorPoints = [];

const LINE_WIDTH = 2;
const ANCHOR_POINT_RADIUS = 5;
const ANCHOR_POINT_SNAP_DISTANCE = 10;

// Helper function to find the closest anchor point within a certain distance
function findClosestAnchorPoint(x, y, maxDistance) {
    // Your code to search through all existing anchor points and return the closest one within the specified distance will go here
    let closestPoint = null;
    let minDistance = maxDistance;
  
    anchorPoints.forEach(point => {
      const dx = x - point.x;
      const dy = y - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
  
    return closestPoint;
  }



  function drawLengthText(x1, y1, x2, y2, length) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
  
    // Calculate the slope of the line
    const slope = dy / dx;
  
    // Calculate the offset for the text based on the line's slope and the cursor position
    const offsetX = slope >= 0 ? -15 : 15;
    const offsetY = slope >= 0 ? -15 : 15;
  
    // Draw the length text with the offset
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(length.toFixed(2) + 'm', centerX + offsetX, centerY + offsetY);
  }
  
  

// Add a function to draw all existing lines and anchor points
function drawExistingLinesAndAnchorPoints() {
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
      drawLengthText(line.startX, line.startY, line.endX, line.endY, line.length);
    });
  
    anchorPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, ANCHOR_POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = point.type === 'end post' ? 'red' : 'blue';
      ctx.fill();
    });
}  


// Function to handle mouse down event
function onMouseDown(event) {
  // Your code to handle the start of a new line will go here
  const x = event.clientX - canvas.offsetLeft;
  const y = event.clientY - canvas.offsetTop;

  const existingAnchorPoint = findClosestAnchorPoint(x, y, ANCHOR_POINT_SNAP_DISTANCE);
  if (existingAnchorPoint) {
    currentAnchorPoint = existingAnchorPoint;
  } else {
    currentAnchorPoint = new AnchorPoint(x, y);
  }

  isDrawing = true;
}

// Function to handle mouse move event
function onMouseMove(event) {
  if (event.buttons !== 1) return; // Ensure the left mouse button is pressed
  event.preventDefault(); // Add this line
  // Your code to handle drawing the line as the mouse moves will go here
  if (!isDrawing) return;

  const x = event.clientX - canvas.offsetLeft;
  const y = event.clientY - canvas.offsetTop;

  // Clear the canvas and redraw all lines and anchor points
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawExistingLinesAndAnchorPoints();

  // Draw the current line
  ctx.beginPath();
  ctx.moveTo(currentAnchorPoint.x, currentAnchorPoint.y);
  ctx.lineTo(x, y);
  ctx.lineWidth = LINE_WIDTH;
  ctx.stroke();

  // Draw the length text for the current line
  const currentLineLength = currentAnchorPoint.distanceTo(x, y);
  drawLengthText(currentAnchorPoint.x, currentAnchorPoint.y, x, y, currentLineLength);

  // Print the length to the console every 10 meters
  if (currentLineLength - counter > 10) {
    console.log(`Current line length: ${currentLineLength.toFixed(2)} meters`);
    counter = currentLineLength;
  }
}

canvas.addEventListener('mousemove', onMouseMove, false);




// Function to handle mouse up event
function onMouseUp(event) {
  // Your code to handle the end of the line drawing and anchor point creation will go here
  if (!isDrawing) return;

  const x = event.clientX - canvas.offsetLeft;
  const y = event.clientY - canvas.offsetTop;

  const existingAnchorPoint = findClosestAnchorPoint(x, y, ANCHOR_POINT_SNAP_DISTANCE);
  const endAnchorPoint = existingAnchorPoint || new AnchorPoint(x, y);

  // Create a new line and connect it to the anchor points
// Replace the placeholder material and height values in the onMouseUp function
  const material = document.getElementById('material').value;
  const height = parseFloat(document.getElementById('height').value);
  const newLine = new Line(material, height, currentAnchorPoint.x, currentAnchorPoint.y, endAnchorPoint.x, endAnchorPoint.y);
  currentAnchorPoint.addConnectedLine(newLine);
  endAnchorPoint.addConnectedLine(newLine);

  lines.push(newLine);
  if (!existingAnchorPoint) {
    anchorPoints.push(currentAnchorPoint);
  }
  if (!existingAnchorPoint || existingAnchorPoint !== endAnchorPoint) {
    anchorPoints.push(endAnchorPoint);
  }

  drawExistingLinesAndAnchorPoints();


  updateTables();

  isDrawing = false;
  currentLine = null;
  currentAnchorPoint = null;
}

// Add a function to update the table with line and anchor point information
function updateTables() {
  const linesTableBody = document.getElementById('linesTableBody');
  const anchorPointsTableBody = document.getElementById('anchorPointsTableBody');

  // Clear existing rows
  linesTableBody.innerHTML = '';
  anchorPointsTableBody.innerHTML = '';

  // Populate the lines table
  lines.forEach((line, index) => {
    const row = linesTableBody.insertRow();
    row.insertCell().innerText = index + 1;
    row.insertCell().innerText = line.material;
    row.insertCell().innerText = line.height;
    row.insertCell().innerText = line.length.toFixed(2) + 'm';
  });

  // Populate the anchor points table
  const uniqueAnchorPoints = [...new Set(anchorPoints)];

  uniqueAnchorPoints.forEach((point, index) => {
    const row = anchorPointsTableBody.insertRow();

    const numberCell = row.insertCell(0);
    const typeCell = row.insertCell(1);
    const heightCell = row.insertCell(2);
    const materialCell = row.insertCell(3);

    numberCell.textContent = index + 1;
    typeCell.textContent = point.type;
    heightCell.textContent = point.height + " m";
    materialCell.textContent = point.material;
  });
}
