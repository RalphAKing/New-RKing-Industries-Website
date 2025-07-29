// Select the box
const box = document.getElementById('myBox');

// Set background color
box.style.background = '#6c5ce7';

// Add "hellow world" text
const text = document.createElement('div');
text.className = 'hello-text';
text.textContent = 'hellow world';
box.appendChild(text);

// Function to create a cube in a corner
function addCube(cornerClass) {
  const cube = document.createElement('div');
  cube.className = 'cube ' + cornerClass;
  box.appendChild(cube);
}

// Add cubes to each corner
addCube('tl'); // top-left
addCube('tr'); // top-right
addCube('bl'); // bottom-left
addCube('br'); // bottom-right